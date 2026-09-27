import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const port = 9357;
const output = resolve('docs/ui-audit/page-01-routines/proposals');
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${resolve('.expo/e17-preview')}`], {stdio:'ignore', windowsHide:true});
const pause = ms => new Promise(r=>setTimeout(r,ms));
let socket;
try {
  for(let i=0;i<50;i++){try{await fetch(`http://127.0.0.1:${port}/json/version`);break;}catch{await pause(100);}}
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0; const pending=new Map();
  socket.addEventListener('message',e=>{const v=JSON.parse(e.data);if(pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1368,height:780,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:pathToFileURL(resolve('docs/ui-audit/page-01-routines/visuals/p01-e17-outfit-states-v2.html')).href});
  await pause(700);
  await mkdir(output,{recursive:true});
  for(const format of ['mobile','tablet']){
    for(const state of ['unavailable','empty']){
      const expression=`renderRoutineE17(${JSON.stringify({format,state})});document.getElementById('routine-e17-states').dataset.capture='compare';`;
      const evaluated=await send('Runtime.evaluate',{expression});
      if(evaluated.exceptionDetails)throw Error(JSON.stringify(evaluated.exceptionDetails));
      await pause(100);
      const data=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      await writeFile(resolve(output,`P01-E17-v2-${format}${state==='empty'?'-empty':''}.png`),Buffer.from(data.data,'base64'));
    }
  }
  const check=await send('Runtime.evaluate',{expression:"document.documentElement.scrollWidth <= innerWidth",returnByValue:true});
  console.log(JSON.stringify({captures:4,noHorizontalOverflow:check.result.value}));
} finally { socket?.close(); browser.kill(); }
