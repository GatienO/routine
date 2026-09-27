# Historique fonctionnel — surface Routines

Date de vérification : 2026-09-14

Sources contrôlées : historique Git depuis le commit initial `a92d025`, anciennes implémentations de `app/child/index.tsx` et `src/screens/RoutinesScreen.tsx`, routes actuelles et stores encore actifs.

## Évolution de la page

### Avril 2026 — lanceur enfant gamifié

La page était construite autour d’un enfant sélectionné. Elle réunissait météo, badges, recherche, filtres, tri, favoris, sélection de plusieurs routines et lancement en chaîne. Les actions d’édition et de création étaient aussi exposées depuis cette surface.

### Mai 2026 — enrichissement puis séparation des destinations

La météo et la tenue ont gagné des recommandations détaillées. Le calendrier enfant, l’onboarding et une navigation Routines/Activités/Parent ont été ajoutés. Plusieurs écrans concurrents ont ensuite coexisté : ancien lanceur `/child`, accueil et nouvelle destination `/routines`.

### Septembre 2026 — reconstruction structurelle

La page personnelle par enfant a été supprimée. Routines est devenue un outil parental global : une routine principale, des participants transmis au lancement, Calendrier et Météo comme outils contextuels, puis un LaunchFlow accompagné. Recherche, filtres et édition ont été déplacés dans Parent.

## Registre de conservation

| Fonction historique | Situation actuelle | Décision |
| --- | --- | --- |
| Choisir un enfant avant usage | Remplacé par le choix explicite des participants dans LaunchFlow | Conservé sous une forme conforme au produit |
| Lancer une routine | Action principale de la carte mise en avant | Conservé |
| Prévisualiser étapes et durée | Trois étapes, nombre total et durée visibles | Conservé |
| Reprendre une routine en cours | Carte de reprise et exécution persistée | Conservé et renforcé |
| Plusieurs enfants pour une routine identique | Routines identiques regroupées, participants transmis ensemble | Conservé et simplifié |
| Météo au chargement | Carte contextuelle avec chargement, erreur et repli | Conservé |
| Préparer les vêtements | Superposition météo/tenue et étapes guidées | Conservé et enrichi |
| Calendrier | Petit outil du jour puis expérience accompagnée | Conservé et recentré sur le temps enfant |
| Humeur et présence | Étapes du LaunchFlow, une fois la routine choisie | Conservé et déplacé |
| Récompenses et badges | Parent → Progrès; confirmation après une activité | Conservé et déplacé hors navigation enfant |
| Créer et modifier une routine | Parent → Routines et constructeur guidé | Conservé et déplacé |
| Recherche de routines | Parent → Routines | Conservé et déplacé |
| Filtres par enfant et statut | Parent → Routines | Conservé et déplacé |
| Activer ou mettre en pause | Parent → Routines | Conservé et déplacé |
| Dupliquer et mettre à la corbeille | Panneau d’actions Parent | Conservé et sécurisé |
| Catalogue d’étapes et modèles | Superpositions du constructeur | Conservé |
| Pagination du grand catalogue | Remplacée par une courte liste sur Routines; gestion complète dans Parent | Remplacé sans perte métier |
| Fond dynamique selon la météo | Retiré pour stabiliser clair/sombre et la lisibilité | Abandon visuel volontaire |
| Page et identité permanentes par enfant | Supprimées selon la décision produit | Abandon volontaire |
| Favori d’une routine | Le store et la priorité de recommandation existent, mais plus aucun contrôle ne permet de changer le favori | **Écart à corriger** |
| Lancer plusieurs routines en chaîne | Le store et LaunchFlow savent encore le faire, mais aucun accès actuel ne transmet plusieurs routines | **Écart à corriger** |
| Actualiser la météo au retour de l’app | Présent dans l’ancien lanceur; le nouvel écran actualise surtout au montage/configuration | **Écart à corriger** |
| Tri alphabétique/récent | Retiré; recherche et filtres couvrent l’usage courant | À remettre seulement dans Parent si le volume le justifie |

## Composants exploratoires jamais devenus des contrats produit

`WeeklyProgress`, `TodayBanner`, l’ancien `MoodPicker` superposé et l’ancien `OutfitChecklist` existent ou ont existé comme essais isolés. Ils ne doivent pas être réintroduits tels quels : progression, humeur et tenue disposent maintenant de parcours canoniques plus cohérents.

## Garde-fou pour l’intégration graphique

La refonte ne doit pas remettre les outils de gestion dans l’accueil Routines. Les trois écarts importants seront restaurés discrètement : favori dans la gestion Parent, enchaînement via une action secondaire, actualisation météo au retour au premier plan.
