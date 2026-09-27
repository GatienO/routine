# Préparation d’intégration — Shell et page Routines

## État vérifié

- Le shell global est monté dans `app/_layout.tsx`.
- La navigation basse est centralisée dans `AppBottomNavigation` et n’a pas besoin d’être recréée.
- Les trois destinations restent `Routines`, `Activités` et `Parent`.
- La protection PIN de Parent est gérée dans la navigation basse et doit être conservée telle quelle.
- Les routes historiques restent couvertes par `src/constants/navigation.ts`.
- Le thème clair/sombre est déjà persistant dans `appStore` et exposé par `useAppTheme`.
- La page Routines réelle possède déjà les données et actions nécessaires ; la refonte doit principalement recomposer leur présentation.

## Écart prototype → application

| Zone validée dans le prototype | Source actuelle | Travail d’intégration |
| --- | --- | --- |
| Header avec icône Routine seule | `AppBrandHeader.tsx` | Rendre le logo pressable vers `/routines` et retirer le texte visible. |
| Bouton unique soleil/lune | `ThemeModeControl.tsx` | Remplacer le radiogroupe à deux choix par un bouton 44 px qui bascule entre clair et sombre. |
| Navigation basse toujours visible sur les 3 espaces | `AppBottomNavigation.tsx` | Garder le composant et sa protection PIN ; ajuster seulement les dimensions/couleurs au prototype. |
| Météo pleine largeur avec tenue | météo inline de `RoutinesHomeScreen` + `OutfitPreparationOverlay` | Extraire une bannière réutilisable, conserver chargement, erreur, actualisation et réglages. |
| Routine principale à gauche | regroupement `routineGroups` de `RoutinesHomeScreen` | Conserver sélection, favoris, participants, durée, aperçu d’étapes et lancement. |
| Calendrier enfant de même hauteur à droite | bouton calendrier + `calendarStore`/`dashboardCalendar` | Créer une synthèse Aujourd’hui orientée enfant, cliquable vers `/child/calendar`, sans planning familial. |
| Autres routines + gestion/création | liste de `RoutinesHomeScreen` | Déplacer l’accès de gestion près du titre de la liste et préserver création, liste complète et lancement. |
| État reprise | `currentExecution` | Conserver la reprise prioritaire vers `/child/run`. |
| Ronds/galets décoratifs | `PastelOrbs` | Adapter le motif partagé sans bloquer les interactions ni coder une identité par enfant. |
| Fond intégral clair/sombre | `RootShell` + vues `flex: 1` | Vérifier que chaque couche utilise `colors.background` et couvre la hauteur disponible. |

## Fonctions à ne pas perdre

1. Regroupement d’une même routine pour plusieurs enfants.
2. Priorité des routines favorites dans la recommandation.
3. Lancement accompagné via `/child/summary` avec `routineIds` et `childIds`.
4. Reprise d’une exécution en cours via `/child/run`.
5. États sans routine, chargement météo et erreur météo.
6. Ouverture de la préparation vestimentaire et accès aux réglages météo.
7. Affichage progressif de la liste des autres routines.
8. Création et gestion parentales avec protection PIN.
9. Calendrier enfant : Maintenant, Après et décompte en dodos.
10. Navigation historique `/today`, `/explore` et `/parent/catalog`.

## Ordre d’intégration sûr

1. Refaire `AppBrandHeader` et simplifier `ThemeModeControl`.
2. Stabiliser la navigation basse sur mobile, tablette et desktop.
3. Extraire la bannière météo/tenue avec ses états réels.
4. Créer la carte synthétique du calendrier à partir des stores existants.
5. Recomposer `RoutinesHomeScreen` avec le breakpoint commun à 768 px.
6. Rebrancher reprise, lancement, gestion, création et superpositions.
7. Vérifier ensuite Activités et Parent sous le nouveau shell, sans les redessiner pendant cette étape.
8. Tester 320, 390, 768 et 1440 px, en clair et sombre, puis exécuter TypeScript et Jest.

## Points techniques déjà tranchés

- Aucun nouveau store.
- Aucun backend ni nouvelle dépendance.
- Aucun profil ou écran principal par enfant.
- Le calendrier reste un repère pour l’enfant accompagné, pas un planning familial.
- La météo explique comment s’habiller et conserve une configuration parentale.
- La barre basse reste la seule navigation principale textuelle.

## Référence de vérification avant intégration

- `npx tsc --noEmit` : réussi.
- `npm test -- --runInBand` : 16 suites et 109 tests réussis.
- Prototype : 16 captures responsive clair/sombre sans débordement horizontal.
- Tour rendu : Routines et Activités vérifiées dans l’application locale ; l’accès Parent mène correctement au verrou PIN.

## Intégration locale réalisée

- Header réduit à l’icône Routine, toujours cliquable vers `/routines`.
- Bouton unique soleil/lune avec préférence persistante.
- Navigation basse commune centrée et conservée sur Routines, Activités et Parent, avec garde PIN inchangée.
- Bandeau météo pleine largeur avec conseil, indicateurs détaillés sur grand écran, tenue proposée et panneau de réglage existant.
- Routine principale à gauche et calendrier enfant de même hauteur à droite dès 768 px ; empilement lisible en dessous sur mobile.
- Synthèse du calendrier branchée sur les données réelles : moments du jour et décompte en dodos.
- Reprise, lancement accompagné, regroupement multi-enfants, priorité des favoris, création, gestion et affichage progressif conservés.
- Enchaînement de plusieurs routines restauré dans une superposition secondaire, avec ordre de sélection explicite.
- Favori de routine de nouveau accessible depuis la gestion Parent.
- Actualisation météo restaurée au retour de l’application au premier plan.
- Fond et ronds pastel contenus sans débordement horizontal, en clair comme en sombre.
