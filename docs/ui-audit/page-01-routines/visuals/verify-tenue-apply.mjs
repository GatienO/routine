import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const base=resolve('docs/ui-audit/page-01-routines');
const output=resolve(base,'proposals');
const port=9363;
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${resolve('.expo/tenue-apply')}`],{stdio:'ignore',windowsHide:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try {
  for(let i=0;i<50;i++){try{await fetch(`http://127.0.0.1:${port}/json/version`);break;}catch{await pause(500);}}
  const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();
  socket.addEventListener('message',e=>{const v=JSON.parse(e.data);if(pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};



  await mkdir(resolve(base,'integration'),{recursive:true});
  await send('Page.enable');await send('Network.enable');
  await send('Network.setBlockedURLs',{urls:['*open-meteo.com*']});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
  const waitFor=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(300);}throw Error('Timeout: '+expression);};
  const open=async()=>{await waitFor(`!!document.querySelector('[aria-label="Modifier la météo et les vêtements"]')`);await evaluate(`document.querySelector('[aria-label="Modifier la météo et les vêtements"]').click()`);await waitFor(`document.querySelectorAll('[role="checkbox"]').length===24`);await pause(300);};
  await send('Page.navigate',{url:'http://127.0.0.1:8094/routines'});await open();
  const routinesBefore=await evaluate(`localStorage.getItem('routine-store')`);
  const chosen=['tshirt','tshirtML','pull','vesteLegere','manteau','impermeable'];
  await evaluate(`[...document.querySelectorAll('[role="checkbox"][aria-checked="true"]')].forEach(x=>x.click())`);await pause(300);
  await evaluate(`[...document.querySelectorAll('[role="checkbox"]')].slice(0,6).forEach(x=>x.click())`);await pause(300);
  await evaluate(`document.querySelector('[aria-label="Tenue prête"]').click()`);await pause(400);
  const preview=()=>evaluate(`[...document.querySelectorAll('[data-testid^="weather-outfit-"]')].map(x=>x.getAttribute('data-testid').replace('weather-outfit-',''))`);
  if(JSON.stringify(await preview())!==JSON.stringify(chosen))throw Error('Preview does not match selection');
  await send('Page.reload');await waitFor(`document.querySelectorAll('[data-testid^="weather-outfit-"]').length===6`);
  if(JSON.stringify(await preview())!==JSON.stringify(chosen))throw Error('Reload lost selection');
  await open();
  if(await evaluate(`document.querySelectorAll('[role="checkbox"][aria-checked="true"]').length`)!==6)throw Error('Reopen lost selection');
  await evaluate(`document.querySelector('[role="checkbox"]').click()`);await pause(200);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await pause(400);
  if(JSON.stringify(await preview())!==JSON.stringify(chosen))throw Error('Dismiss changed applied selection');
  const measures=[];
  for(const width of [320,390,768]){await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});await pause(300);const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth');if(overflow)throw Error('Overflow');const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(resolve(base,'integration','applied-'+width+'.png'),Buffer.from(shot.data,'base64'));measures.push({width,overflow});}
  if(await evaluate(`localStorage.getItem('routine-store')`)!==routinesBefore)throw Error('Routine data modified');
  const result={selected:chosen,previewMatches:true,reload:true,reopen:true,cancel:true,routinesUnchanged:true,withoutWeather:true,measures};
  await writeFile(resolve(base,'integration/apply-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{socket?.close();browser.kill();}
