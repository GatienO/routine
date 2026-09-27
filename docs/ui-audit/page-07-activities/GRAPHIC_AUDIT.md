# Audit graphique — PAGE-07 — Activités

Date : 2026-09-15

## Objectif et périmètre

Permettre au parent de trouver en quelques secondes une activité adaptée au moment, puis de l’ouvrir et de l’accompagner sans transformer la page en catalogue technique. L’enfant n’utilise pas seul cette surface : il participe seulement à l’activité avec l’adulte.

À préserver sans modifier les contrats métier : recherche, filtres, surprise, favoris, historique, détail, confirmation de participation, attribution locale des étoiles, chargement progressif et redirections historiques.

Hors périmètre de cette page : gestion des enfants, règles de récompense, création d’activités, calendrier familial, backend et profil principal par enfant.

## Capture réelle et mesures

La page courante `/activities` a été contrôlée dans l’application locale, en clair, le 2026-09-15.

| Format | État contrôlé | Résultat |
| --- | --- | --- |
| 320 × 800 | Découvrir, Favoris vide, filtres, surprise, détail, participation | aucun débordement horizontal ; beaucoup de hauteur consommée avant le premier résultat |
| 390 × 844 | référence existante | lisible ; densité et hiérarchie encore génériques |
| 768 × 900 | Découvrir et filtres | grille 2 colonnes ; grand vide entre les outils et la collection |
| 1440 × 1000 | Découvrir | contenu très étiré ; suggestion principale trop vide ; seulement 2 colonnes |

Captures de référence déjà présentes :

- `docs/ui-audit/final-2026-09-14/activities-320x800.png`
- `docs/ui-audit/final-2026-09-14/activities-390x844.png`
- `docs/ui-audit/final-2026-09-14/activities-768x1024.png`

Mesures observées : `scrollWidth === clientWidth` à 320, 768 et 1440 px. Les contrôles `Effacer` et `Filtrer` font 32 px de haut et les favoris de carte 40 × 40 px, sous la cible minimale de 44 px.

## Historique fonctionnel à préserver

1. Une collection locale unique de 98 activités.
2. Trois vues internes : Découvrir, Favoris et Récentes.
3. Recherche libre sur le titre, le matériel et les caractéristiques.
4. Filtres avancés : moment, format, type, âge, temps, matériel, énergie parent, lieu/météo, bazar/bruit, autonomie et objectifs.
5. Filtres rapides suggérés et remise à zéro.
6. Surprise guidée affichée en superposition.
7. Suggestion du moment issue du tri de pertinence.
8. Favoris persistants et historique limité aux trente dernières activités ouvertes.
9. Chargement progressif par douze cartes.
10. Détail canonique en superposition, mémorisé dans l’URL.
11. Matériel, étapes, compétences, variante parent fatigué et variante plus difficile.
12. Confirmation des enfants participants avant l’attribution d’une étoile.
13. Routes historiques redirigées vers les états de `/activities`.
14. Données, favoris, historique et filtres stockés localement avec Zustand et AsyncStorage.

## Diagnostic global

- L’intention est juste, mais le titre, les onglets, la recherche, la surprise, le compteur et les filtres ressemblent à six zones indépendantes.
- À 320 px, les trois onglets passent sur deux lignes et créent une rupture visuelle.
- Le compteur `98 idées` est répété jusqu’à trois fois sans aider la décision.
- Sur tablette et desktop, de grands vides séparent `Me surprendre`, le compteur et les résultats.
- La suggestion principale est plus grande, mais sa composition reste celle d’une carte ordinaire étirée.
- Deux colonnes seulement à 1440 px donnent des cartes trop larges et beaucoup d’espace inutilisé.
- Les cartes exposent assez d’informations, mais leur lecture n’indique pas immédiatement « est-ce adapté maintenant ? ».
- Le détail présente jusqu’à treize badges au même niveau, puis l’action principale arrive très bas.
- Les options de surprise et plusieurs actions d’état vide n’exposent pas encore tous les rôles accessibles attendus.
- La superposition de filtres conserve tout, mais ses onze catégories donnent une impression de panneau de configuration.
- Les filtres et le détail sont déjà des superpositions : cette bonne logique doit être conservée et renforcée.

