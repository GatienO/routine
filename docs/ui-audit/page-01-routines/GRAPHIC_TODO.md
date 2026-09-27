> **État au 2026-09-27 :** E17/V3 est intégré et validé visuellement. P01-E18, la routine mise en avant, a été traité dans [G05](../lots/G05/REVIEW.md), intégré, vérifié sur web et validé visuellement. La file détaillée ci-dessous décrit le 2026-09-20 et reste historique; elle n'impose pas E19 comme prochain lot. Les essais natifs G04 restent ouverts. Suivi actif : [GLOBAL-AUDIT.md](../GLOBAL-AUDIT.md).

# TODO COURANTE — PAGE-01 — Routines — reprise à zéro — 2026-09-15

État courant au 2026-09-20 : **V3 — images seules**. Aucune case ni nom visible quand non sélectionné; petit pin coché et contour vert pâle uniquement sur l'image sélectionnée. Grille compacte adaptative conservée. Référence : DECISIONS-TENUE.md, tenue-images-selection.html et PNG P01-E17-v5-*.png. Exemple à valider; V1/V2 et leurs descriptions ci-dessous sont historiques, aucune construction autorisée.


## Point de départ officiel

- Page réelle : `/routines` dans l’application locale.
- Objectif actuel supposé : aider le parent à préparer puis lancer le prochain moment accompagné.
- Visuel audité : le code réel actuellement affiché, même s’il contient déjà des essais de refonte.
- Références de mise en page non validantes : les anciens prototypes HTML, captures et compositions de page.
- Fondations déjà validées et obligatoires : `docs/app-rebuild/VISUAL_IDENTITY.md` et les décisions globales rappelées ci-dessous.
- État des décisions : direction globale **A — Le prochain pas** et éléments `P01-E01` à `P01-E16` validés. `P01-E17` est l'élément actif. Reprendre une page à zéro ne remet jamais l’identité globale à zéro.

## Point de reprise obligatoire

Correction courante : **V2 sans cartes**, espacements réduits, au moins trois colonnes sur panneau moyen et deux sur petit panneau. Cette demande remplace les cartes à deux colonnes de E16/S1. Fiche DECISIONS-TENUE.md et visuels P01-E17-v4-*.png à valider; V1 conservée dans DECISIONS-TENUE-v1.md. Les références S1 plus bas décrivent l'historique, sous réserve de cette correction.

- Page et route : **PAGE-01 — Routines**, `/routines`.
- Phase : **Phase 4 — revue point par point**.
- Direction globale : **A — Le prochain pas**.
- Validé : `E01 A1`, `E02 R1`, `E03 H3`, `E04 L1`, `E05 T1`, `E06 N2`, `E07 P1`, `E08 G1`, `E09 B1`, `E10 W6`, `E11 N1+`, `E12 F1+`, `E13 F0`, `E14 H1`, `E15 Modifier à droite`, `E16 S1`.
- Contraintes météo déjà fixées : un seul bloc; illustration colorée à gauche; texte unique condition + température réelle; vêtements configurés; bouton Modifier filaire à droite; aucun ressenti, pourcentage, vent, conseil ou autre statistique.
- Rejeté ou non retenu : séries météo `M1–M3`, `W1–W3`, puis alternatives `W4` et `W5`; elles restent dans l'historique et ne doivent pas être reproposées à l'identique.
- Actif : `P01-E17 — États du panneau tenue` — décision du 2026-09-19 : tous les vêtements dès l'ouverture, à la place de l'écran d'indisponibilité; présélection des vêtements recommandés si météo disponible. Consolider le visuel; sélection vide, réinitialisation sans météo et arrivée tardive de la météo restent ouverts. Q1/Q2/Q3 archivés, ne plus les soumettre au choix.
- Après E17 : la routine prioritaire à partir de `E18`.

À chaque demande « reprends », « continue » ou « reprends la todo », restituer ce point en l'actualisant, rappeler les règles non négociables utiles à l'élément, puis exécuter l'action suivante. Ne jamais répondre uniquement par un code de choix ou un visuel.

