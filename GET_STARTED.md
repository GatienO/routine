# Get Started — Installation & Lancement

## Prérequis

| Outil | Version minimale | Installation |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | Inclus avec Node.js |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com) |

Optionnel pour tester sur appareil mobile :
- **Expo Go** (App Store / Play Store) — dernière version compatible SDK 55
- **iPad/iPhone** ou **Android** sur le même réseau Wi-Fi

---

## 1. Cloner le projet

```bash
git clone https://github.com/GatienO/routine.git
cd routine
```

## 2. Installer les dépendances

```bash
npm install
```

> Un script `postinstall` s'exécute automatiquement pour patcher Expo Web.

## 3. Lancer l'application

### Mode Web (recommandé pour tester)

```bash
npx expo start --web
```

L'app s'ouvre dans le navigateur à **http://localhost:8081**.

Pour y accéder depuis un **iPad/téléphone** sur le même Wi-Fi :
1. Trouver l'IP locale affichée dans le terminal (ex: `192.168.1.141`)
2. Ouvrir Safari/Chrome sur l'appareil : `http://192.168.1.141:8081`

### Mode natif avec Expo Go

```bash
npx expo start
```

Scanner le QR code affiché avec l'app **Expo Go** sur votre appareil.

> **Note Windows** : si `npx` échoue avec une erreur de policy PowerShell, utilisez `npx.cmd expo start --web` ou lancez depuis Git Bash.

### Mode Android / iOS spécifique

```bash
npx expo start --android   # Android
npx expo start --ios       # iOS (macOS requis)
```

---

## 4. Lancer les tests

```bash
npm test
```

5 suites, 34 tests (Jest + ts-jest).

---

## 5. Structure des commandes

| Commande | Description |
|---|---|
| `npm start` | Lance Metro bundler (choix plateforme interactif) |
| `npm run web` | Lance directement en mode web |
| `npm run android` | Lance sur émulateur/appareil Android |
| `npm run ios` | Lance sur simulateur iOS (macOS) |
| `npm test` | Exécute les tests unitaires |

---

## 6. Configuration

### Variables d'environnement

Aucune variable d'environnement requise. L'app est 100% locale et utilise l'API Open-Meteo (gratuite, sans clé).

### Fichiers de configuration

| Fichier | Rôle |
|---|---|
| `app.json` | Configuration Expo (nom, icônes, scheme, splash) |
| `tsconfig.json` | TypeScript strict + alias `@/*` → `src/*` |
| `babel.config.js` | Preset Expo + plugin Reanimated |
| `metro.config.js` | Configuration Metro bundler |
| `package.json` | Dépendances + scripts + config Jest |

---

## 7. Déploiement sur appareil (avancé)

### Option A — Expo Go (gratuit)
Installer Expo Go depuis l'App Store / Play Store, scanner le QR code du terminal.

### Option B — EAS Build (requiert Apple Developer $99/an)
```bash
npx eas-cli build --platform ios --profile preview
```
Installe le build via TestFlight ou lien de distribution interne.

### Option C — Web sur iPad/tablette (gratuit)
Lancer `npx expo start --web` et accéder via l'IP locale depuis Safari.

---

## Résolution de problèmes

| Problème | Solution |
|---|---|
| `npx.ps1 cannot be loaded` (Windows) | Utiliser `npx.cmd` au lieu de `npx`, ou lancer depuis Git Bash |
| Expo Go incompatible SDK 55 | Mettre à jour Expo Go depuis l'App Store |
| `crypto.randomUUID is not a function` (Web/Safari) | Déjà corrigé — l'app utilise un fallback automatique |
| Metro cache corrompu | `npx expo start --clear` |
| Port 8081 déjà utilisé | `npx expo start --web --port 8082` |
