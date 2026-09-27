// Isolated browser origin: never reads or writes the family's localhost:8081 data.
import http from 'node:http';
const date = new Date().toISOString();
const child = { id: 'audit-child', name: 'Audit', avatar: '🦊', color: '#95c9b8', age: 6, createdAt: date };
const routine = { id: 'audit-routine', childId: child.id, name: 'Routine de test', icon: '☀️', color: '#95c9b8', category: 'morning', isActive: true, createdAt: date, updatedAt: date, steps: [
  { id: 'audit-step-1', title: 'Première étape de test', icon: '🧸', color: '#95c9b8', durationMinutes: 0, instruction: 'Une étape pour vérifier le parcours.', isRequired: true, order: 0 },
  { id: 'audit-step-2', title: 'Deuxième étape de test', icon: '📚', color: '#95c9b8', durationMinutes: 0, instruction: 'Terminer le parcours de test.', isRequired: true, order: 1 },
] };
const trashedRoutine = { ...routine, id: 'audit-trash', name: 'Routine à restaurer', deletedAt: date, expiresAt: new Date(Date.now() + 30 * 86400000).toISOString() };
const seed = {
  'app-store': { version: 2, state: { parentPin: '1234', weatherCity: '', useGeolocation: false, themeMode: 'light' } },
  'local-profile-store': { version: 0, state: { profileId: 'local-AUDIT', profileName: 'Famille de test', createdAt: date, tutorialPromptPending: false, tutorialCompletedAt: date } },
  'children-store': { version: 0, state: { children: [child] } },
  'routine-store': { version: 0, state: { routines: [routine], trashedRoutines: [trashedRoutine], executions: [], currentExecution: null, chainQueue: [], pendingStepOrders: {} } },
};
const bootstrap = `<script>if(location.hostname==='127.0.0.1'&&!localStorage.getItem('routine-audit-v2')){const seed=${JSON.stringify(seed).replace(/</g, '\\u003c')};for(const [key,value] of Object.entries(seed))localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('routine-audit-v2','1');}</script>`;
const port = Number(process.env.ROUTINE_AUDIT_PORT ?? 8094);
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