## Contrat de restitution obligatoire

Livrable courant du 2026-09-19 : [fiche séparée DECISIONS-TENUE.md](./DECISIONS-TENUE.md), exemple V2 sans cartes avec captures mobile/tablette et catalogue complet. **En attente de validation visuelle**, aucune construction autorisée. La méthode portable est dans [METHODOLOGIE-REUTILISABLE.md](../METHODOLOGIE-REUTILISABLE.md).

Renforcé le 2026-09-19 à la demande de l'utilisateur : chaque point E17 à E38 doit inclure l'amélioration expliquée, les visuels comparables et les bénéfices/compromis, selon la checklist « Méthode obligatoire pour chaque point » de `../BRAINSTORMING.md`. Les points déjà validés ne sont pas réouverts. E17 : Q1/Q2/Q3 archivés après correction explicite; illustrer désormais la grille complète avec présélection météo, sans redemander ce choix acquis.

Pour chaque élément actif, la même réponse doit contenir :

1. le point de reprise et le statut exact ;
2. le diagnostic factuel et les contraintes déjà validées ;
3. trois propositions écrites comparables — principe, responsive, accessibilité, avantage et risque ;
4. trois visuels comparables utilisant le même contenu ;
5. une capture PNG de secours visible si le visuel interactif ne s'affiche pas ;
6. la recommandation argumentée ;
7. la décision exacte attendue ;
8. l'inscription de la demande et de la réponse dans `DECISION_LOG.md`.

## Fondations visuelles héritées — non négociables

- [x] Positionnement : interface parentale calme, plus vivante seulement pendant les moments accompagnés.
- [x] Signature : « Des repères simples, ensemble. » et principe « Calme pour guider. Vivante pour apprendre. »
- [x] Fond crème, surfaces blanches et vrais équivalents sombres conçus ensemble — pas une simple inversion.
- [x] Palette sémantique : menthe = agir/progresser, lavande = temps/calendrier, ciel = météo/observer, abricot = chaleur/préparer, corail = alerte/destruction.
- [x] Typographie système arrondie, titres courts, deux graisses utiles et interlignage généreux.
- [x] Rayons protecteurs et constants : 14 px contrôles, 18 px panneaux, 22 px cartes principales.
- [x] Marque compacte : `R` dans un carré menthe arrondi avec trois points de chemin.
- [x] Grands ronds pastel partiellement hors cadre comme signature de fond, sans gêner la lecture.
- [x] Outils parentaux neutres et bordés; couleurs et emojis réservés aux repères utiles vécus avec l’enfant.
- [x] Iconographie utilitaire Phosphor Regular, strictement linéaire et simple; aucun cadenas, réglage ou symbole de navigation rempli.
- [x] Une seule action principale menthe par surface et au plus trois couleurs fonctionnelles visibles simultanément.
- [x] Calendrier enfant en lavande, météo en ciel et préparation de tenue en abricot.
- [x] Navigation basse bord à bord, blanche en clair et sombre dédiée en nuit; seule la destination active est menthe avec un trait court.
- [x] Header compact selon la dernière décision : marque seule à gauche, bouton jour/nuit sans texte à droite.
- [x] Aucun mouvement décoratif permanent; le feedback animé reste bref et lié à une action.

## Ordre obligatoire

### Phase 0 — Cadrer

- [x] Confirmer l’objectif utilisateur principal de Routines — validé par « continue la todo » le 2026-09-15.
- [x] Confirmer le périmètre et les exclusions — validé par « continue la todo » le 2026-09-15.
- [x] Identifier le shell commun : header, thème, fond, navigation basse, garde PIN et feedback global.
- [x] Identifier le contenu propre à Routines : météo/tenue, routine, reprise, calendrier et liste secondaire.
- [x] Fixer la matrice web : 320×800, 390×844, 768×1024, 1024×768 et 1440×1000.
- [x] Lister les dépendances : routines, enfants, météo, calendrier, profil local, PIN, exécution et navigation.

