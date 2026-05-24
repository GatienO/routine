# Routine

Routine est une application Expo / React Native / TypeScript qui aide les enfants à choisir, lancer et terminer leurs routines quotidiennes avec une expérience simple, visuelle et ludique.

L'app reste volontairement locale : pas de compte, pas de backend, Zustand + AsyncStorage pour la persistance.

![Expo](https://img.shields.io/badge/Expo-55-blue) ![React Native](https://img.shields.io/badge/React%20Native-0.83-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)

## Navigation actuelle

La navigation principale a été simplifiée en 3 espaces :

- **Routines** (`/routines`) : vue enfant principale, météo, recherche, filtres, sélection de routines, favoris, édition rapide et lancement d'une session.
- **Activités** (`/activities`) : expérience complète reprise de MiniActivites avec catalogue, recherche, filtres, surprise, favoris, historique et fiches détail.
- **Parent** (`/parent`) : gestion avancée des enfants, routines, récompenses, statistiques, calendrier, import/export, météo et paramètres.

Les anciennes routes importantes restent accessibles ou redirigées :

- `/today` redirige vers `/routines`
- `/explore` redirige vers `/activities`
- `/child` reste la vue source utilisée par `/routines`
- `/parent/catalog` ouvre maintenant `/parent/add-routine?catalog=1`

## Fonctionnalités

- **Routines enfant** : choix d'une ou plusieurs routines, aperçu des étapes, favoris, lancement en chaîne.
- **Cartes routines simplifiées** : actions rapides modifier, favori et ajouter à la session.
- **Création parent** : création manuelle, import, catalogue en superposition et ajout d'étapes depuis catalogue.
- **Catalogue de routines** : onglets par thème, cartes visuelles, import dans le formulaire avant sauvegarde.
- **Activités** : recherche libre, filtres avancés, surprise, favoris, historique, détail complet.
- **Calendrier enfant et parent** : événements, dodos, moments importants.
- **Récompenses** : étoiles, badges, récompenses réelles, progression.
- **Météo** : météo locale, conseils vestimentaires et affichage adapté.
- **Offline-first** : données locales, aucune API serveur propriétaire.

## Démarrage

```bash
npm install
npx expo start --web
```

L'app web est généralement disponible sur `http://localhost:8081`.

## Tests

```bash
npx tsc --noEmit
npm test -- --runInBand
```

La suite actuelle couvre les stores, services, utilitaires et filtres d'activités.

## Structure

```text
app/
  (tabs)/             # Routes principales : routines, activities, parent
  activities/         # Routes secondaires de l'espace Activités
  child/              # Parcours enfant et exécution des routines
  parent/             # Gestion parent
src/
  components/         # UI partagée, calendrier, météo, routine
  features/
    activities/       # Catalogue, filtres, store et écrans Activités
  screens/            # Écrans unifiés des onglets
  stores/             # Zustand + AsyncStorage
  services/           # Météo, partage, export
  constants/          # Thèmes, templates, icônes
  utils/              # Helpers
```

## Documentation

- [PRODUCT.md](PRODUCT.md) : état produit et architecture
- [USER_GUIDE.md](USER_GUIDE.md) : guide utilisateur
- [GET_STARTED.md](GET_STARTED.md) : installation et commandes
- [ROUTE_VERIFICATION.md](ROUTE_VERIFICATION.md) : routes et checklist
- [AGENTS.md](AGENTS.md) : guide pour agents IA génératifs
