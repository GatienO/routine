# Routine - Product & Technical Reference

## Vue d'ensemble

**Routine** est une application mobile (iOS, Android, Web) qui transforme les tâches quotidiennes des enfants en expériences ludiques. Les parents créent des routines personnalisées, les organisent facilement, puis les enfants les lancent une par une ou en chaîne avec un système de récompenses positif.

- **Offline-first** : 100% local, aucun backend, aucun compte requis
- **Multi-enfants** : chaque enfant a son profil, ses routines et ses récompenses
- **Gamification positive** : étoiles, badges, séries, récompenses réelles
- **Parcours guidé** : écran récapitulatif, humeur, progression, célébration

---

## Fonctionnalités

### Espace Parent

| Fonction | Description |
|---|---|
| Profils enfants | Créer/modifier : nom, avatar, couleur, âge, doudou, passions |
| Création de routine | Nom, description, icône, couleur, catégorie, assignation à un ou plusieurs enfants |
| Étapes | Titre, icône, durée, consigne, obligatoire/facultatif, image, ordre |
| Catalogue | 27 modèles regroupés par packs avec âge conseillé, durée estimée et détail complet |
| Réorganisation | Réordonner les routines d'un enfant par glisser-déposer |
| Duplication | Dupliquer une routine pour le même enfant ou un autre |
| Fusion | Sélectionner plusieurs routines d'un même enfant et les fusionner en une seule |
| Activation/désactivation | Activer ou suspendre une routine |
| Import/export | Partage par deep link avec prévisualisation avant import |
| Récompenses réelles | Associer des étoiles à des récompenses physiques et les marquer comme offertes |
| Statistiques | Étoiles, séries, exécutions par routine et activité récente |
| Météo | Ville configurable ou géolocalisation automatique |

### Espace Enfant

| Fonction | Description |
|---|---|
| Sélection profil | Choix tactile du profil, sélection directe s'il n'y a qu'un enfant |
| Dashboard | Routines actives, météo, récompense en cours, humeur récente, série |
| Récapitulatif | Aperçu d'une routine avant lancement : étapes, durée totale, heure de fin estimée |
| Chaînage | Sélection de plusieurs routines pour les lancer à la suite |
| Humeur | Choix d'humeur avant départ pour adapter l'expérience |
| Exécution | Étape par étape avec timer circulaire, progression, heure de fin estimée |
| Allègement automatique | Les étapes facultatives sont retirées si l'humeur choisie est négative |
| Célébration | Confettis, étoiles gagnées, badges débloqués |
| Récompenses | Total d'étoiles, badges, séries, récompenses en cours et déjà offertes |
| Météo adaptative | Fond dynamique, conseils vestimentaires illustrés, messages jour/soir |

### Gamification

- **Étoiles** : 1 par étape obligatoire + bonus de routine complétée
- **Séries** : jours consécutifs avec au moins une routine terminée
- **7 badges** : première étoile, premières routines, séries et caps de progression
- **Récompenses réelles** : visibles côté parent et côté enfant avec barre d'avancement

### Météo

- API Open-Meteo sans clé
- Ville manuelle ou géolocalisation via `expo-location`
- Habillage visuel selon condition et jour/nuit
- Tenue conseillée illustrée avec icônes de vêtements personnalisées
- Variante spéciale soir/dodo avec accessoires de coucher
- Cache local AsyncStorage

---

## Architecture technique

### Stack

| Couche | Technologie | Version |
|---|---|---|
| Framework | Expo | 55.0.9 |
| Langage | TypeScript strict | 5.9 |
| Runtime | React / React Native | 19.2 / 0.83.2 |
| Routing | Expo Router | 55.0.8 |
| État | Zustand + AsyncStorage persist | 5.x |
| Animations | Reanimated | 4.2.1 |
| Gestes | react-native-gesture-handler | 2.30.0 |
| Icônes & SVG | Phosphor, OpenMoji, react-native-svg | 3.x / 15.15 |
| Médias | expo-image-picker | 55.0.16 |
| Météo | Open-Meteo API | - |
| Géolocalisation | expo-location | 55.1.6 |
| Tests | Jest + ts-jest | 29.7 |

### Structure du projet

```text
app/
  _layout.tsx
  index.tsx
  child/
    index.tsx
    home.tsx
    summary.tsx
    mood.tsx
    run.tsx
    celebration.tsx
    rewards.tsx
  parent/
    index.tsx
    add-child.tsx
    add-routine.tsx
    edit-routine.tsx
    catalog.tsx
    import.tsx
    stats.tsx
    rewards.tsx
src/
  components/
    avatar/
    rewards/
    routine/
    ui/
    weather/
  constants/
    avatar.ts
    profileCustomization.ts
    routineTemplates.ts
  services/
    sharing.ts
  stores/
    appStore.ts
    childrenStore.ts
    moodStore.ts
    realRewardStore.ts
    rewardStore.ts
    routineStore.ts
    weatherStore.ts
  types/
  utils/
```

### Stores Zustand

| Store | Persistance | Rôle |
|---|---|---|
| `appStore` | Oui | PIN, mode parent, enfant sélectionné, réglages météo |
| `childrenStore` | Oui | Profils enfants |
| `routineStore` | Oui | Routines, exécutions, chaîne en cours |
| `rewardStore` | Oui | Étoiles, streaks, badges |
| `moodStore` | Oui | Humeur récente par enfant |
| `realRewardStore` | Oui | Récompenses réelles |
| `weatherStore` | Cache local | Données météo courantes et rafraîchissement |

### Modèle de données

```typescript
Child {
  id, name, avatar, avatarConfig?, color, age, companion?, passions?, createdAt
}

Routine {
  id, childId, name, description?, icon, color, category, steps[],
  isActive, createdAt, updatedAt
}

RoutineStep {
  id, title, icon, color, durationMinutes, instruction,
  isRequired, order, mediaUri?
}

RoutineExecution {
  id, routineId, childId, startedAt, completedAt?,
  stepsCompleted[], earnedStars, mood?, stepDurations?
}
```

### Sécurité

- PIN parent local à 4 chiffres
- Aucune donnée envoyée sur un serveur
- Aucun compte ni analytics tiers
- Les routines partagées ne contiennent pas d'identité enfant

---

## Tests

- **5 suites** Jest
- Stores testés : enfants, routines, récompenses
- Services testés : partage
- Utilitaires testés : dates
