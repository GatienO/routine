# Routine — Product & Technical Reference

## Vue d'ensemble

**Routine** est une application mobile (iOS, Android, Web) qui transforme les tâches quotidiennes des enfants en expériences ludiques. Les parents créent des routines personnalisées, les enfants les exécutent de manière autonome avec un système de récompenses motivant.

- **Offline-first** : 100% local, aucun backend, aucun compte requis
- **Multi-enfants** : chaque enfant a son profil, ses routines, ses récompenses
- **Gamification positive** : étoiles, badges, séries — jamais de punition

---

## Fonctionnalités

### Espace Parent (protégé par PIN)

| Fonction | Description |
|---|---|
| Profils enfants | Créer/modifier : nom, avatar emoji, couleur, âge |
| Création de routine | Nom, icône, couleur, catégorie + étapes personnalisées |
| Étapes | Titre, icône, durée, consigne, obligatoire/facultatif, image, ordre |
| Catalogue | 20 modèles de routines prêts à l'emploi |
| Activation/désactivation | Activer ou suspendre une routine |
| Import/export | Partager des routines via deep link base64 |
| Récompenses réelles | Associer des étoiles à des récompenses physiques |
| Statistiques | Historique, tendances, streaks par enfant |
| Météo | Ville configurable + option géolocalisation |

### Espace Enfant

| Fonction | Description |
|---|---|
| Sélection profil | Avatar animé, sélection tactile |
| Dashboard | Routines actives, météo, récompense en cours |
| Exécution | Étape par étape avec timer circulaire et barre de progression |
| Humeur | Sélection d'humeur avant routine (adapte les encouragements) |
| Célébration | Confettis, animations, étoiles gagnées |
| Récompenses | Étoiles, badges débloqués, série en cours |
| Bien-être | Respiration, étirements, routine calme |
| Météo adaptative | Fond dégradé, tenue conseillée, messages adaptés jour/nuit |

### Gamification

- **Étoiles** : 1 par étape obligatoire + bonus routine complète
- **Séries** : jours consécutifs d'activité
- **7 badges** : Première étoile, Super départ, En feu (3j), Champion (10), Diamant (50), Fusée (7j), Légende (30j)
- **Récompenses réelles** : échangeables contre des étoiles

### Météo

- API Open-Meteo (Météo-France) — pas de clé API
- Géolocalisation GPS (expo-location) ou ville manuelle
- 7 conditions × 2 (jour/nuit) = 14 thèmes visuels
- Tenue vestimentaire adaptée température + météo + moment de la journée
- Cache AsyncStorage 30 min

---

## Architecture technique

### Stack

| Couche | Technologie | Version |
|---|---|---|
| Framework | Expo (React Native) | 55.0.9 |
| Langage | TypeScript (strict) | 5.9 |
| Runtime | React / React Native | 19.2 / 0.83.2 |
| Routing | Expo Router (file-based) | 55.0.8 |
| État | Zustand + AsyncStorage persist | 5.0 |
| Animations | React Native Reanimated | 4.2.1 |
| Icônes UI | Phosphor React Native | 3.0 |
| Icônes SVG | react-native-svg | 15.15 |
| Feedback | expo-haptics | 55.0 |
| Météo | Open-Meteo API (fetch) | — |
| Géolocation | expo-location | 55.1 |
| Tests | Jest + ts-jest | 29.7 |

### Structure du projet

```
app/                    # Écrans (Expo Router file-based)
  _layout.tsx           # Layout racine
  index.tsx             # Accueil (choix Parent/Enfant)
  pin.tsx               # Saisie PIN parent
  child/                # Espace enfant
    index.tsx           # Sélection profil
    home.tsx            # Dashboard enfant
    run.tsx             # Exécution routine
    mood.tsx            # Sélection humeur
    celebration.tsx     # Célébration fin de routine
    rewards.tsx         # Étoiles et badges
    wellness.tsx        # Routine calme / bien-être
  parent/               # Espace parent
    index.tsx           # Dashboard parent
    add-child.tsx       # Formulaire enfant
    add-routine.tsx     # Créer routine
    edit-routine.tsx    # Modifier routine
    catalog.tsx         # Catalogue de modèles
    import.tsx          # Import routine partagée
    stats.tsx           # Statistiques
    rewards.tsx         # Récompenses réelles
src/
  components/           # Composants réutilisables
    ui/                 # Button, Card, Avatar, Pickers, ProgressBar...
    routine/            # RoutineCard
    rewards/            # BadgeCard, Counters (Star, Fire → Phosphor)
    weather/            # WeatherCard, WeatherParticles, WeatherBadge
  constants/            # theme, badges, icons, moods, weatherThemes
  hooks/                # useTimer
  services/             # weather (Open-Meteo), sharing (import/export)
  stores/               # Zustand stores (7 stores persistés)
  types/                # TypeScript interfaces
  utils/                # date, id (UUID)
__tests__/              # 5 suites, 34 tests
__mocks__/              # expo-crypto mock
scripts/                # patch-expo-web
```

### Stores Zustand (tous persistés AsyncStorage)

| Store | Clé de persistence | Rôle |
|---|---|---|
| `appStore` | `app-storage` | PIN, mode parent, enfant sélectionné, réglages météo |
| `childrenStore` | `children-storage` | Profils enfants |
| `routineStore` | `routine-storage` | Routines, exécutions, exécution en cours |
| `rewardStore` | `reward-storage` | Étoiles, streaks, badges par enfant |
| `moodStore` | `mood-storage` | Humeur sélectionnée par enfant |
| `realRewardStore` | `real-reward-storage` | Récompenses réelles |
| `weatherStore` | — (non persisté) | Météo en cours + cache dans AsyncStorage |

### Modèle de données

```typescript
Child { id, name, avatar, color, age, createdAt }
Routine { id, childId, name, icon, color, category, steps[], isActive, createdAt, updatedAt }
RoutineStep { id, title, icon, color, durationMinutes, instruction, isRequired, order, mediaUri }
RoutineExecution { id, routineId, childId, startedAt, completedAt, stepsCompleted[], earnedStars, mood, stepDurations }
ChildRewards { childId, totalStars, currentStreak, longestStreak, completedRoutines, unlockedBadges[], lastCompletionDate }
Badge { id, name, icon, description, requirement, requirementType }
RealReward { id, childId, description, requiredStars, isClaimed, createdAt, claimedAt }
ShareableRoutine { version, routine }
```

### Sécurité

- PIN parent 4 chiffres (stocké localement)
- Aucune donnée envoyée sur un serveur
- Aucune donnée personnelle sensible (pas d'email, mot de passe, photo d'enfant)
- Routines partagées ne contiennent aucune info personnelle
- Aucun analytics tiers

---

## Tests

- **5 suites** / **34 tests** (Jest + ts-jest)
- Stores testés : `childrenStore`, `routineStore`, `rewardStore`
- Services testés : `sharing`
- Utils testés : `date`
