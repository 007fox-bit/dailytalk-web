import {readFileSync,writeFileSync,mkdirSync,readdirSync,cpSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),catalog=require('./lib/data.js');
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const assets={};
for(const name of readdirSync('public')){const ext=name.split('.').pop();assets['/'+name]={type:({html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'})[ext],data:readFileSync('public/'+name).toString('base64')};}
assets['/catalog.json']={type:'application/json; charset=utf-8',data:Buffer.from(JSON.stringify(catalog)).toString('base64')};
let libs='const modules={};\n';
for(const name of ['learning','gaokao-bank','extra-data','data'])libs+=`modules['./${name}']=(()=>{const module={exports:{}};const require=k=>modules[k];\n${readFileSync('lib/'+name+'.js','utf8')}\nreturn module.exports;})();\n`;
writeFileSync('dist/server/index.js',libs+readFileSync('server/worker.mjs','utf8')+'\nexport default createWorker('+JSON.stringify(assets)+', modules["./data"],modules["./learning"]);\n');
writeFileSync('dist/server/package.json','{"type":"module"}');
cpSync('.openai/hosting.json','dist/.openai/hosting.json');cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log(`Built ${catalog.scenes.length} scenes, ${Object.values(catalog.exercises).reduce((n,x)=>n+x.length,0)} questions and ${Object.keys(assets).length} assets.`);
