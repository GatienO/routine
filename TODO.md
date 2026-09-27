# Todo Routine

## Badges et récompenses

- [x] Ajouter les activités dans la progression des badges.
- [x] Définir les événements donnant des points : routine terminée selon ses étapes; activité explicitement terminée ensemble = 1 étoile; aucun point pour favori, ouverture ou surprise.
- [x] Augmenter le nombre de badges disponibles pour varier les objectifs.
- [x] Ajouter des badges par intention : routines, activités, régularité et autonomie forte confirmée avec l’adulte à proximité.
- [x] Afficher clairement les badges débloqués et les prochains badges à gagner.
- [x] Vérifier que les récompenses restent locales avec Zustand et AsyncStorage.

## Calendrier

- [x] Revoir l'interface du calendrier enfant.
- [x] Revoir l'interface du calendrier parent.
- [x] Rendre les événements plus lisibles sur mobile.
- [x] Remplacer la navigation abstraite jour / semaine / mois par Maintenant, Demain, Dodos et Semaine; aucune grille mensuelle n'est exposée aux enfants.
- [x] Mettre en avant les routines, dodos, activités et moments importants.
- [x] Garder des actions simples : ajouter, modifier, supprimer, voir le détail.

## Vérifications

- [x] Vérifier l'UX mobile à 320, 390 et 768 px; corriger le portail local, l'en-tête compact et la grille Routines.
- [x] Lancer `npx tsc --noEmit`.
- [x] Lancer `npm test -- --runInBand` (16 suites, 106 tests).
