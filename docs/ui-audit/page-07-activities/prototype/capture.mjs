import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = dirname(fileURLToPath(import.meta.url));
const pageUrl = `file:///${join(output, 'activities-ac.html').replaceAll('\\', '/')}`;
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9348;
const browser = spawn(chrome, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--remote-debugging-port=${port}`,`--user-data-dir=${join(tmpdir(),`codex-activities-prototype-${Date.now()}`)}`], { stdio: 'ignore' });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
for(let attempt=0;attempt<30;attempt+=1){try{await fetch(`http://127.0.0.1:${port}/json/version`);break}catch{await wait(100)}}

async function capture({name,query='',width,height}){
  const url=`${pageUrl}${query}`;
  const target=await(await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,{method:'PUT'})).json();
  const socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  let id=0;const pending=new Map();socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id||!pending.has(message.id))return;const request=pending.get(message.id);pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});socket.send(JSON.stringify({id:requestId,method,params}))});
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Page.enable');await send('Page.navigate',{url});await wait(250);
  const metrics=await send('Runtime.evaluate',{expression:'({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})',returnByValue:true});if(metrics.result.value.scrollWidth>width)throw new Error(`Débordement horizontal dans ${name}`);
  const screenshot=await send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(join(output,name),Buffer.from(screenshot.data,'base64'));socket.close();
}
const captures=[];for(const [width,height] of [[320,800],[390,844],[768,1024],[1440,1000]]){captures.push({name:`activities-ac-light-${width}x${height}.png`,width,height});captures.push({name:`activities-ac-dark-${width}x${height}.png`,query:'?theme=dark',width,height})}
for(const state of ['empty','long'])captures.push({name:`activities-ac-${state}-390x844.png`,query:`?state=${state}`,width:390,height:844});
for(const view of ['favorites','recent'])captures.push({name:`activities-ac-${view}-390x844.png`,query:`?view=${view}`,width:390,height:844});
captures.push({name:'activities-ac-recent-long-390x844.png',query:'?view=recent&state=long',width:390,height:844});
for(const overlay of ['filters','surprise','detail','completion'])captures.push({name:`activities-ac-${overlay}-390x844.png`,query:`?overlay=${overlay}`,width:390,height:844});
for(const overlay of ['filters','detail'])captures.push({name:`activities-ac-dark-${overlay}-390x844.png`,query:`?theme=dark&overlay=${overlay}`,width:390,height:844});
for(const item of captures)await capture(item);browser.kill();console.log(`${captures.length} captures vérifiées sans débordement horizontal.`);
