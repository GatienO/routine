import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const base=resolve('docs/ui-audit/page-01-routines');
const output=resolve(base,'proposals');
const port=9360;
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${resolve('.expo/tenue-preview')}`],{stdio:'ignore',windowsHide:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try {
  for(let i=0;i<50;i++){try{await fetch(`http://127.0.0.1:${port}/json/version`);break;}catch{await pause(100);}}
  const target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();
  socket.addEventListener('message',e=>{const v=JSON.parse(e.data);if(pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(v.error):p.resolve(v.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};

  const iconSource=await readFile('src/components/weather/ClothingIcon.tsx','utf8');
  const imageMap=Object.fromEntries([...iconSource.matchAll(/^  (\w+): \[\s*require\('(.+?)'\)/gm)].map(m=>[m[1],resolve('src/components/weather',m[2])]));
  const items=[['tshirt','T-shirt'],['tshirtML','T-shirt manches longues'],['pull','Pull'],['vesteLegere','Veste légère'],['manteau','Manteau'],['impermeable','Imperméable'],['pantalon','Pantalon'],['short','Short'],['robe','Robe'],['maillot','Maillot'],['chaussettes','Chaussettes'],['chaussures','Chaussures'],['bottes','Bottes'],['sandales','Sandales'],['bonnet','Bonnet'],['casquette','Casquette'],['echarpe','Écharpe'],['gants','Gants'],['lunettes','Lunettes'],['parapluie','Parapluie'],['pyjamaEte','Pyjama léger'],['pyjamaHiver','Pyjama chaud'],['bouteille','Bouteille'],['doudou','Doudou']];
  const data=[];
  for(const [itemId,label] of items){
    if(!imageMap[itemId])throw Error(`Asset manquant: ${itemId}`);
    const imageUrl='data:image/png;base64,'+(await readFile(imageMap[itemId])).toString('base64');
    const src=await evaluate(`(async()=>{const img=new Image();img.src=${JSON.stringify(imageUrl)};await img.decode();const c=document.createElement('canvas');const ratio=Math.min(128/img.width,128/img.height);c.width=Math.round(img.width*ratio);c.height=Math.round(img.height*ratio);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/webp',0.85);})()`);
    const provisional={vesteLegere:'🧥',impermeable:'🧥',maillot:'🩱',sandales:'🩴',bouteille:'💧'};
    data.push({id:itemId,label,src,emoji:provisional[itemId]??null});
  }
  const template=await readFile(resolve(base,'visuals/tenue-images-selection.template.html'),'utf8');
  const fragment=template.replace('__OUTFIT_DATA__',JSON.stringify(data));
  if(Buffer.byteLength(fragment)>1000000)throw Error('Fragment trop volumineux');
  const htmlPath=resolve(base,'visuals/tenue-images-selection.html');
  await writeFile(htmlPath,fragment,'utf8');
  await send('Page.enable');
  await send('Page.navigate',{url:pathToFileURL(htmlPath).href});
  await pause(300);
  await mkdir(output,{recursive:true});
  const metrics=[];
  for(const [name,format,theme,width,height] of [['mobile','mobile','light',816,790],['tablet','tablet','light',1160,850],['catalogue','catalogue','light',816,1240],['dark','mobile','dark',816,790],['small','mobile','light',320,1510]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await evaluate(`renderTenueComplete(${JSON.stringify({format,theme})});`);
    await evaluate(`document.body.style.background=${JSON.stringify(theme==='dark'?'#171B23':'#FFFFFF')}`);
    await pause(100);
    const measured=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,panels:[...document.querySelectorAll('.panel')].map(p=>({columns:getComputedStyle(p.querySelector('.grid')).gridTemplateColumns.split(' ').length,items:p.querySelectorAll('input').length,selected:p.querySelectorAll('input:checked').length,images:[...p.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0),border:getComputedStyle(p.querySelector('.item')).borderWidth}))})`);
    if(measured.scrollWidth>width||measured.panels.some(p=>p.items!==24||!p.images))throw Error(JSON.stringify(measured));
    if(measured.panels.some(p=>p.columns!==(name==='small'?2:3)||p.border!=='0px'))throw Error('Colonnes ou bordures incorrectes: '+JSON.stringify(measured));
    const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(resolve(output,`P01-E17-v5-${name}.png`),Buffer.from(screenshot.data,'base64'));
    metrics.push({name,...measured});
  }
  for(const width of [320,390,768,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
    await evaluate("renderTenueComplete({format:'mobile',theme:'light'})");
    const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth');
    if(overflow)throw Error(`Débordement ${width}`);
    const layout=await evaluate("[...document.querySelectorAll('.panel')].map(p=>({width:p.clientWidth,columns:getComputedStyle(p.querySelector('.grid')).gridTemplateColumns.split(' ').length}))");
    if(layout.some(p=>p.columns!==(p.width>=520?4:p.width>=350?3:2)))throw Error('Grille responsive incorrecte');
  }
  const interaction=await evaluate(`(()=>{const input=document.querySelector('input');input.click();const panel=input.closest('.panel');return {checked:input.checked,doneEnabled:!panel.querySelector('.done').disabled,count:panel.querySelector('.count').textContent};})()`);
  if(!interaction.checked||!interaction.doneEnabled)throw Error('Interaction de sélection non fonctionnelle');
  const reset=await evaluate(`(()=>{document.querySelector('[data-reset="0"]').click();return document.querySelectorAll('section:first-child input:checked').length===0;})()`);
  if(!reset)throw Error('Réinitialisation non fonctionnelle');
  await writeFile(resolve(output,'P01-E17-v5-checks.json'),JSON.stringify({bytes:Buffer.byteLength(fragment),metrics,interaction,reset},null,2),'utf8');
  console.log(JSON.stringify({images:5,articles:data.length,bytes:Buffer.byteLength(fragment),responsive:[320,390,768,1440],interaction,reset}));
} finally {socket?.close();browser.kill();}
