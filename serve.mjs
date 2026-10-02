import http from 'node:http';
import {mkdirSync} from 'node:fs';
import {database} from './tests/db.mjs';
import worker from './dist/server/index.js';
mkdirSync('.sites-runtime',{recursive:true});const DB=database('.sites-runtime/preview.sqlite');
const env={DB,SITE_ORIGIN:'http://127.0.0.1:4180',SESSION_SECRET:'local-preview-only-not-for-production',ANALYTICS_OWNER_EMAIL:'owner@local.test'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,env.SITE_ORIGIN);if(url.pathname==='/signin-with-chatgpt'){res.writeHead(302,{'Set-Cookie':'preview_owner=1; HttpOnly; SameSite=Lax; Path=/',Location:'/admin'});res.end();return;}if(url.pathname==='/signout-with-chatgpt'){res.writeHead(302,{'Set-Cookie':'preview_owner=; Max-Age=0; Path=/',Location:'/'});res.end();return;}
 const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(!k.startsWith('oai-authenticated-')&&v)headers.set(k,Array.isArray(v)?v.join(','):v);if(req.headers.cookie?.split(';').some(x=>x.trim()==='preview_owner=1')){headers.set('oai-authenticated-user-id','local-owner');headers.set('oai-authenticated-user-email',env.ANALYTICS_OWNER_EMAIL);}
 const chunks=[];for await(const c of req)chunks.push(c);const r=await worker.fetch(new Request(url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
 }catch(e){console.error(e.message);res.writeHead(500);res.end('Preview unavailable');}}).listen(4180,'127.0.0.1',()=>console.log('DailyTalk preview: http://127.0.0.1:4180 (local admin sign-in is simulated; production uses Sites identity)'));
