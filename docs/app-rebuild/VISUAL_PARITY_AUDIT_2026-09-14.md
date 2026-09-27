# Audit de fidélité à l'identité visuelle

Date : 2026-09-14

Références : maquette Routines validée et planche `Pastel utile` fournies par l'utilisateur.

## Erreur constatée

La première intégration a repris la palette et certains rayons, mais pas le système de composition complet. Le résultat pouvait donc employer les bonnes couleurs tout en ne ressemblant pas au projet validé.

## Fondations oubliées puis réintégrées

- [x] En-tête de marque blanc, stable et partagé.
- [x] Signe `R` dans un carré menthe arrondi avec chemin de trois points.
- [x] Promesse `Simple pour les parents, vivant avec les enfants`.
- [x] Sélecteur Clair / Sombre visible et volontaire.
- [x] Thème clair crème par défaut, pas le thème système sombre par défaut.
- [x] Grands ronds pastel lavande et ciel, partiellement hors cadre et placés derrière le contenu.
- [x] Navigation basse blanche, flottante, avec une seule destination active en menthe.
- [x] Rayons hiérarchisés : 14 pour les contrôles, 18 pour les panneaux, 22 pour les cartes principales.
- [x] Surfaces blanches bordées pour les outils parentaux.
- [x] Une seule grande action menthe par surface.
- [x] Trois couleurs fonctionnelles maximum visibles dans une même zone.
- [x] Suppression des animations décoratives dans les outils parentaux.

## Routines

- [x] Composition desktop/tablette `carte principale + outils contextuels`.
- [x] Grande carte `Prochaine routine` avec pictogramme, participants, étapes et durée.
- [x] Trois premières étapes visibles avant lancement.
- [x] Action pleine largeur `Lancer avec…`.
- [x] Calendrier en lavande et météo en ciel dans une colonne secondaire.
- [x] Autres routines repliées sous la proposition principale.
- [x] Ronds pastel visibles dans les espaces calmes de la page.

## Activités

- [x] Fondations globales et ronds pastel appliqués.
- [x] Cartes neutres avec petit signe pastel, sans grands aplats décoratifs.
- [x] Une activité mise en avant avant la collection.
- [x] Recherche, filtres et favoris maintenus comme outils secondaires.
- [x] Chargement progressif de la collection.
- [x] Corriger à l'affichage les accents historiques sans modifier les identifiants de filtre ni les données persistées.
- [x] Transformer Favoris et Récentes en états internes visibles.

## Parent

- [x] Fondations globales et ronds pastel appliqués.
- [x] Outils structurés par intention dans des surfaces neutres.
- [x] Apparence Clair / Sombre accessible depuis Réglages.
- [x] Migrer les sous-pages Parent prioritaires vers les fondations communes.
- [x] Remplacer les longues pages de gestion par liste + superposition responsive.

## Calendrier accompagné

- [x] Plus expressif que les outils Parent, sans tableau de bord enfant autonome.
- [x] Lavande pour Maintenant et menthe pour Après.
- [x] Grands pictogrammes et textes adaptés automatiquement à l'âge.
- [x] Enfants présents sélectionnés temporairement, sans page personnelle.
- [x] Ronds pastel discrets derrière l'expérience.
- [x] Contrôler précisément les formats mobiles 320 et 390 px.

## Météo et tenue

- [x] Ciel pour le constat et abricot pour la préparation.
- [x] Préparation en superposition responsive.
- [x] Ajustement limité à la tenue du jour.
- [x] Migrer la page de réglages météo historique vers les mêmes primitives.

## Règle de prévention

Toute nouvelle page doit désormais utiliser les primitives globales plutôt que réinterpréter la maquette :

- `AppBrandHeader` pour le shell principal ;
- `PastelOrbs` pour les ronds de fond ;
- `ThemeModeControl` pour Clair / Sombre ;
- `ResponsiveOverlay` pour les écrans superposés ;
- les tokens de `theme.ts` pour couleurs, rayons et espacements.

## File de migration visuelle restante

Priorité 1 — parcours visibles fréquemment :

- [x] `/parent/routines` — liste et gestion des routines.
- [x] `/parent/add-routine` et `/parent/edit-routine` — constructeur guidé.
- [x] `/parent/calendar` — configuration des repères en liste + overlay.
- [x] `/parent/weather` — réglages météo et horaires.

Priorité 2 — outils Parent réguliers :

- [x] `/parent/children` et `/parent/add-child` — gestion de la famille en panneaux.
- [x] `/parent/stats` et `/parent/rewards` — réunir sous Progrès.

Priorité 3 — outils occasionnels et nettoyage :

- [x] `/parent/import` et `/parent/trash`.
- [x] Retirer les anciens écrans `HomeScreen`, `ExploreScreen`, `RoutinesScreen` et `ParentDashboardScreen` après vérification des imports.
- [x] Supprimer les anciens composants calendrier sans route après stabilisation du nouveau calendrier accompagné.
