// Revert the type="module" patch
const fs = require('fs');
const path = require('path');

const files = [
  path.join('node_modules', 'expo', 'node_modules', '@expo', 'cli', 'build', 'src', 'export', 'html.js'),
  path.join('node_modules', 'expo', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'serializeHtml.js'),
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf-8');
  c = c.replace(/type="module" src="/g, 'src="');
  fs.writeFileSync(f, c, 'utf-8');
  console.log('Reverted', f);
}
