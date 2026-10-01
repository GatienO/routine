import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve('dist');
const evidence = resolve('docs/ui-audit/global-evidence-2026-10-01');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const requested = resolve(root, `.${pathname}`);
  if (requested !== root && !requested.startsWith(`${root}${sep}`)) { response.writeHead(403).end(); return; }
  const file = existsSync(requested) && statSync(requested).isFile() ? requested : join(root, 'index.html');
  response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(response);
});
await new Promise((resolveServer) => server.listen(0, '127.0.0.1', resolveServer));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const profileDir = await mkdtemp(join(tmpdir(), 'routine-background-'));
const port = 9500 + Math.floor(Math.random() * 100);
const browser = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
], { stdio: 'ignore' });
const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

try {
  await mkdir(evidence, { recursive: true });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); ready = true; break; } catch { await wait(100); }
  }
  if (!ready) throw new Error('Navigateur Edge indisponible');
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(baseUrl)}`, { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveSocket, reject) => { socket.addEventListener('open', resolveSocket, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!pending.has(message.id)) return;
    const { resolvePending, rejectPending } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? rejectPending(new Error(message.error.message)) : resolvePending(message.result);
  });
  const send = (method, params = {}) => new Promise((resolvePending, rejectPending) => {
    const id = ++nextId;
    pending.set(id, { resolvePending, rejectPending });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  };
  const click = (label) => evaluate(`(() => { const button = [...document.querySelectorAll('button,[role=button]')].find(x => (x.getAttribute('aria-label') || x.textContent || '').trim() === ${JSON.stringify(label)}); if (!button) return false; button.click(); return true; })()`);
  const viewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 1000 });
    await wait(180);
    const scrollWidth = await evaluate('document.documentElement.scrollWidth');
    if (scrollWidth > width) throw new Error(`Débordement horizontal ${width}px : ${scrollWidth}px`);
  };
  const navigate = async (path) => {
    await send('Page.navigate', { url: `${baseUrl}${path}` });
    await wait(550);
    if (await evaluate("location.pathname === '/pin'")) {
      for (const digit of ['0', '0', '0', '0']) if (!await click(digit)) throw new Error('Code de test refusé');
      await wait(450);
    }
  };
  const capture = async (name) => {
    await wait(400);
    const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await writeFile(join(evidence, name), Buffer.from(screenshot.data, 'base64'));
  };

  await viewport(390, 844);
  await send('Page.enable');
  await navigate('/routines');
  const date = new Date().toISOString();
  const child = { id: 'background-child', name: 'Emma', avatar: '🦊', color: '#95c9b8', age: 6, createdAt: date };
  const routine = { id: 'background-routine', childId: child.id, name: 'Routine du contrôle', icon: '🌞', color: '#95c9b8', category: 'morning', isActive: true, createdAt: date, updatedAt: date, steps: [{ id: 'background-step', title: 'Je prépare mon sac', icon: '🎒', color: '#95c9b8', durationMinutes: 2, minimumDurationMinutes: 0, instruction: '', isRequired: true, order: 0 }] };
  const execution = { id: 'background-execution', routineId: routine.id, childId: child.id, participantChildIds: [child.id], startedAt: date, stepsCompleted: [], earnedStars: 0 };
  const seed = {
    'app-store': { version: 2, state: { parentPin: '0000', themeMode: 'light', weatherCity: '', useGeolocation: false } },
    'local-profile-store': { version: 0, state: { profileId: 'local-BACKGROUND-AUDIT', profileName: 'Famille Audit', createdAt: date, onboardingActive: false, tutorialPromptPending: false } },
    'children-store': { version: 0, state: { children: [child] } },
    'routine-store': { version: 0, state: { routines: [routine], trashedRoutines: [], executions: [], currentExecution: execution, chainQueue: [], pendingStepOrders: {} } },
  };
  await evaluate(`(() => { const seed = ${JSON.stringify(seed)}; for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, JSON.stringify(value)); })()`);

  const routes = [
    ['routines', '/routines'], ['activities', '/activities'], ['parent', '/parent'],
    ['parent-routines', '/parent/routines'], ['parent-children', '/parent/children'],
    ['parent-calendar', '/parent/calendar'], ['child-summary', `/child/summary?routineIds=${routine.id}&childIds=${child.id}`],
    ['child-calendar', '/child/calendar/week'], ['child-run', '/child/run'],
  ];
  for (const theme of ['light', 'dark']) {
    await evaluate(`(() => { const app = JSON.parse(localStorage.getItem('app-store')); app.state.themeMode = ${JSON.stringify(theme)}; localStorage.setItem('app-store', JSON.stringify(app)); })()`);
    for (const [name, path] of routes) {
      await navigate(path);
      if (name === 'child-summary' && await evaluate("location.pathname !== '/child/summary'")) throw new Error(`Résumé enfant redirigé en thème ${theme}`);
      if (await evaluate("document.body.innerText.trim().length < 20")) throw new Error(`Écran vide : ${name} ${theme}`);
      await viewport(390, 844);
      await capture(`${name}-${theme}-390.png`);
      if (theme === 'light' && ['routines', 'activities', 'parent', 'child-summary'].includes(name)) {
        await viewport(768, 1024);
        await capture(`${name}-${theme}-768.png`);
      }
      console.log(`${name} ${theme}: ${await evaluate('location.pathname')}`);
    }
  }
  socket.close();
} finally {
  browser.kill();
  server.close();
  await Promise.race([rm(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }).catch(() => undefined), wait(2000)]);
}
process.exit(0);