### Phase 1 — Capturer l’existant réel

- [x] Ouvrir la vraie route locale `/routines` et vérifier qu’elle répond.
- [x] Capturer 320 × 800.
- [x] Capturer 390 × 844.
- [x] Capturer 768 × 1024.
- [x] Capturer 1024 × 768.
- [x] Capturer 1440 × 1000.
- [x] Capturer les versions claire et sombre.
- [ ] Capturer les états météo : normal et chargement contrôlés; absent, périmé et erreur à compléter pendant la revue détaillée.
- [x] Capturer les états routines : disponible, vide, plusieurs routines et reprise en cours.
- [ ] Capturer calendrier vide, chargé et compte à rebours en dodos.
- [x] Capturer le premier démarrage avec création du profil local.
- [x] Capturer les superpositions Tenue et Enchaînement.
- [x] Mesurer les 17 captures : aucun débordement horizontal et aucune cible détectée sous 44 px.

### Phase 2 — Trois propositions globales écrites et visuelles

- [x] Produire le texte A — Le prochain pas : structure, parcours, responsive, signature, bénéfice et risque.
- [x] Produire le visuel A — Mobile et tablette.
- [x] Produire le texte B — Aujourd’hui en trois repères : structure, parcours, responsive, signature, bénéfice et risque.
- [x] Produire le visuel B — Mobile et tablette.
- [x] Produire le texte C — Le tableau calme du parent : structure, parcours, responsive, signature, bénéfice et risque.
- [x] Produire le visuel C — Mobile et tablette.
- [x] Vérifier que les trois visuels utilisent le même contenu pour permettre une comparaison honnête.
- [x] Refaire les trois visuels après contrôle contre toutes les fondations visuelles héritées.
- [x] Fournir le texte et le comparatif visuel dans la même demande de validation.
- [x] Direction choisie : **A — Le prochain pas**, validée par l’utilisateur le 2026-09-16.

> Arrêt obligatoire ici. Une direction ne peut pas être soumise sans son texte et son visuel. La direction globale ne valide aucun composant.

### Phase 3 — Inventaire exhaustif après validation globale

- [x] Créer un identifiant pour chaque élément visible.
- [x] Ajouter tous les éléments conditionnels ou invisibles au repos.
- [x] Ajouter les fonctions présentes dans le code mais absentes du rendu.
- [x] Ajouter les fonctions historiques à préserver ou à abandonner explicitement.
- [x] Vérifier shell, contenu, actions, états, panneaux, responsive, accessibilité, mouvement, performance, confidentialité et routes.

Inventaire de référence : `INVENTORY.md`. Il contient 38 éléments `P01-EXX` à traiter individuellement.

### Phase 4 — Revue point par point

