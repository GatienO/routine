import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(folder,'../../../..');
const names=['Check','Sparkle','GearSix','LockSimple','Moon','Sun','ArrowLeft','Backspace','Play','MagnifyingGlass','UsersThree','CalendarDots','ChartLineUp'];
const icons={};
for(const name of names){
 const source=fs.readFileSync(path.join(root,'node_modules/phosphor-react-native/src/defs',name+'.tsx'),'utf8');
 const section=source.match(/'regular',\s*<>([\s\S]*?)<\/>/);
 if(!section)throw new Error('Icône Regular absente : '+name);
 icons[name]=section[1].replace(/<Path/g,'<path').trim();
}
const template=fs.readFileSync(path.join(folder,'prototype.template.html'),'utf8');
fs.writeFileSync(path.join(folder,'prototype.html'),template.replace('__ICONS__',JSON.stringify(icons)));
console.log('Prototype G01 généré; icônes Phosphor Regular locales.');
