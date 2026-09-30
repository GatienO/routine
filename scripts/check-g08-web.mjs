import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = process.env.G08_URL ?? 'http://127.0.0.1:8096';
const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileDir = await mkdtemp(join(tmpdir(), 'routine-g08-'));
const port = 9400 + Math.floor(Math.random() * 100);
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
], { stdio: 'ignore' });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await wait(100); }
  }
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
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (await evaluate(expression)) return;
      await wait(150);
    }
    throw new Error(`Écran attendu absent : ${label}. Texte : ${String(await evaluate('document.body?.innerText')).slice(0, 700)}`);
  };
  const click = (label) => evaluate(`(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find(x => (x.getAttribute('aria-label') || x.textContent || '').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  const clickPrefix = (prefix) => evaluate(`(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find(x => (x.getAttribute('aria-label') || x.textContent || '').trim().startsWith(${JSON.stringify(prefix)})); if (!el) return false; el.click(); return true; })()`);
  const clickContains = (needle) => evaluate(`(() => { const el = [...document.querySelectorAll('button,[role="button"]')].find(x => (x.getAttribute('aria-label') || x.textContent || '').includes(${JSON.stringify(needle)})); if (!el) return false; el.click(); return true; })()`);
  const fillPlaceholder = (placeholder, value) => evaluate(`(() => { const el = [...document.querySelectorAll('input,textarea')].find(x => x.placeholder === ${JSON.stringify(placeholder)}); if (!el) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const navigate = async (path) => {
    await send('Page.navigate', { url: `${baseUrl}${path}` }); await wait(500);
    if (await evaluate("location.pathname === '/pin'")) {
      for (const digit of ['0', '0', '0', '0']) if (!await click(digit)) throw new Error('PIN fictif refusé');
      await wait(500);
    }
  };
  const reload = async () => { await send('Page.reload', { ignoreCache: true }); await wait(500); };
  const viewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 1000 });
    await wait(250);
    const scrollWidth = await evaluate('document.documentElement.scrollWidth');
    if (scrollWidth > width) throw new Error(`Débordement horizontal à ${width} px : ${scrollWidth} px`);
  };
  const shot = async (name) => {
    await wait(450);
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await writeFile(join('docs', 'ui-audit', 'lots', 'G08', name), Buffer.from(result.data, 'base64'));
  };

  await viewport(390, 844);
  await send('Page.enable');
  await navigate('/routines');
  await until('!!document.body', 'démarrage');
  const date = new Date().toISOString();
  const child = { id: 'audit-g08-child', name: 'Emma', avatar: '🦊', color: '#95c9b8', age: 6, createdAt: date };
  const seed = {
    'app-store': { version: 2, state: { parentPin: '0000', themeMode: 'light', weatherCity: '', useGeolocation: false } },
    'local-profile-store': { version: 0, state: { profileId: 'local-G08-AUDIT', profileName: 'Famille Audit', createdAt: date, onboardingActive: false, tutorialPromptPending: false } },
    'children-store': { version: 0, state: { children: [child] } },
    'routine-store': { version: 0, state: { routines: [], trashedRoutines: [], executions: [], currentExecution: null, chainQueue: [], pendingStepOrders: {} } },
  };
  await evaluate(`(() => { const seed = ${JSON.stringify(seed)}; for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, JSON.stringify(value)); })()`);
  await navigate('/parent/add-routine');
  await until("location.pathname === '/parent/add-routine' && document.body.innerText.includes('Créer une routine')", 'constructeur');
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1440, 900]]) {
    await viewport(width, height);
    await shot(`integration-builder-${width}.png`);
  }
  await viewport(390, 844);
  if (!await clickPrefix('Choisir le pictogramme de la routine')) throw new Error('Sélecteur routine absent');
  await until("document.body.innerText.includes('Trouver une icône')", 'sélecteur routine');
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1440, 900]]) {
    await viewport(width, height);
    await shot(`integration-picker-${width}.png`);
  }
  await viewport(320, 800);
  if (!await click('Voir plus d’icônes')) throw new Error('Pagination des pictogrammes absente');
  await until("document.body.innerText.includes('80 icônes sur 324')", 'pagination 80 icônes');
  await evaluate("[...document.querySelectorAll('button,[role=button]')].find(x => (x.getAttribute('aria-label') || '').includes('Voir plus d’icônes'))?.scrollIntoView()");
  await shot('integration-picker-scroll-320.png');
  await viewport(390, 844);
  if (!await fillPlaceholder('Soleil, dent, école…', 'girafe')) throw new Error('Recherche absente');
  await until("document.body.innerText.includes('1 icône sur 1')", 'recherche girafe');
  if (!await click('girafe')) throw new Error('Choix girafe absent');
  await until("document.body.innerText.includes('girafe') && !document.body.innerText.includes('Trouver une icône')", 'pictogramme routine choisi');
  if (!await fillPlaceholder('Ex. Prêt pour l’école', 'Routine G08 fictive')) throw new Error('Nom de routine absent');
  if (!await click('Nouvelle')) throw new Error('Nouvelle étape absente');
  await until("document.body.innerText.includes('Nouvelle étape')", 'éditeur étape');
  if (!await fillPlaceholder('Ex. Je prépare mon sac', 'Étape G08 fictive')) throw new Error('Nom étape absent');
  if (!await clickPrefix('Choisir le pictogramme de l’étape')) throw new Error('Sélecteur étape absent');
  await until("document.body.innerText.includes('Trouver une icône')", 'sélecteur étape');
  if (!await fillPlaceholder('Soleil, dent, école…', 'lion')) throw new Error('Recherche étape absente');
  await until("document.body.innerText.includes('1 icône sur 1')", 'recherche lion');
  if (!await click('lion')) throw new Error('Choix lion absent');
  if (!await click('Enregistrer l’étape')) throw new Error('Enregistrement étape absent');
  await until("document.body.innerText.includes('1 étape')", 'étape créée');
  if (!await click('Créer la routine')) throw new Error('Enregistrement routine absent');
  await until("location.pathname === '/parent/routines'", 'routine enregistrée');
  const savedRoutine = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.routines.find(x => x.name === 'Routine G08 fictive')");
  if (savedRoutine?.icon !== '🦒' || savedRoutine?.steps?.[0]?.icon !== '🦁') throw new Error(`Icônes non conservées : ${JSON.stringify(savedRoutine)}`);
  await reload();
  const reopenedRoutine = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.routines.find(x => x.name === 'Routine G08 fictive')");
  if (reopenedRoutine?.icon !== savedRoutine.icon || reopenedRoutine?.steps?.[0]?.icon !== savedRoutine.steps[0].icon) throw new Error('Icônes non conservées après rechargement');
  console.log('Routine and step saved/reloaded:', savedRoutine.icon, savedRoutine.steps[0].icon);
  await navigate(`/parent/edit-routine?id=${encodeURIComponent(savedRoutine.id)}`);
  await until("location.pathname === '/parent/edit-routine' && document.body.innerText.includes('Routine G08 fictive')", 'édition routine');
  if (!await clickPrefix('Choisir le pictogramme de la routine : girafe')) throw new Error('Icône routine réouverte absente');
  await until("document.body.innerText.includes('Trouver une icône')", 'sélecteur édition');
  if (!await fillPlaceholder('Soleil, dent, école…', 'éléphant')) throw new Error('Recherche édition absente');
  await until("document.body.innerText.includes('1 icône sur 1')", 'recherche éléphant');
  if (!await click('éléphant')) throw new Error('Choix éléphant absent');
  if (!await click('Enregistrer')) throw new Error('Enregistrer routine absent');
  await until("location.pathname === '/parent/routines'", 'édition enregistrée');
  await reload();
  const editedRoutine = await evaluate("JSON.parse(localStorage.getItem('routine-store')).state.routines.find(x => x.name === 'Routine G08 fictive')");
  if (editedRoutine?.icon !== '🐘' || editedRoutine?.steps?.[0]?.icon !== '🦁') throw new Error('Modification de routine non conservée');
  console.log('Routine edited/reloaded:', editedRoutine.icon);
  await navigate('/parent/children');
  await until("location.pathname === '/parent/children' && document.body.innerText.includes('Emma')", 'famille');
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1440, 900]]) {
    await viewport(width, height);
    await shot(`integration-family-${width}.png`);
  }
  await viewport(390, 844);
  if (!await clickContains('Emma6 ans')) throw new Error('Fiche enfant absente');
  await until("document.body.innerText.includes('Modifier les repères')", 'édition enfant');
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024]]) {
    await viewport(width, height);
    await shot(`integration-avatar-${width}.png`);
  }
  await viewport(390, 844);
  const avatarChoices = await evaluate("[...document.querySelectorAll('[aria-label^=\"Choisir \"]')].map(x => x.getAttribute('aria-label')).slice(0, 20)");
  if (avatarChoices.length < 16) throw new Error('Illustrations enfant manquantes');
  if (!await click(avatarChoices[15])) throw new Error('Dernière illustration inaccessible');
  if (!await click('Enregistrer')) throw new Error('Enregistrer enfant absent');
  await reload();
  const savedChild = await evaluate("JSON.parse(localStorage.getItem('children-store')).state.children.find(x => x.id === 'audit-g08-child')");
  console.log('Child avatar saved/reloaded:', savedChild?.avatar);
  if (!savedChild?.avatar || savedChild.avatar === '🦊') throw new Error('Avatar non conservé');
  await navigate('/parent/calendar');
  await until("location.pathname === '/parent/calendar' && document.body.innerText.includes('Préparer ce qui compte')", 'calendrier parent');
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1440, 900]]) {
    await viewport(width, height);
    await shot(`integration-calendar-${width}.png`);
  }
  await viewport(390, 844);
  if (!await click('Créer un repère')) throw new Error('Nouveau repère absent');
  await until("document.body.innerText.includes('Nouveau repère')", 'éditeur repère');
  await viewport(320, 800);
  await shot('integration-event-editor-320.png');
  await viewport(390, 844);
  if (!await fillPlaceholder('Ex. École, anniversaire, piscine', 'Repère G08 fictif')) throw new Error('Titre repère absent');
  if (!await clickPrefix('Choisir le pictogramme du repère')) throw new Error('Sélecteur repère absent');
  await until("document.body.innerText.includes('Trouver une icône')", 'sélecteur repère');
  if (!await fillPlaceholder('Soleil, dent, école…', 'girafe')) throw new Error('Recherche repère absente');
  await until("document.body.innerText.includes('1 icône sur 1')", 'recherche repère girafe');
  if (!await click('girafe')) throw new Error('Icône repère inaccessible');
  if (!await click('Ajouter le repère')) throw new Error('Ajout repère absent');
  await until("document.body.innerText.includes('Repère G08 fictif')", 'repère ajouté');
  await reload();
  const savedEvent = await evaluate("JSON.parse(localStorage.getItem('calendar-store')).state.events.find(x => x.title === 'Repère G08 fictif')");
  if (savedEvent?.icon !== '🦒') throw new Error('Icône de repère non conservée après rechargement');
  console.log('Calendar event saved/reloaded:', savedEvent.icon);
  await navigate('/parent/calendar');
  if (!await click('Modifier Repère G08 fictif')) throw new Error('Modification repère absente');
  await until("document.body.innerText.includes('Modifier le repère')", 'repère réouvert');
  if (!await clickPrefix('Choisir le pictogramme du repère : girafe')) throw new Error('Icône de repère réouverte absente');
  if (!await click('Catégorie Animaux')) throw new Error('Catégorie Animaux absente du repère');
  await until("document.body.innerText.includes('25 icônes sur 25')", '25 animaux');
  if (!await click('lion')) throw new Error('Lion absent du repère');
  if (!await click('Enregistrer')) throw new Error('Enregistrer repère absent');
  await reload();
  const editedEvent = await evaluate("JSON.parse(localStorage.getItem('calendar-store')).state.events.find(x => x.title === 'Repère G08 fictif')");
  if (editedEvent?.icon !== '🦁') throw new Error('Édition du repère non conservée');
  console.log('Calendar event edited/reloaded:', editedEvent.icon);
  await evaluate("(() => { const app = JSON.parse(localStorage.getItem('app-store')); app.state.themeMode = 'dark'; localStorage.setItem('app-store', JSON.stringify(app)); })()");
  await navigate('/parent/children');
  await until("location.pathname === '/parent/children'", 'famille sombre');
  for (const [width, height] of [[320, 800], [390, 844], [768, 1024]]) {
    await viewport(width, height);
    await shot(`integration-family-dark-${width}.png`);
  }
  await navigate('/parent/add-routine');
  await until("location.pathname === '/parent/add-routine'", 'constructeur sombre');
  await viewport(320, 800);
  await evaluate("[...document.querySelectorAll('button,[role=button]')].find(x => (x.getAttribute('aria-label') || '').startsWith('Choisir le pictogramme de la routine'))?.focus()");
  if (!await clickPrefix('Choisir le pictogramme de la routine')) throw new Error('Sélecteur sombre absent');
  await shot('integration-picker-dark-320.png');
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*cdn.jsdelivr.net*'] });
  if (!await fillPlaceholder('Soleil, dent, école…', 'licorne')) throw new Error('Recherche hors ligne absente');
  await until("document.body.innerText.includes('1 icône sur 1')", 'recherche hors ligne licorne');
  await wait(350);
  await shot('integration-picker-offline-320.png');
  if (!await evaluate("document.body.innerText.includes('🦄')")) throw new Error('Repli natif hors ligne absent');
  console.log('CDN blocked: native unicorn fallback visible.');
  await send('Network.setBlockedURLs', { urls: [] });
  const focused = await evaluate("(() => { const field = document.querySelector('[aria-label=\"Rechercher une icône\"]'); field?.focus(); return document.activeElement === field; })()");
  if (!focused) throw new Error('Champ de recherche non accessible au clavier');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await wait(200);
  if (await evaluate("document.body.innerText.includes('Trouver une icône')")) {
    await evaluate("document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))");
    await wait(200);
  }
  if (await evaluate("document.body.innerText.includes('Trouver une icône')")) throw new Error('Échap ne ferme pas le sélecteur');
  const restoredFocus = await evaluate("document.activeElement?.getAttribute('aria-label')");
  if (!restoredFocus?.startsWith('Choisir le pictogramme de la routine')) throw new Error(`Focus non rendu au pictogramme : ${restoredFocus}`);
  console.log('Escape closes picker and restores focus.');
  await navigate('/parent/calendar');
  await until("location.pathname === '/parent/calendar'", 'calendrier sombre');
  await shot('integration-calendar-dark-320.png');
  await navigate('/child/calendar/week');
  await until("location.pathname.includes('/child/calendar')", 'calendrier enfant');
  await viewport(320, 800);
  await shot('integration-child-calendar-320.png');
  await navigate('/activities');
  await until("location.pathname === '/activities'", 'activités');
  await shot('integration-activities-320.png');
  await evaluate(`(() => { const data = JSON.parse(localStorage.getItem('routine-store')); data.state.currentExecution = { id: 'audit-g08-execution', routineId: ${JSON.stringify(savedRoutine.id)}, childId: 'audit-g08-child', participantChildIds: ['audit-g08-child'], startedAt: new Date().toISOString(), stepsCompleted: [], earnedStars: 0 }; localStorage.setItem('routine-store', JSON.stringify(data)); })()`);
  await navigate('/child/run');
  await until("location.pathname === '/child/run' && document.body.innerText.includes('Étape G08 fictive')", 'exécution enfant');
  await shot('integration-run-dark-320.png');
  console.log('Dark 320/390/768 and picker scroll checked.');
  socket.close();
} finally {
  browser.kill();
  await Promise.race([rm(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }).catch(() => undefined), wait(2000)]);
}
process.exit(0);
