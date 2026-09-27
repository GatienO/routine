import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const target=path.resolve(root,'.'+(pathname==='/'?'/prototype.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  const data=fs.readFileSync(target);
  res.setHeader('Content-Type',target.endsWith('.png')?'image/png':'text/html; charset=utf-8');res.end(data);
 }catch{res.writeHead(404);res.end('Introuvable')}
}).listen(8092,'127.0.0.1',()=>console.log('Prototype : http://127.0.0.1:8092'));
