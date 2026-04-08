# Get Started - Installation & Lancement

## Prérequis

| Outil | Version minimale | Installation |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | Inclus avec Node.js |
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com) |

Optionnel pour tester sur appareil mobile :

- **Expo Go** dernière version compatible SDK 55
- **Téléphone / tablette** sur le même réseau Wi-Fi

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

Un script `postinstall` patche automatiquement Expo Web.

## 3. Lancer l'application

### Mode Web

```bash
npx expo start --web
```

L'app sera disponible sur **http://localhost:8081**.

### Mode natif avec Expo Go

```bash
npx expo start
```

Scannez ensuite le QR code avec **Expo Go**.

Si vous testez l'ajout d'images dans les étapes, l'app demandera l'autorisation d'accéder à la photothèque.

### Lancement direct Android / iOS

```bash
npx expo start --android
npx expo start --ios
```

`--ios` nécessite macOS.

> Note Windows : si `npx` est bloqué par PowerShell, utilisez `npx.cmd`.

---

## 4. Lancer les tests

```bash
npm test
```

Le projet contient **5 suites de tests**.

---

## 5. Commandes utiles

| Commande | Description |
|---|---|
| `npm start` | Lance Expo |
| `npm run web` | Lance directement en mode web |
| `npm run android` | Lance Android |
| `npm run ios` | Lance iOS |
| `npm test` | Exécute les tests |

---

## 6. Configuration

### Variables d'environnement

Aucune variable d'environnement n'est requise.

### Fichiers principaux

| Fichier | Rôle |
|---|---|
| `app.json` | Configuration Expo |
| `package.json` | Scripts, dépendances, Jest |
| `babel.config.js` | Preset Expo + plugin Reanimated |
| `metro.config.js` | Configuration Metro |
| `tsconfig.json` | TypeScript + alias `@/*` |

---

## 7. Notes utiles

- L'app fonctionne **sans backend**
- Les données sont stockées **localement**
- Le catalogue embarqué contient **27 modèles de routines**
- Les parcours récents incluent le **récapitulatif avant lancement**, le **chaînage de routines** et la **gestion parent avancée** (duplication, fusion, réorganisation)

---

## Résolution de problèmes

| Problème | Solution |
|---|---|
| `npx.ps1 cannot be loaded` | Utiliser `npx.cmd` |
| Expo Go incompatible | Mettre Expo Go à jour |
| Problème de cache Metro | `npx expo start --clear` |
| Port 8081 déjà utilisé | `npx expo start --web --port 8082` |
