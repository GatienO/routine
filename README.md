# 🎮 Routine

Application mobile gamifiée qui transforme les tâches quotidiennes des enfants en aventures ludiques.

![Expo](https://img.shields.io/badge/Expo-55-blue) ![React Native](https://img.shields.io/badge/React%20Native-0.83-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

- **Multi-enfants** — profils avec avatar, couleur et routines personnalisées
- **Routines gamifiées** — timer, étapes guidées, célébrations animées
- **Récompenses** — étoiles, badges, séries, récompenses réelles
- **Catalogue** — 20 modèles de routines prêts à l'emploi
- **Météo** — conseils vestimentaires adaptés (jour/nuit, température)
- **Bien-être** — exercices de respiration, humeur du jour
- **Import/export** — partage de routines via deep links
- **Statistiques** — historique et tendances par enfant
- **100% offline** — aucun compte, aucun backend, données locales

## 🚀 Démarrage rapide

```bash
# Cloner le repo
git clone https://github.com/GatienO/routine.git
cd routine

# Installer les dépendances
npm install

# Lancer en mode web
npx expo start --web

# Lancer sur mobile (Expo Go)
npx expo start
```

L'app web sera accessible sur `http://localhost:8081`.

## 🛠 Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Expo | 55.0.9 | Framework & build |
| React Native | 0.83.2 | UI cross-platform |
| TypeScript | 5.9 | Typage strict |
| Expo Router | 4.x | Navigation file-based |
| Zustand | 5.x | State management |
| AsyncStorage | 2.1.2 | Persistance locale |
| Reanimated | 4.2.1 | Animations |
| Phosphor Icons | 3.0.4 | Icônes UI |
| Open-Meteo API | — | Météo (sans clé API) |

## 📁 Structure

```
app/                  # Écrans (Expo Router)
  ├── parent/         # Dashboard parent (PIN protégé)
  └── child/          # Interface enfant
src/
  ├── components/     # Composants réutilisables
  ├── constants/      # Thèmes, badges, icônes
  ├── hooks/          # useTimer
  ├── services/       # Météo, partage
  ├── stores/         # Zustand (7 stores)
  ├── types/          # Types TypeScript
  └── utils/          # Dates, IDs
```

## 🧪 Tests

```bash
npm test
```

5 suites, 34 tests (stores, services, utils).

## 📖 Documentation

- [PRODUCT.md](PRODUCT.md) — Référence produit & technique
- [GET_STARTED.md](GET_STARTED.md) — Guide d'installation détaillé
- [USER_GUIDE.md](USER_GUIDE.md) — Guide utilisateur complet

## 📄 Licence

MIT