## Trois directions globales

### A — La question du moment

Une surface compacte rassemble l’intention, la recherche, les filtres utiles et la surprise. Les résultats commencent immédiatement dessous. Une seule suggestion forte répond à « que peut-on faire maintenant ? ».

- Mobile : onglets sur une seule ligne, recherche pleine largeur, actions rapides juste dessous, une colonne.
- Tablette : bloc de décision compact au-dessus d’une grille à deux colonnes.
- Desktop : même bloc sans l’étirer, suggestion structurée puis grille à trois colonnes.
- Bénéfice : décision rapide et parcours parental évident.
- Risque : les filtres avancés deviennent volontairement moins visibles.

### B — La bibliothèque calme

La page devient une bibliothèque structurée : onglets, barre de recherche fixe, résumé des filtres, puis grille dense et régulière.

- Mobile : outils empilés et condensés.
- Tablette/desktop : rail de filtres ou barre collante avec grille dense.
- Bénéfice : excellente exploration d’un grand catalogue.
- Risque : résultat plus utilitaire, moins vivant et moins distinctif pour Routine.

### C — La constellation d’idées

La suggestion du moment devient un galet central entouré de quelques repères ronds : durée, énergie, dedans/dehors. La grille reste calme en dessous.

- Mobile : galet vertical avec repères intégrés, jamais flottants au-dessus du texte.
- Tablette/desktop : composition asymétrique contrôlée, avec un seul motif ludique fort.
- Bénéfice : identité enfantine et mémorable sans créer un profil par enfant.
- Risque : peut devenir décoratif ou bruyant si les métadonnées ne sont pas strictement limitées.

## Direction recommandée

**A + une touche de C** : la structure rapide et parentale de A, avec un unique galet ludique pour la suggestion. Les ronds restent une signature de repérage et non une décoration permanente.

## Décisions proposées par élément

### P07-E01 — Shell et navigation

- Diagnostic : le nouveau shell est cohérent et la navigation basse reste claire.
- Proposition : conserver sans ajouter de navigation Activités parallèle.
- Recommandation : shell actuel, logo vers Routines et barre basse persistante.
- Décision : à valider avec la direction globale.

### P07-E02 — Titre et contexte

- Diagnostic : trois lignes occupent trop de place avant l’action.
- A : `Une idée pour maintenant` avec une aide d’une ligne.
- B : simple titre `Activités`.
- C : question `Qu’est-ce qui ferait du bien maintenant ?`.
- Recommandation : A, plus directe et stable.

### P07-E03 — Découvrir, Favoris, Récentes

- Diagnostic : les onglets se cassent en deux lignes à 320 px.
- A : trois segments de largeur égale sur une seule ligne.
- B : menu déroulant de collection.
- C : trois boutons ronds avec libellé dessous.
- Recommandation : A ; conserver les noms et les états URL actuels.

### P07-E04 — Recherche et outils rapides

- Diagnostic : recherche, surprise, compteur et filtres sont dispersés.
- A : une carte-outil avec recherche puis `Surprise` et `Filtres` sur la même ligne.
- B : barre de recherche seule, actions dans un menu.
- C : champ central entouré de raccourcis ronds.
- Recommandation : A ; afficher le compteur une seule fois et `Effacer` seulement si un filtre est actif.

### P07-E05 — Surprise

- Diagnostic : la superposition actuelle est claire, mais le format seul/groupe de l’ancienne expérience n’est plus proposé dans le raccourci.
- A : trois questions rapides — énergie, lieu, un enfant/plusieurs enfants.
- B : tirage immédiat sans question.
- C : roue ludique aléatoire.
- Recommandation : A ; rester dans la page avec la superposition existante.

### P07-E06 — Filtres avancés

