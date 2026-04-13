const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('[fix-web-export] dist/index.html not found.');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');

const patched = html.replace(
  /<script\b([^>]*\bsrc="\/_expo\/static\/js\/web\/[^"]+\.js"[^>]*)><\/script>/g,
  (match, attrs) => {
    const withModule = /\btype=/.test(attrs) ? attrs : ` type="module"${attrs}`;
    const withoutDefer = withModule.replace(/\sdefer\b/g, '');
    return `<script${withoutDefer}></script>`;
  }
);

if (patched === html) {
  console.warn('[fix-web-export] No Expo web script tag found to patch.');
  process.exit(0);
}

fs.writeFileSync(indexPath, patched, 'utf8');
console.log('[fix-web-export] Patched dist/index.html to use type="module".');
