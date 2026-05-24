# Routine - Référence Produit et Technique

## Vision

Routine aide les familles à transformer les routines quotidiennes en parcours simples, visuels et encourageants. L'utilisateur ne doit pas sentir trois applications séparées, mais une seule app organisée par intention :

- choisir et lancer une routine
- trouver une activité
- gérer la configuration parent

## Espaces UX

### Routines

Route principale : `/routines`

La page reprend l'expérience enfant existante depuis `/child` et la rend centrale. Elle contient :

- météo et conseils du moment
- recherche et filtres
- cartes routines avec étapes visibles
- actions rapides : modifier, favori, ajouter à la session
- bouton de création de routine
- accès récompenses enfant
- bouton de lancement de session

Les cartes doivent rester lisibles : pas de longues explications, actions visibles, aperçu concret des étapes.

### Activités

Route principale : `/activities`

L'espace Activités reprend le fonctionnement de l'app MiniActivites :

- recherche libre
- filtres rapides et avancés
- liste de cartes activités
- mode Surprise
- favoris
- historique
- fiches détail
- persistance locale

Routes secondaires :

- `/activities/surprise`
- `/activities/favorites`
- `/activities/history`
- `/activities/activity-form`
- `/activities/result`
- `/activities/activity/[id]`

### Parent

Route principale : `/parent`

L'espace Parent regroupe la gestion :

- enfants
- routines
- création et édition
- catalogue de routines
- import/export
- calendrier avancé
- récompenses
- statistiques
- météo
- corbeille et paramètres

Le catalogue de routines n'est plus une page d'import direct. `/parent/catalog` redirige vers `/parent/add-routine?catalog=1`, où le catalogue s'ouvre en superposition. Choisir un modèle remplit le formulaire, puis le parent peut adapter avant d'enregistrer.

## Architecture

Le routage unifie l'expérience, mais les features restent séparées.

```text
app/
  (tabs)/routines.tsx
  (tabs)/activities.tsx
  (tabs)/parent.tsx
  activities/
  child/
  parent/
src/features/
  activities/
src/stores/
```

### Routines

Les routines restent gérées par `src/stores/routineStore.ts`.

Les routes enfant historiques sont conservées pour ne pas casser les flux :

- `/child`
- `/child/summary`
- `/child/run`
- `/child/rewards`
- `/child/calendar`

### Activités

La feature est dans `src/features/activities` :

- `activities.ts` : catalogue
- `activity-filter.ts` : recherche, filtres, tri
- `activity-store.ts` : favoris, historique, filtres
- `components/` : UI MiniActivites intégrée
- `screens/` : écrans routés par Expo Router

### Parent

La création de routine est dans `app/parent/add-routine.tsx`.

Logique de création actuelle :

1. Le parent peut partir d'un formulaire vide.
2. Il peut ouvrir le catalogue en modal.
3. Les thèmes du catalogue apparaissent en tabs.
4. Les routines du thème sont affichées en cartes.
5. Cliquer une carte remplit le formulaire.
6. Le parent ajuste puis enregistre.

## Contraintes techniques

- TypeScript strict
- Zustand pour l'état global
- AsyncStorage pour la persistance
- pas de backend
- pas de dépendance lourde sans nécessité
- routes historiques conservées ou redirigées
- UX mobile-first
- éviter les doublons de logique métier

## Commandes de vérification

```bash
npx tsc --noEmit
npm test -- --runInBand
```