- [x] **P01-E01 — Fond et remplissage de l’écran** : A1 — Toile continue validée le 2026-09-16.
- [x] **P01-E02 — Ronds pastel de fond** : R1 — Deux respirations validée le 2026-09-16.
- [x] **P01-E03 — Header de marque** : H3 — Commandes flottantes validée le 2026-09-16.
- [x] **P01-E04 — Action du logo R** : L1 — Accueil Routines fixe validée le 2026-09-16.
- [x] **P01-E05 — Bouton jour/nuit** : T1 — Cercle à icône unique validée le 2026-09-16.
- [x] **P01-E06 — Navigation basse** : N2 — Barre bord à bord validée le 2026-09-16.
- [x] **P01-E07 — Accès Parent protégé** : P1 — Petit cadenas filaire sur l’engrenage validé le 2026-09-16.
- [x] **P01-E08 — Largeur et rythme global** : G1 — Fluide cadré à 1320 px validé le 2026-09-16.
- [x] **P01-E09 — Bandeau météo principal** : **B1 — Bloc tout-en-un** validé le 2026-09-16 — illustration météo à gauche, condition et température réelle, vêtements configurés, puis bouton Modifier filaire à droite; aucun autre texte ni fait météo.
- [x] **P01-E10 — Représentation graphique de la météo** : **W6 — Papier découpé** validé le 2026-09-16 — grandes formes colorées superposées, sans visage, condition immédiatement lisible et variantes jour/nuit.
- [x] **P01-E11 — États météo non nominaux** : **N1+ — État générique stable** validé le 2026-09-16 — chargement « Météo en cours… », indisponibilité « Météo indisponible », hauteur inchangée; à partir de 768 px uniquement et seulement sans donnée fiable, ajouter « Regardons le ciel » comme seconde phrase.
- [x] **P01-E12 — Rafraîchissement et fraîcheur météo** : **F1+ — Actualisation invisible** validée le 2026-09-17 — toutes les dix minutes uniquement lorsque `/routines` est affichée et que l'application est au premier plan; aucun badge, texte, mouvement ou annonce pendant une actualisation avec donnée existante; `E11` reste responsable des cas sans donnée.
- [x] **P01-E13 — Faits météo avancés** : **F0 — Suppression totale** validée par la demande explicite « retire le ressenti et % de pluie ou autre ajouts ».
- [x] **P01-E14 — Aperçu des vêtements** : **H1 — Quatre essentiels** validé le 2026-09-17 — un haut ou une couche chaude, un bas, des chaussures et la protection météo prioritaire; images configurées, groupe non interactif, zone absente sans recommandation.
- [x] **P01-E15 — Action météo** : **Modifier à droite** validé explicitement — petit bouton à icône filaire, après les vêtements.
- [x] **P01-E16 — Panneau Préparer la tenue** : **S1 — Grille calme** validé le 2026-09-17 — bottom sheet mobile sous 760 px, panneau latéral à partir de 760 px, grille de cartes à cocher en deux colonnes, contenu seul défilable, pied fixe avec Réinitialiser et Tenue prête, restauration du focus sur Modifier.
- [?] **P01-E17 — États du panneau tenue** : grille complète dès l'ouverture et présélection météo décidées le 2026-09-19; exemple V2 sans cartes dans DECISIONS-TENUE.md à valider, puis détails sélection vide/réinitialisation/arrivée tardive de la météo à traiter.
- [ ] Pour chaque `P01-EXX`, fournir un diagnostic factuel.
- [ ] Expliquer le problème utilisateur ou confirmer l’absence de problème.
- [ ] Fournir deux ou trois solutions réalistes.
- [ ] Décrire mobile, tablette, desktop et accessibilité.
- [?] Obtenir une décision explicite avant de passer l’élément à `[x]`.
- [ ] Ne construire aucun élément pendant cette phase.

> Les lignes `P01-EXX` seront créées seulement après validation de la direction globale, à partir de l’inventaire réel complet. Elles seront ensuite traitées une par une, jamais validées en bloc.

### Phase 5 — Prototype consolidé

- [ ] Construire uniquement les décisions `P01-EXX` validées.
- [ ] Vérifier la page entière et tous ses états.
- [ ] Capturer le prototype aux mêmes formats que l’existant.

### Phase 6 — Porte avant construction

- [?] Obtenir `prototype validé — construction autorisée`.

### Phases 7 à 10 — Intégration, contrôle et fermeture

- [ ] Créer une nouvelle todo technique depuis les décisions validées.
- [ ] Exécuter la baseline TypeScript et Jest.
- [ ] Intégrer sans modifier les contrats métier non autorisés.
- [ ] Vérifier chaque tâche dans le code réel.
- [ ] Rejouer responsive, clavier, focus, zoom, états, mouvement réduit et mesures.
- [?] Obtenir la validation visuelle finale.
- [ ] Fermer PAGE-01 seulement après cette validation.
- [ ] Ouvrir ensuite la todo de la page suivante.

## Historique séparé

Les dossiers `page-00-shell/` et son prototype `shell-routines-ac.html` restent disponibles comme historique. Ils ne constituent ni la page courante, ni une validation, ni une base obligatoire pour les nouvelles propositions.
