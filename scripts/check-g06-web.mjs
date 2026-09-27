import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.G06_URL ?? 'http://127.0.0.1:8093';
const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileDir = await mkdtemp(join(tmpdir(), 'routine-g06-'));
const port = 9398;
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
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(baseUrl)}`, { method: 'PUT' })).json();
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
  const reload = async () => { await send('Page.reload', { ignoreCache: true }); await wait(300); };
  const viewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
    await wait(150);
    const scrollWidth = await evaluate('document.documentElement.scrollWidth');
    if (scrollWidth > width) throw new Error(`Débordement horizontal à ${width} px : ${scrollWidth} px`);
  };
  const shot = async (name) => {
    await wait(500);
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await writeFile(join('docs', 'ui-audit', 'lots', 'G06', name), Buffer.from(result.data, 'base64'));
  };

  await viewport(390, 844);
  await send('Page.enable');
  await send('Page.navigate', { url: `${baseUrl}/routines` });
  await until('!!document.body', 'démarrage');
  const date = new Date().toISOString();
  const child = { id: 'audit-child', name: 'Emma', avatar: '🦊', color: '#95c9b8', age: 6, createdAt: date };
  const routine = { id: 'audit-routine', childId: child.id, name: 'Routine de test', icon: '☀️', color: '#95c9b8', category: 'morning', isActive: true, createdAt: date, updatedAt: date, steps: [
    { id: 'audit-step-1', title: 'Première étape de test', icon: '🧸', color: '#95c9b8', durationMinutes: 1, minimumDurationMinutes: 1, instruction: 'Une étape pour vérifier le parcours.', isRequired: true, order: 0 },
    { id: 'audit-step-2', title: 'Deuxième étape de test', icon: '📚', color: '#95c9b8', durationMinutes: 0, instruction: 'Terminer le parcours de test.', isRequired: true, order: 1 },
  ] };
  const execution = { id: 'audit-execution', routineId: routine.id, childId: child.id, participantChildIds: [child.id], startedAt: date, stepsCompleted: [], earnedStars: 0 };
  const seed = {
    'app-store': { version: 2, state: { parentPin: '1234', themeMode: 'light', weatherCity: '', useGeolocation: false } },
    'local-profile-store': { version: 0, state: { profileId: 'local-AUDIT', profileName: 'Famille Audit', createdAt: date, onboardingActive: false, tutorialPromptPending: false } },
    'children-store': { version: 0, state: { children: [child] } },
    'routine-store': { version: 0, state: { routines: [routine], trashedRoutines: [], executions: [], currentExecution: execution, chainQueue: [], pendingStepOrders: {} } },
  };
  await evaluate(`(() => { const seed = ${JSON.stringify(seed)}; for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, JSON.stringify(value)); })()`);
  await send('Page.navigate', { url: `${baseUrl}/child/run` });
  await until("location.pathname === '/child/run' && document.body.innerText.includes('Première étape de test')", 'première étape');
  await shot('integration-run-390.png');
  const remainingBefore = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.currentExecution.stepTimer.remainingSeconds");
  if (remainingBefore !== 60) throw new Error(`Durée initiale inattendue : ${remainingBefore}`);
  await viewport(320, 800);
  await shot('integration-run-320.png');
  await viewport(768, 1024);
  await shot('integration-run-768.png');
  await viewport(390, 844);
  if (!await click('Actions parent')) throw new Error('Actions parent absentes');
  await until("document.body.innerText.includes('Mode parent')", 'menu Parent');
  if (!await click('Mettre le minuteur en pause')) throw new Error('Pause absente');
  await until("document.body.innerText.includes('Minuteur en pause')", 'pause');
  const paused = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.currentExecution.stepTimer.remainingSeconds");
  await reload();
  await until("location.pathname === '/child/run' && document.body.innerText.includes('Minuteur en pause')", 'reprise en pause');
  const pausedAfter = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.currentExecution.stepTimer.remainingSeconds");
  if (pausedAfter !== paused) throw new Error(`Pause non conservée : ${paused} → ${pausedAfter}`);
  await shot('integration-run-paused.png');
  if (!await click('Actions parent')) throw new Error('Actions parent absentes après reprise');
  if (!await click('Reprendre le minuteur')) throw new Error('Reprise absente');
  await until("!document.body.innerText.includes('Minuteur en pause')", 'minuteur repris');
  await reload();
  await until("location.pathname === '/child/run' && document.body.innerText.includes('Première étape de test')", 'reprise en cours');
  const resumed = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.currentExecution.stepTimer");
  if (resumed.isPaused || !resumed.deadlineAt) throw new Error('Échéance non reprise');
  console.log('G06 web OK : étape et minuteur visibles; pause et reprise conservées après rechargement; 320/390/768 px vérifiés.');
  socket.close();
} finally {
  browser.kill();
  await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
