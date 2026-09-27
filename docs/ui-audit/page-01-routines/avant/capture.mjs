import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = dirname(fileURLToPath(import.meta.url));
await mkdir(output, { recursive: true });
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9349;
const browser = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(tmpdir(), `codex-routines-before-${Date.now()}`)}`,
], { stdio: 'ignore' });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const sampleChildren = { state: { children: [
  { id: 'child-emma', name: 'Emma', avatar: '👧', color: '#B8DFCF', age: 6, createdAt: '2026-09-15T00:00:00.000Z' },
  { id: 'child-gabriel', name: 'Gabriel', avatar: '👦', color: '#D8D0F2', age: 4, createdAt: '2026-09-15T00:00:00.000Z' },
] }, version: 0 };
const morningSteps = [
  ['step-rise', 'Je me lève', '🌤️', 3], ['step-toilet', 'Je vais aux toilettes', '🚽', 4],
  ['step-face', 'Je me lave le visage', '🫧', 3], ['step-dress', 'Je m’habille', '👕', 6],
].map(([id, title, icon, durationMinutes], order) => ({ id, title, icon, color: '#B8DFCF', durationMinutes, instruction: title, isRequired: true, order }));
const eveningSteps = [
  ['step-pyjama', 'Je mets mon pyjama', '🌙', 5], ['step-teeth', 'Je me brosse les dents', '🪥', 3],
].map(([id, title, icon, durationMinutes], order) => ({ id, title, icon, color: '#D8D0F2', durationMinutes, instruction: title, isRequired: true, order }));
const sampleRoutines = { state: { routines: [
  { id: 'routine-morning', childId: 'child-emma', name: 'Super matin', icon: '☀️', color: '#FFD8AE', category: 'morning', steps: morningSteps, isActive: true, isFavorite: true, createdAt: '2026-09-15T00:00:00.000Z', updatedAt: '2026-09-15T00:00:00.000Z' },
  { id: 'routine-evening', childId: 'child-gabriel', name: 'Soir tout doux', icon: '🌙', color: '#D8D0F2', category: 'evening', steps: eveningSteps, isActive: true, createdAt: '2026-09-15T00:00:00.000Z', updatedAt: '2026-09-15T00:00:00.000Z' },
], trashedRoutines: [], executions: [], currentExecution: null, chainQueue: [], pendingStepOrders: {} }, version: 0 };
for (let attempt = 0; attempt < 40; attempt += 1) {
  try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await wait(100); }
}

async function createSession(width, height, theme, firstStart = false, dataState = 'ready', overlay = '') {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('http://localhost:8081/routines')}`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:8081/routines' });
  await waitForBoot(send);
  const routineState = JSON.parse(JSON.stringify(sampleRoutines));
  if (dataState === 'empty') routineState.state.routines = [];
  if (dataState === 'resume') routineState.state.currentExecution = { id: 'execution-audit', routineId: 'routine-morning', childId: 'child-emma', participantChildIds: ['child-emma'], startedAt: '2026-09-15T07:30:00.000Z', stepsCompleted: ['step-rise'], earnedStars: 1 };
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('app-store', JSON.stringify({state:{parentPin:null,weatherCity:'',useGeolocation:false,themeMode:'${theme}'},version:2}));${firstStart ? `localStorage.removeItem('local-profile-store');localStorage.removeItem('children-store');localStorage.removeItem('routine-store');` : `localStorage.setItem('local-profile-store', JSON.stringify({state:{profileId:'local-AUDIT',profileName:'Famille Audit',createdAt:'2026-09-15T00:00:00.000Z',tutorialPromptPending:false,tutorialCompletedAt:'2026-09-15T00:00:00.000Z'},version:0}));localStorage.setItem('children-store', ${JSON.stringify(JSON.stringify(sampleChildren))});localStorage.setItem('routine-store', ${JSON.stringify(JSON.stringify(routineState))});`}location.reload()`,
  });
  await (firstStart ? waitForGate(send) : waitForContent(send));
  if (overlay) {
    const label = overlay === 'outfit' ? 'Adapter la tenue proposée' : 'Préparer plusieurs routines à la suite';
    await send('Runtime.evaluate', { expression: `document.querySelector('[aria-label="${label}"]')?.click()` });
    await wait(350);
  }
  return { socket, send };
}

async function waitForBoot(send) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const result = await send('Runtime.evaluate', {
      expression: `document.body?.innerText?.includes('Créez votre profil') || document.body?.innerText?.includes('PROCHAINE ROUTINE') || document.body?.innerText?.includes('MÉTÉO DU JOUR')`,
      returnByValue: true,
    });
    if (result.result.value) return;
    await wait(200);
  }
  throw new Error('L’application ne s’est pas rendue avant la capture.');
}

async function waitForGate(send) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const result = await send('Runtime.evaluate', {
      expression: `document.body?.innerText?.includes('Créez votre profil')`,
      returnByValue: true,
    });
    if (result.result.value) return;
    await wait(200);
  }
  throw new Error('Le profil de premier démarrage ne s’est pas affiché.');
}

async function waitForContent(send) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const result = await send('Runtime.evaluate', {
      expression: `document.body?.innerText?.includes('PROCHAINE ROUTINE') || document.body?.innerText?.includes('MÉTÉO DU JOUR')`,
      returnByValue: true,
    });
    if (result.result.value) return;
    await wait(200);
  }
  throw new Error('La page Routines ne s’est pas rendue avant la capture.');
}

async function capture({ width, height, theme, firstStart = false, dataState = 'ready', overlay = '' }) {
  const { socket, send } = await createSession(width, height, theme, firstStart, dataState, overlay);
  const variant = firstStart ? 'first-start-' : overlay ? `${overlay}-` : dataState === 'ready' ? '' : `${dataState}-`;
  const name = `routines-before-${variant}${theme}-${width}x${height}.png`;
  const metrics = await send('Runtime.evaluate', {
    expression: `(() => { const buttons=[...document.querySelectorAll('[role="button"],button,a')].map(el=>{const r=el.getBoundingClientRect();return {label:el.getAttribute('aria-label')||el.textContent?.trim(),width:Math.round(r.width),height:Math.round(r.height)}}).filter(x=>x.width&&x.height);return {innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,smallTargets:buttons.filter(x=>x.width<44||x.height<44)}})()`,
    returnByValue: true,
  });
  if (metrics.result.value.scrollWidth > width) throw new Error(`Débordement horizontal dans ${name}`);
  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  await writeFile(join(output, name), Buffer.from(screenshot.data, 'base64'));
  socket.close();
  return { name, ...metrics.result.value };
}

const measurements = [];
for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1024, 768], [1440, 1000]]) {
  measurements.push(await capture({ width, height, theme: 'light' }));
  measurements.push(await capture({ width, height, theme: 'dark' }));
}
measurements.push(await capture({ width: 320, height: 800, theme: 'light', firstStart: true }));
measurements.push(await capture({ width: 1440, height: 1000, theme: 'dark', firstStart: true }));
measurements.push(await capture({ width: 390, height: 844, theme: 'light', dataState: 'empty' }));
measurements.push(await capture({ width: 390, height: 844, theme: 'light', dataState: 'resume' }));
measurements.push(await capture({ width: 390, height: 844, theme: 'light', overlay: 'outfit' }));
measurements.push(await capture({ width: 390, height: 844, theme: 'light', overlay: 'chain' }));
measurements.push(await capture({ width: 768, height: 1024, theme: 'dark', overlay: 'chain' }));
await writeFile(join(output, 'measurements.json'), `${JSON.stringify(measurements, null, 2)}\n`, 'utf8');
browser.kill();
console.log(`${measurements.length} captures réelles enregistrées sans débordement horizontal.`);