- Diagnostic : toutes les fonctions sont présentes, mais onze catégories paraissent techniques.
- A : catégories regroupées en quatre intentions : Maintenant, Enfants, Parent, Contraintes.
- B : conserver les onze catégories dans un rail.
- C : poser les filtres comme une suite de questions.
- Recommandation : A ; ne supprimer aucun filtre et afficher les choix actifs en résumé.

### P07-E07 — Résultat et compteur

- Diagnostic : `98 idées` est répété.
- Proposition : un seul compteur près de `À découvrir`, mis à jour avec les filtres.
- Recommandation : supprimer toutes les répétitions secondaires.

### P07-E08 — Suggestion du moment

- Diagnostic : la carte étirée ne porte pas de signature propre.
- A : galet pastel large avec une phrase, trois repères utiles et une action explicite.
- B : carte identique au reste avec un badge `Suggestion`.
- C : grande constellation illustrée.
- Recommandation : A + motif C discret ; une seule couleur d’intention et aucune animation permanente.

### P07-E09 — Grille et cartes

- Diagnostic : deux colonnes restent trop larges sur desktop ; le favori mesure 40 px.
- Proposition : une colonne jusqu’à 719 px, deux de 720 à 1099 px, trois dès 1100 px ; favori 44 px ; carte entière ouvrable.
- Recommandation : cartes plus courtes, titre et phrase visibles, trois repères maximum, matériel seulement s’il est nécessaire.

### P07-E10 — Détail

- Diagnostic : les badges ont tous le même poids et l’action de fin est loin.
- Proposition : regrouper en quatre lignes lisibles — durée/âge, participants, contexte, effort parent — puis Matériel, Étapes et variantes.
- Recommandation : footer stable avec `Activité terminée ensemble`; favori secondaire; fermeture dans l’en-tête.

### P07-E11 — Confirmation de participation

- Diagnostic : le flux protège correctement la récompense, mais le confirmeur est imbriqué dans un détail long.
- Proposition : remplacer le contenu du panneau par une étape courte, puis revenir/fermer après confirmation.
- Recommandation : conserver l’absence de récompense avant confirmation explicite.

### P07-E12 — États vides, chargement et erreur

- Diagnostic : Favoris vide est compréhensible mais son bouton n’est pas annoncé comme action dans l’arbre accessible.
- Proposition : même gabarit compact pour vide, aucun résultat et données indisponibles, avec une action unique.
- Recommandation : aucun écran séparé pour ces états.

### P07-E13 — Responsive et anti-superposition

- Proposition : priorité au premier résultat au-dessus du pli, aucune zone flottante sur le contenu, padding bas égal à la navigation, contrôle 320/390/768/1440 et zoom 200 %.
- Recommandation : breakpoint grille spécifique à 720/1100 px, shell conservé à 768 px.

### P07-E14 — Accessibilité et clavier

- Diagnostic : ordre de tabulation exploitable, mais boutons de 32/40 px et rôles manquants dans Surprise/états vides.
- Proposition : 44 × 44 minimum, rôles `tab`, `button`, `radio` ou `checkbox`, focus visible, Échap, entrée et restitution du focus pour les superpositions.
- Recommandation : corriger dans le socle partagé avant les styles finaux.

### P07-E15 — Mouvement et fantaisie

- Proposition : une réaction courte lors du tirage surprise, aucune animation décorative permanente, version immédiate en mouvement réduit.
- Recommandation : durée 180–220 ms maximum hors tirage narratif.

### P07-E16 — Performance, confidentialité et routes

- Diagnostic : le chargement progressif et le stockage local sont adaptés.
- Proposition : conserver douze résultats initiaux, les stores existants, l’état URL et toutes les redirections historiques.
- Recommandation : aucune dépendance, aucun backend, aucune mesure contenant des données enfant.

## Porte de validation

La construction graphique d’Activités reste bloquée jusqu’à la validation de la direction globale et des recommandations P07-E01 à P07-E16. La réponse courte recommandée est : `A + C, recommandations validées`.
