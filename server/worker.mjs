const enc=new TextEncoder();
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const dayKey=(ms=Date.now())=>new Date(ms+28800000).toISOString().slice(0,10);
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store',...headers}});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function tokenFor(id,secret){const payload=id+'.'+(Date.now()+365*86400000);return payload+'.'+await sign(payload,secret);}
async function identity(req,env){const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('dt_learner='))?.slice(11);if(!token)return null;const [id,expiry,mac,...rest]=token.split('.');if(rest.length||!uuid.test(id)||Number(expiry)<Date.now()||mac?.length!==64)return null;const expected=await sign(id+'.'+expiry,env.SESSION_SECRET);let diff=0;for(let i=0;i<64;i++)diff|=mac.charCodeAt(i)^expected.charCodeAt(i);return diff?null:id;}
const isOwner=(req,env)=>Boolean(env.ANALYTICS_OWNER_EMAIL&&req.headers.get('oai-authenticated-user-id')&&req.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.ANALYTICS_OWNER_EMAIL.toLowerCase());
const initial=()=>({streak:0,answerCards:3,learned:[],favorites:[],xp:0,checkedDate:'',completedScenes:{},wrongBook:{},studyHistory:{},questionFeedback:[],dailyGoal:5,dailyActivity:{date:'',answered:0},session:null,analytics:true});
async function bodyOf(req){if(!req.headers.get('content-type')?.startsWith('application/json'))throw fail('需要 JSON 数据');const reader=req.body?.getReader();if(!reader)throw fail('缺少数据');const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();throw fail('请求过大',413);}chunks.push(value);}const bytes=new Uint8Array(size);let off=0;for(const c of chunks){bytes.set(c,off);off+=c.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw fail('数据格式错误');}}
function pick(bank){const groups=new Map();for(const q of bank){const key=q.sourceKey||q.before+'|'+q.after;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);}const sets=[...groups.values()];for(let i=sets.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[sets[i],sets[j]]=[sets[j],sets[i]];}return sets.slice(0,10).map(g=>g[crypto.getRandomValues(new Uint32Array(1))[0]%g.length].id);}
export function createWorker(assets,catalog,learning){
 const questions=new Map();for(const scene of catalog.scenes)for(const q of catalog.exercises[scene.id]||[])questions.set(q.id,{...q,sceneId:scene.id,sceneName:scene.name});
 async function action(req,env,id,b){
  if(!uuid.test(b.id)||!Number.isInteger(b.version))throw fail('操作编号无效');
  const row=await env.DB.prepare('SELECT * FROM learners WHERE id=?').bind(id).first();if(!row)throw fail('请刷新页面',401);
  const state=JSON.parse(row.state);if(state.lastAction===b.id)return json({state,version:row.version,result:state.lastResult});if(row.version!==b.version)return json({error:'另一页面已更新学习进度，请重试',state,version:row.version},409);
  if(Date.now()-row.updated<80)throw fail('操作过快，请稍后再试',429);
  let result={},event=null;const now=Date.now(),today=learning.todayKey();
  if(b.type==='start'){
   if(b.mode==='review'){const due=learning.getDueReviews(state).filter(x=>questions.has(x.id));if(!due.length)throw fail('暂无到期复习');state.session={id:crypto.randomUUID(),mode:'review',sceneId:'review',ids:due.slice(0,10).map(x=>x.id),index:0,correct:0,answered:false};}
   else{const scene=catalog.scenes.find(x=>x.id===b.sceneId);if(!scene)throw fail('场景不存在');state.session={id:crypto.randomUUID(),mode:'scene',sceneId:scene.id,ids:pick(catalog.exercises[scene.id]),index:0,correct:0,answered:false};}
   event={kind:'start',scene:state.session.sceneId};
  }else if(['answer','next','hint','report'].includes(b.type)){
   const s=state.session;if(!s||s.finished||s.id!==b.sessionId)throw fail('本轮已结束或已在其他页面切换，请重新开始',409);const q=questions.get(s.ids[s.index]);
   if(b.type==='answer'){
    if(s.answered)throw fail('本题已完成');if(typeof b.answer!=='string'||!b.answer.trim()||b.answer.length>150)throw fail('请填写答案');
    const correct=learning.isAnswerCorrect(b.answer,q);learning.recordAttempt(state,{id:q.sceneId,name:q.sceneName},q,correct,s.mode);s.answered=correct;s.hadWrong=s.hadWrong||!correct;if(correct){if(!s.hadWrong&&!s.hinted)s.correct++;state.completedScenes[q.sceneId]=Math.max(state.completedScenes[q.sceneId]||0,s.index+1);}
    result={correct,message:correct?'答对了！继续保持。':'再想一想，注意句中的搭配。'};event={kind:s.mode==='review'?'review':'answer',scene:q.sceneId,correct:correct?1:0};
   }else if(b.type==='hint'){if(s.answered)throw fail('本题已完成');if(state.answerCards<=0)throw fail('答案卡已用完，签到可领取');if(s.hinted)throw fail('本题已使用答案卡');state.answerCards--;s.hinted=true;result={answer:q.answer,message:'答案提示：'+q.answer};}
   else if(b.type==='report'){if(!state.questionFeedback.some(x=>x.id===q.id))state.questionFeedback.push({id:q.id,createdAt:now,status:'pending'});result={message:'已记录题目反馈，谢谢。'};}
   else{if(!s.answered)throw fail('先完成当前题目');s.index++;s.answered=false;s.hadWrong=false;s.hinted=false;if(s.index>=s.ids.length){s.finished=true;state.xp+=s.correct*10;state.answerCards++;learning.recordSession(state,s.mode,s.correct,s.ids.length);event={kind:'complete',scene:s.sceneId};}}
  }else if(b.type==='checkin'){if(state.checkedDate===today)throw fail('今天已经签到');state.streak=state.checkedDate===learning.addDays(today,-1)?state.streak+1:1;state.checkedDate=today;state.answerCards+=2;result={message:'签到成功，获得 2 张答案卡'};}
  else if(b.type==='card'){const card=catalog.cards[b.index];if(!card)throw fail('卡片不存在');const n=state.learned.indexOf(card.en);if(n>=0)state.learned.splice(n,1);else state.learned.push(card.en);}
  else if(b.type==='favorite'){if(!catalog.scenes.some(x=>x.id===b.sceneId))throw fail('场景不存在');const n=state.favorites.indexOf(b.sceneId);if(n>=0)state.favorites.splice(n,1);else state.favorites.push(b.sceneId);}
  else if(b.type==='goal'){if(![5,10,20,30].includes(b.value))throw fail('目标无效');state.dailyGoal=b.value;}
  else if(b.type==='consent'){if(typeof b.value!=='boolean')throw fail('设置无效');state.analytics=b.value;}
  else throw fail('未知操作');
  state.lastAction=b.id;state.lastResult=result;
  const consent=state.analytics&&req.headers.get('DNT')!=='1'&&req.headers.get('Sec-GPC')!=='1';
  const ops=[];
  if(event&&consent)ops.push(env.DB.prepare('INSERT INTO events (id,learner,day,created,kind,scene,correct) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM learners WHERE id=? AND version=?)').bind(b.id,id,dayKey(now),now,event.kind,event.scene,event.correct||0,id,b.version));
  ops.push(env.DB.prepare('UPDATE learners SET state=?,version=version+1,updated=?,consent=? WHERE id=? AND version=?').bind(JSON.stringify(state),now,consent?1:0,id,b.version));
  const out=await env.DB.batch(ops);if(!out.at(-1).meta?.changes)throw fail('学习记录已更新，请刷新后重试',409);
  return json({state,version:row.version+1,result});
 }
 async function summary(req,env){
  const days=Number(new URL(req.url).searchParams.get('days')||7);if(![1,7,30].includes(days))throw fail('日期范围无效');const end=dayKey(),start=dayKey(Date.now()-(days-1)*86400000);
  const r=await env.DB.batch([
   env.DB.prepare('SELECT COUNT(*) views,COUNT(DISTINCT learner) visitors FROM visits WHERE day BETWEEN ? AND ?').bind(start,end),
   env.DB.prepare("SELECT COUNT(DISTINCT learner) learners,SUM(CASE WHEN kind='start' THEN 1 ELSE 0 END) starts,SUM(CASE WHEN kind='complete' THEN 1 ELSE 0 END) completions,SUM(CASE WHEN kind IN ('answer','review') THEN 1 ELSE 0 END) attempts,SUM(correct) correct,SUM(CASE WHEN kind='review' THEN 1 ELSE 0 END) reviews FROM events WHERE day BETWEEN ? AND ?").bind(start,end),
   env.DB.prepare('SELECT day,COUNT(*) views,COUNT(DISTINCT learner) visitors FROM visits WHERE day BETWEEN ? AND ? GROUP BY day ORDER BY day').bind(start,end),
   env.DB.prepare("SELECT scene,COUNT(*) attempts,SUM(correct) correct FROM events WHERE day BETWEEN ? AND ? AND kind IN ('answer','review') GROUP BY scene ORDER BY attempts DESC").bind(start,end),
   env.DB.prepare('SELECT device,COUNT(*) visits FROM visits WHERE day BETWEEN ? AND ? GROUP BY device').bind(start,end),
   env.DB.prepare("SELECT substr(id,1,8) code,json_extract(state,'$.xp') xp,json_array_length(json_extract(state,'$.learned')) learned,json_extract(state,'$.streak') streak,updated FROM learners WHERE consent=1 AND updated>=? ORDER BY updated DESC LIMIT 100").bind(Date.parse(start+'T00:00:00+08:00'))
  ]);
  return json({start,end,days,overview:{...r[0].results[0],...r[1].results[0]},daily:r[2].results,scenes:r[3].results.map(x=>({...x,name:catalog.scenes.find(s=>s.id===x.scene)?.name||'错题复习'})),devices:r[4].results,progress:r[5].results,generatedAt:Date.now()});
 }
 return {async fetch(req,env){try{
  const path=new URL(req.url).pathname;
  if(path==='/api/admin/summary'){if(req.method!=='GET')throw fail('仅支持 GET',405);if(!isOwner(req,env))throw fail('仅网站所有者可查看数据',req.headers.get('oai-authenticated-user-id')?403:401);return await summary(req,env);}
  if(path.startsWith('/api/')){
   if(!env.DB||!env.SESSION_SECRET)throw fail('数据服务尚未配置',503);
   if(req.method==='POST'&&(req.headers.get('origin')!==env.SITE_ORIGIN||req.headers.get('sec-fetch-site')==='cross-site'))throw fail('不允许跨站提交',403);
   let id=await identity(req,env);
   if(path==='/api/bootstrap'&&req.method==='POST'){
    const b=await bodyOf(req);if(!uuid.test(b.visitId)||!['mobile','desktop'].includes(b.device))throw fail('访问数据无效');
    let row=id?await env.DB.prepare('SELECT * FROM learners WHERE id=?').bind(id).first():null;const now=Date.now();
    const enabled=b.analytics!==false&&req.headers.get('DNT')!=='1'&&req.headers.get('Sec-GPC')!=='1';
    if(!row){id=crypto.randomUUID();const state=initial();state.analytics=enabled;row={state:JSON.stringify(state),version:0};await env.DB.prepare('INSERT INTO learners (id,state,version,created,updated,consent) VALUES (?,?,0,?,?,?)').bind(id,row.state,now,0,enabled?1:0).run();}
    const state=JSON.parse(row.state);
    if(enabled&&state.analytics){const n=await env.DB.prepare('SELECT COUNT(*) n FROM visits WHERE learner=? AND day=?').bind(id,dayKey()).first();if(n.n<200)await env.DB.prepare('INSERT INTO visits (id,learner,day,created,device) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(b.visitId,id,dayKey(now),now,b.device).run();}
    const cookie='dt_learner='+await tokenFor(id,env.SESSION_SECRET)+'; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax'+(env.SITE_ORIGIN.startsWith('https:')?'; Secure':'');
    return json({state,version:row.version},200,{'Set-Cookie':cookie});
   }
   if(path==='/api/action'&&req.method==='POST'){if(!id)throw fail('请刷新以恢复学习会话',401);return await action(req,env,id,await bodyOf(req));}
   throw fail('接口不存在',404);
  }
  const admin=path==='/admin'||path==='/admin/'||path==='/admin.html';
  if(admin&&!isOwner(req,env)){if(!req.headers.get('oai-authenticated-user-id'))return new Response(null,{status:302,headers:{Location:'/signin-with-chatgpt?return_to=%2Fadmin','Cache-Control':'private, no-store'}});throw fail('仅网站所有者可查看数据',403);}
  if(!['GET','HEAD'].includes(req.method))throw fail('方法不允许',405);
  const key=path==='/'?'/index.html':admin?'/admin.html':path;const asset=assets[key];if(!asset)throw fail('页面不存在',404);
  return new Response(req.method==='HEAD'?null:Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)),{headers:{'Content-Type':asset.type,'Cache-Control':key.endsWith('.html')?'private, no-store':'public, max-age=300','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'"}});
 }catch(e){if(!e.status)console.error('DailyTalk request failed:',e.message);return json({error:e.status?e.message:'数据服务暂时不可用，请稍后重试'},e.status||503);}}};
}
