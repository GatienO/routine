# PAGE-01 — Routines — inventaire exhaustif

> État actuel (2026-09-27) : E17/V3 intégré et validé visuellement; P01-E18 a été traité dans le lot global [G05](../lots/G05/REVIEW.md), intégré, vérifié sur web et validé visuellement. Les cases non cochées ci-dessous conservent l'inventaire historique page par page; elles ne rétablissent pas une file active. Essais natifs G04 ouverts.

État courant au 2026-09-20 : **V3 — images seules**. Aucune case ni nom visible quand non sélectionné; petit pin coché et contour vert pâle uniquement sur l'image sélectionnée. Grille compacte adaptative conservée. Référence : DECISIONS-TENUE.md, tenue-images-selection.html et PNG P01-E17-v5-*.png. Exemple à valider; V1/V2 et leurs descriptions ci-dessous sont historiques, aucune construction autorisée.


Date : 2026-09-16
Direction globale validée : **A — Le prochain pas**

## Règle de traitement

Chaque identifiant doit recevoir séparément : diagnostic, éléments oubliés, deux ou trois solutions écrites et visuelles, comportement responsive, accessibilité, décision utilisateur et état final. Aucun `[ ]` ci-dessous n’est validé par le choix de la direction A.

## A. Shell global visible

- [x] **P01-E01 — Fond et remplissage de l’écran** : **A1 Toile continue** validée le 2026-09-16 — fond crème/sombre continu, hauteur minimale, scroll et continuité derrière la navigation.
- [x] **P01-E02 — Ronds pastel de fond** : **R1 Deux respirations** validée le 2026-09-16 — deux grands ronds recadrés, lavande en haut à droite et ciel en bas à gauche.
- [x] **P01-E03 — Header de marque** : **H3 Commandes flottantes** validée le 2026-09-16 — aucun bandeau; marque et thème sur des surfaces opaques au-dessus de la toile.
- [x] **P01-E04 — Retour à Routines par la marque** : **L1 Accueil Routines fixe** validée le 2026-09-16 — cible 44 px, `replace('/routines')`, état pressé et libellé explicite.
- [x] **P01-E05 — Bouton jour/nuit** : **T1 Cercle à icône unique** validée le 2026-09-16 — lune/soleil, cible 44 px, persistance locale et libellé dynamique.
- [x] **P01-E06 — Navigation basse** : **N2 Barre bord à bord** validée le 2026-09-16 — trois libellés visibles, safe area couverte, actif menthe avec un trait court.
- [x] **P01-E07 — Accès Parent protégé** : **P1 Petit cadenas sur l’engrenage** validée le 2026-09-16 — icônes filaires, état accessible, écran `/pin` dédié et reverrouillage à la sortie.
- [x] **P01-E08 — Largeur et rythme global** : **G1 Fluide cadré** validée le 2026-09-16 — marges 16/24/32 px, plafond 1320 px et rythme vertical 16/24 px.

## B. Météo et préparation de la tenue

Correction du 2026-09-19 sur E16/E17 : les cartes à deux colonnes de S1 sont remplacées par une grille sans cadres, plus compacte, à trois colonnes sur panneau moyen et deux sur petit panneau. Exemple V2 dans DECISIONS-TENUE.md, en attente de validation; historique S1 conservé ci-dessous.

- [x] **P01-E09 — Bandeau météo principal** : **B1 Bloc tout-en-un** validé le 2026-09-16 — une surface ciel, ordre gauche→droite illustration météo / condition et température / vêtements configurés / bouton Modifier filaire; aucun sourcil, conseil, ressenti, pourcentage, vent ou autre statistique.
- [x] **P01-E10 — Représentation graphique météo** : **W6 Papier découpé** validé le 2026-09-16 — grandes formes colorées superposées, sans visage, variantes jour/nuit et conditions réelles; distincte des icônes utilitaires filaires.
- [x] **P01-E11 — États météo non nominaux** : **N1+ État générique stable** validé le 2026-09-16 — un seul texte sur mobile; à partir de 768 px, « Regardons le ciel » apparaît comme seconde phrase seulement lorsque la météo est réellement indisponible; chargement et indisponibilité conservent la même hauteur.
- [x] **P01-E12 — Rafraîchissement météo** : **F1+ Actualisation invisible** validée le 2026-09-17 — toutes les dix minutes si `/routines` est la page active et si l'application est au premier plan; aucune modification visible lorsque des données existent; les cas sans donnée restent couverts par `E11`.
- [x] **P01-E13 — Faits météo avancés** : **F0 Suppression totale** validée le 2026-09-16 — aucun ressenti, pourcentage, vent ou statistique supplémentaire, quelle que soit la largeur.
- [x] **P01-E14 — Aperçu des vêtements** : **H1 Quatre essentiels** validé le 2026-09-17 — au maximum un haut ou une couche chaude, un bas, des chaussures et la protection météo prioritaire; groupe non interactif annoncé en une fois, masqué sans recommandation.
- [x] **P01-E15 — Action Modifier** : petit bouton à icône filaire placé à droite après les vêtements, cible tactile de 44 px et libellé accessible « Modifier la météo et les vêtements ».
- [x] **P01-E16 — Panneau Préparer la tenue** : **S1 — Grille calme** validé le 2026-09-17 — bottom sheet mobile sous 760 px, panneau latéral à partir de 760 px, grille de cartes à cocher en deux colonnes, pied fixe avec Réinitialiser et Tenue prête.
- [?] **P01-E17 — États du panneau tenue** : décision du 2026-09-19 : tous les vêtements disponibles dès l'ouverture, remplaçant l'écran d'indisponibilité; présélection des recommandations si météo disponible, choix manuel sinon. Q1/Q2/Q3 archivés. Exemple V2 sans cartes dans DECISIONS-TENUE.md en attente de validation; sélection vide, réinitialisation sans météo et arrivée tardive de données restent ouverts.

