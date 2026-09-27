// Isolated browser origin: never reads or writes the family's localhost:8081 data.
import http from 'node:http';
const date = new Date().toISOString();
const themeMode = process.env.G06_THEME === 'dark' ? 'dark' : 'light';
const routineName = process.env.G06_LONG_NAME
  ? 'Une très longue routine du matin pour préparer tranquillement toute la famille'
  : 'Routine de test';
const child = { id: 'audit-child', name: 'Audit', avatar: '🦊', color: '#95c9b8', age: 6, createdAt: date };
const routine = { id: 'audit-routine', childId: child.id, name: routineName, icon: '☀️', color: '#95c9b8', category: 'morning', isActive: true, createdAt: date, updatedAt: date, steps: [
  { id: 'audit-step-1', title: 'Première étape de test', icon: '🧸', color: '#95c9b8', durationMinutes: 1, minimumDurationMinutes: 1, instruction: 'Une étape pour vérifier le parcours.', isRequired: true, order: 0 },
  { id: 'audit-step-2', title: 'Deuxième étape de test', icon: '📚', color: '#95c9b8', durationMinutes: 0, instruction: 'Terminer le parcours de test.', isRequired: true, order: 1 },
] };
const nextRoutine = {
  ...routine,
  id: 'audit-next-routine',
  name: 'Suite de test',
  icon: '🎒',
  steps: [{ id: 'audit-next-step', title: 'Dernière action', icon: '🎒', color: '#95c9b8', durationMinutes: 0, instruction: 'Vérifier la suite.', isRequired: true, order: 0 }],
};
const trashedRoutine = { ...routine, id: 'audit-trash', name: 'Routine à restaurer', deletedAt: date, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() };
const seed = {
  'app-store': { version: 2, state: { parentPin: '1234', weatherCity: '', useGeolocation: false, themeMode } },
  'local-profile-store': { version: 0, state: { profileId: 'local-AUDIT', profileName: 'Famille de test', createdAt: date, tutorialPromptPending: false, tutorialCompletedAt: date } },
  'children-store': { version: 0, state: { children: [child] } },
  'routine-store': { version: 0, state: { routines: [routine, nextRoutine], trashedRoutines: [trashedRoutine], executions: [], currentExecution: null, chainQueue: [], pendingStepOrders: {} } },
};
const bootstrap = `<script>if(location.hostname==='127.0.0.1'&&!localStorage.getItem('routine-audit-g06')){const seed=${JSON.stringify(seed).replace(/</g, '\\u003c')};for(const [key,value] of Object.entries(seed))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('routine-audit-g06','1');}</script>`;
const port = Number(process.env.ROUTINE_AUDIT_PORT ?? 8095);
http.createServer((req, res) => {
  const upstream = http.request({ hostname: '127.0.0.1', port: 8081, path: req.url, method: req.method, headers: { ...req.headers, host: 'localhost:8081', 'accept-encoding': 'identity' } }, (response) => {
    const headers = { ...response.headers, 'cache-control': 'no-store' };
    if (String(headers['content-type']).includes('text/html')) {
      const parts = [];
      response.on('data', (part) => parts.push(part));
      response.on('end', () => { const body = Buffer.concat(parts).toString().replace('<head>', `<head>${bootstrap}`); delete headers['content-length']; res.writeHead(response.statusCode, headers); res.end(body); });
    } else { res.writeHead(response.statusCode, headers); response.pipe(res); }
  });
  upstream.on('error', () => { res.writeHead(502); res.end('Expo 8081 unavailable'); });
  req.pipe(upstream);
}).listen(port, '127.0.0.1', () => console.log(`Isolated audit fixture: http://127.0.0.1:${port}`));
