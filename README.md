# Routine

Application mobile gamifiée qui transforme les tâches quotidiennes des enfants en aventures ludiques.

![Expo](https://img.shields.io/badge/Expo-55-blue) ![React Native](https://img.shields.io/badge/React%20Native-0.83-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![License](https://img.shields.io/badge/license-MIT-green)

## Fonctionnalités

- **Multi-enfants enrichi** - profils avec avatar, couleur, doudou et passions
- **Routines gamifiées** - écran récapitulatif, humeur, timer, progression et célébration
- **Chaînage de routines** - l'enfant peut lancer plusieurs routines à la suite
- **Récompenses** - étoiles, badges, séries et récompenses réelles
- **Catalogue guidé** - 27 modèles de routines avec durée, âge conseillé et aperçu détaillé
- **Gestion parent avancée** - duplication, fusion et réorganisation des routines
- **Météo adaptative** - conseils vestimentaires visuels selon météo, température et moment
- **Import/export** - partage par deep link avec prévisualisation avant import
- **Statistiques** - historique, étoiles et activité récente par enfant
- **100% offline** - aucun compte, aucun backend, données locales

## Démarrage rapide

```bash
git clone https://github.com/GatienO/routine.git
cd routine
npm install
npx expo start --web
```

L'app web sera accessible sur `http://localhost:8081`.

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Expo | 55.0.9 | Framework & build |
| React Native | 0.83.2 | UI cross-platform |
| TypeScript | 5.9 | Typage strict |
| Expo Router | 55.0.8 | Navigation file-based |
| Zustand | 5.x | State management |
| AsyncStorage | 2.2.0 | Persistance locale |
| Reanimated | 4.2.1 | Animations |
| Gesture Handler | 2.30.0 | Drag & interactions tactiles |
| Expo Image Picker | 55.0.16 | Images d'étapes |
| Open-Meteo API | - | Météo sans clé API |

## Structure

```text
app/                  # Écrans Expo Router
  parent/             # Dashboard parent
  child/              # Parcours enfant
    summary.tsx       # Récapitulatif avant lancement
src/
  components/         # UI, avatar, météo, récompenses
  constants/          # thèmes, modèles, personnalisation
  services/           # météo, partage
  stores/             # Zustand
  types/              # Types TypeScript
  utils/              # helpers
```

## Tests

```bash
npm test
```

5 suites de tests (stores, services, utils).

## Documentation

- [PRODUCT.md](PRODUCT.md) - Référence produit & technique
- [GET_STARTED.md](GET_STARTED.md) - Installation détaillée
- [USER_GUIDE.md](USER_GUIDE.md) - Guide utilisateur complet

## Licence

MIT
