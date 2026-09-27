import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const base=resolve('docs/ui-audit/page-01-routines');
const output=resolve(base,'proposals');
const port=9362;
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${resolve('.expo/tenue-integration')}`],{stdio:'ignore',windowsHide:true});
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
  await send('Page.enable');
  if(process.env.WITHOUT_WEATHER){await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*open-meteo.com*']});await send('Page.addScriptToEvaluateOnNewDocument',{source:"Object.keys(localStorage).filter(k=>k.includes('weather-cache')).forEach(k=>localStorage.removeItem(k))"});}
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:8094/routines'});
  for(let i=0;i<120;i++){if(await evaluate(`!!document.querySelector('[aria-label="Modifier la météo et les vêtements"]')`))break;await pause(500);}
  await evaluate(`document.querySelector('[aria-label="Modifier la météo et les vêtements"]').click()`);
  await pause(600);
  const metrics=[];
  for(const width of [320,390,600,768]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});await pause(400);
    const m=await evaluate(`(()=>{const items=[...document.querySelectorAll('[role="checkbox"]')];const top=items[0]?.getBoundingClientRect().top;return {count:items.length,columns:items.filter(x=>Math.abs(x.getBoundingClientRect().top-top)<2).length,firstChecked:items[0]?.getAttribute('aria-checked'),selected:items.filter(x=>x.getAttribute('aria-checked')==='true').length,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
    if(m.count!==24||m.columns!==(width===320?2:width===600?4:3)||m.overflow)throw Error(JSON.stringify({width,...m}));
    await evaluate(`document.querySelector('[role="checkbox"]').click()`);await pause(500);
    if(await evaluate(`document.querySelector('[role="checkbox"]').getAttribute('aria-checked')`)===m.firstChecked)throw Error('Selection failed '+await evaluate(`document.body.innerText`));
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(resolve(base,'integration',(process.env.WITHOUT_WEATHER?'sans-meteo-':'')+width+'.png'),Buffer.from(shot.data,'base64'));
    await evaluate(`document.querySelector('[aria-label="Réinitialiser la sélection"]').click()`);await pause(500);
    if(!await evaluate(`document.querySelectorAll('[role="checkbox"][aria-checked="true"]').length===${m.selected}`))throw Error('Reset failed');
    metrics.push({width,...m,selection:true,reset:true});
  }
  await writeFile(resolve(base,process.env.WITHOUT_WEATHER?'integration/checks-sans-meteo.json':'integration/checks.json'),JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics));
} finally {socket?.close();browser.kill();}