## C. Routine prioritaire

- [ ] **P01-E18 — Choix automatique de la prochaine routine** : routines actives, favoris, date de mise à jour, regroupement des copies identiques et prévisibilité du résultat.
- [ ] **P01-E19 — Carte principale** : domination visuelle, libellé « Prochaine routine », surface, hauteur, rayon, ombre et relation avec le calendrier.
- [ ] **P01-E20 — Identité de la routine** : pictogramme, nom, participants, nombre d’étapes, durée calculée et textes longs.
- [ ] **P01-E21 — Aperçu des trois étapes** : numérotation, titres, troncature, ordre, étapes absentes ou inférieures à trois et fonction de préparation.
- [ ] **P01-E22 — Action Lancer** : libellé singulier/collectif, icône, couleur menthe, route `/child/summary`, paramètres routine/enfants et feedback pressé.
- [ ] **P01-E23 — Sélection des participants** : lancement direct d’une routine regroupée, cas sans enfant résolu et nécessité éventuelle d’une confirmation avant le mode accompagné.
- [ ] **P01-E24 — Routine en cours** : apparition conditionnelle, intitulé, reprise vers `/child/run` et intégration dans l’action principale plutôt qu’une carte concurrente.
- [ ] **P01-E25 — État sans routine** : message, illustration, action Créer, route `/parent/add-routine` et maintien d’une hiérarchie compacte.

## D. Calendrier enfant contextuel

- [ ] **P01-E26 — Carte Aujourd’hui** : place latérale tablette / résumé mobile, hauteur liée à la routine et couleur lavande réservée au temps.
- [ ] **P01-E27 — Maintenant et Après** : vocabulaire enfant, calcul des trois prochains éléments, ordre horaire, journée vide et absence de planning familial.
- [ ] **P01-E28 — Repère en dodos** : prochain compte à rebours, singulier/pluriel, événement du jour et cas sans compte à rebours.
- [ ] **P01-E29 — Ouvrir le calendrier** : carte entière cliquable, lien « Voir toute la journée », route `/child/calendar` et retour cohérent.

## E. Autres routines et gestion

- [ ] **P01-E30 — En-tête Autres routines** : compteur, absence de section inutile, ordre des actions et adaptation mobile.
- [ ] **P01-E31 — Action Enchaîner** : apparition à partir de deux routines, compréhension, couleur temporelle et ouverture du panneau.
- [ ] **P01-E32 — Actions Gérer et Créer** : hiérarchie secondaire, routes `/parent/routines` et `/parent/add-routine`, protection parent éventuelle et duplication des accès.
- [ ] **P01-E33 — Ligne de routine secondaire** : pictogramme, titre, étapes, durée, participants, bouton lecture, cible de la ligne et textes longs.
- [ ] **P01-E34 — Afficher toute la liste** : limite initiale de trois, bouton voir/réduire, conservation de position et très grandes listes.
- [ ] **P01-E35 — Panneau Routines à la suite** : ordre de sélection, cases cochées, minimum de deux, bouton désactivé, participants fusionnés, lancement et fermeture.

## F. États globaux, invisibles et qualité

- [ ] **P01-E36 — Portail de profil local** : hydratation, création initiale, nom, identifiant local, masquage complet de Routines et reprise après validation.
- [ ] **P01-E37 — Feedback, installation et couches globales** : toasts/confirmations, indice d’installation web, empilement avec panneaux, clavier, navigation et safe areas.
- [ ] **P01-E38 — Contrôle transversal** : clair/sombre, contraste, zoom et grands textes, clavier/focus, lecteur d’écran, mouvement réduit, performances, UTF-8, confidentialité locale et routes historiques.

## Fonctions historiques explicitement préservées jusqu’à décision détaillée

- architecture à trois destinations et navigation basse toujours disponible sur les pages principales ;
- météo ludique liée à la compréhension de la tenue, avec recommandation configurable par l’adulte ;
- calendrier destiné à l’enfant pour comprendre le temps, jamais un planning familial ;
- routine accompagnée par l’adulte, sans usage autonome de l’enfant hors exécution ;
- regroupement possible d’une même routine pour plusieurs enfants, sans créer une page principale par enfant ;
- reprise d’une exécution en cours, état vide, plusieurs routines, liste développée et enchaînement ;
- superpositions responsive pour la tenue et l’enchaînement ;
- modes clair et sombre, ronds pastel, marque `R` + trois points et navigation bord à bord ;
- routes de gestion existantes et redirections historiques documentées dans `AGENTS.md`.

## Premier élément à traiter

`P01-E17 — États du panneau tenue`, puis progression stricte dans l’ordre. Les éléments E01 à E16 sont désormais validés.
