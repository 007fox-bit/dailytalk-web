import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export function database(path=':memory:'){
 const raw=new DatabaseSync(path);raw.exec('CREATE TABLE IF NOT EXISTS __local_migrations (name TEXT PRIMARY KEY)');
 for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())if(!raw.prepare('SELECT name FROM __local_migrations WHERE name=?').get(f)){raw.exec(readFileSync('drizzle/'+f,'utf8'));raw.prepare('INSERT INTO __local_migrations(name) VALUES (?)').run(f);}
 return {raw,prepare(query){const s=raw.prepare(query);function bound(args=[]){return {bind:(...a)=>bound(a),async first(){return s.get(...args)||null;},async run(){const info=s.run(...args);return {success:true,meta:{changes:info.changes}};},async all(){const results=s.all(...args);return {success:true,results,meta:{changes:Number(raw.prepare('SELECT changes() n').get().n)}};}};}return bound();},async batch(ops){raw.exec('BEGIN');try{const out=[];for(const op of ops)out.push(await op.all());raw.exec('COMMIT');return out;}catch(e){raw.exec('ROLLBACK');throw e;}}};
}
