import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.G07_URL ?? 'http://127.0.0.1:8093';
const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileDir = await mkdtemp(join(tmpdir(), 'routine-g07-'));
const port = 9397;
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
], { stdio: 'ignore' });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); ready = true; break; } catch { await wait(100); }
  }
  if (!ready) throw new Error('Navigateur de test indisponible');
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/routines`)}`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let requestId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async (expression, label) => {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (await evaluate(expression)) return;
      await wait(150);
    }
    throw new Error(`Écran attendu absent : ${label}. Texte : ${String(await evaluate('document.body?.innerText')).slice(0, 500)}`);
  };
  const click = (label) => evaluate(`(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find(x => (x.getAttribute('aria-label') || x.textContent || '').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  const fill = (label, value) => evaluate(`(() => { const el = document.querySelector('[aria-label=${JSON.stringify(label)}]'); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const reload = async () => { await send('Page.reload', { ignoreCache: true }); await wait(300); };
  const shot = async (name) => {
    await wait(500);
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await writeFile(join('docs', 'ui-audit', 'lots', 'G07', name), Buffer.from(result.data, 'base64'));
  };
  const viewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
    await wait(100);
    const scrollWidth = await evaluate('document.documentElement.scrollWidth');
    if (scrollWidth > width) throw new Error(`Débordement horizontal à ${width} px : ${scrollWidth} px`);
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.enable');
  await send('Page.navigate', { url: `${baseUrl}/routines` });
  await until("location.pathname === '/onboarding/family' && document.body.innerText.includes('Bienvenue dans Routine')", 'famille');
  await viewport(320, 800);
  await shot('integration-family-320.png');
  await viewport(768, 1024);
  await shot('integration-family-768.png');
  await viewport(390, 844);
  if (!await fill('Nom de votre famille', 'Famille Audit')) throw new Error('Champ famille absent');
  if (!await click('Continuer')) throw new Error('Continuer absent');
  await until("location.pathname === '/pin' && document.body.innerText.includes('Créez votre code')", 'création PIN');
  await reload();
  await until("location.pathname === '/pin' && document.body.innerText.includes('Créez votre code')", 'reprise PIN');
  await shot('integration-pin.png');
  await viewport(320, 800);
  await shot('integration-pin-320.png');
  await viewport(768, 1024);
  await shot('integration-pin-768.png');
  await viewport(390, 844);
  if (!await click('Annuler')) throw new Error('Retour PIN absent');
  await until("location.pathname === '/onboarding/family' && document.querySelector('input[aria-label=\"Nom de votre famille\"]')?.value === 'Famille Audit'", 'retour famille');
  if (!await click('Continuer')) throw new Error('Reprendre le code absent');
  await until("location.pathname === '/pin' && document.body.innerText.includes('Créez votre code')", 'reprise code');
  for (const digit of ['0', '0', '0', '0']) await click(digit);
  await until("document.body.innerText.includes('Confirmez votre code')", 'confirmation PIN');
  for (const digit of ['0', '0', '0', '0']) await click(digit);
  await until("location.pathname === '/onboarding/child' && document.body.innerText.includes('Ajoutez votre premier enfant')", 'enfant');
  await shot('integration-child.png');
  await viewport(320, 800);
  await shot('integration-child-320.png');
  await viewport(768, 1024);
  await shot('integration-child-768.png');
  await viewport(390, 844);
  await reload();
  await until("location.pathname === '/onboarding/child' && !!document.querySelector('input[aria-label=\"Prénom de l’enfant\"]')", 'reprise enfant');
  if (!await click('Retour à la famille')) throw new Error('Retour enfant absent');
  await until("location.pathname === '/onboarding/family'", 'retour famille depuis enfant');
  if (!await click('Continuer')) throw new Error('Reprendre enfant absent');
  await until("location.pathname === '/onboarding/child' && !!document.querySelector('input[aria-label=\"Prénom de l’enfant\"]')", 'reprise enfant après retour');
  await evaluate("(() => { const app = JSON.parse(localStorage.getItem('app-store')); app.state.themeMode = 'dark'; localStorage.setItem('app-store', JSON.stringify(app)); })()");
  await reload();
  await until("location.pathname === '/onboarding/child' && !!document.querySelector('input[aria-label=\"Prénom de l’enfant\"]')", 'enfant sombre');
  await shot('integration-child-dark.png');
  await evaluate("(() => { const app = JSON.parse(localStorage.getItem('app-store')); app.state.themeMode = 'light'; localStorage.setItem('app-store', JSON.stringify(app)); })()");
  await reload();
  await until("location.pathname === '/onboarding/child' && !!document.querySelector('input[aria-label=\"Prénom de l’enfant\"]')", 'retour au thème clair');
  if (!await fill('Prénom de l’enfant', 'Emma')) throw new Error('Prénom absent');
  if (!await fill('Âge de l’enfant', '6')) throw new Error('Âge absent');
  if (!await click('Créer le profil enfant')) throw new Error('Création enfant absente');
  await until("location.pathname === '/onboarding/complete' && document.body.innerText.includes('Votre espace est prêt')", 'fin');
  await shot('integration-complete.png');
  await viewport(320, 800);
  await shot('integration-complete-320.png');
  await viewport(768, 1024);
  await shot('integration-complete-768.png');
  await viewport(390, 844);
  await reload();
  await until("location.pathname === '/onboarding/complete' && document.body.innerText.includes('Votre espace est prêt')", 'reprise fin');
  const count = await evaluate("JSON.parse(localStorage.getItem('children-store')).state.children.length");
  if (count !== 1) throw new Error(`Nombre d'enfants inattendu : ${count}`);
  if (!await click('Ouvrir l’accueil')) throw new Error('Ouvrir l’accueil absent');
  await until("location.pathname === '/routines'", 'accueil');
  await reload();
  await until("location.pathname === '/routines'", 'retour accueil après relance');
  console.log('G07 web OK : famille → PIN → enfant → fin → accueil; reprises et enfant unique vérifiés.');
  socket.close();
} finally {
  browser.kill();
  await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
