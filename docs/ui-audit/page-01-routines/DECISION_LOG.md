## État actuel — 2026-09-27

E17/V3 est intégré après autorisation locale explicite du 2026-09-21. Cinq illustrations dédiées ont remplacé les éléments provisoires le 2026-09-26 et leur rendu a été contrôlé dans l'app web. L'utilisateur a validé le rendu final de V3 le 2026-09-26. P01-E18 a ensuite été repris dans le lot global [G05](../lots/G05/REVIEW.md), intégré, vérifié sur web et validé visuellement le 2026-09-27. Les essais natifs G04 restent ouverts. Les entrées ci-dessous conservent leur statut à leur date; la suite ordonnée page par page est historique. Suivi : [GLOBAL-AUDIT.md](../GLOBAL-AUDIT.md).

## 2026-09-20 — Passage à une amélioration globale

L'utilisateur demande un audit de l'existant puis une amélioration globale, notamment du menu. La revue détaillée est suspendue, sans effacer les choix et rejets. E17/V3 reste ouvert et ne bloque plus les autres pages. Suivi : [GLOBAL-AUDIT.md](../GLOBAL-AUDIT.md). Aucune nouvelle apparence validée ni construction autorisée.

# PAGE-01 — Routines — journal de décisions

## État courant — 2026-09-20 — Images seules et pin de sélection

- Demande : « met juste un pin sur l'image quand elle est slectionnée avec un contour vert pale quand non selelctioné retire la case a cocher affiche seulement l'image ».
- Correction prescrite : aucune case ni libellé visible hors sélection; image sélectionnée avec petit pin coché superposé et contour vert pâle. Nom accessible conservé, état coché annoncé et focus clavier visible.
- Conserver : catalogue complet, présélection météo, absence de cartes, marges compactes et colonnes adaptatives.
- V2 archivée dans DECISIONS-TENUE-v2.md avec les PNG v4; motif : cases vides et textes encore trop présents. V3 dans DECISIONS-TENUE.md, tenue-images-selection.html et PNG P01-E17-v5-*.png.
- Statut : exemple V3 à valider; E17 reste actif, détails fonctionnels non tranchés inchangés, aucune construction produit autorisée.

## État courant — 2026-09-19 — Correction V2 sans cartes

- Demande : retirer les cartes autour des vêtements, rendre les espacements sans séparation visible et plus petits; au moins trois colonnes sur écran moyen, adaptation sur petit écran.
- Décision prescrite : supprimer bordures, fonds individuels et ombres; compacter la grille. Cette demande remplace explicitement la partie « cartes à deux colonnes » de S1/E16, tout en conservant le panneau et son pied.
- V1 rejetée pour sa présentation en cartes trop espacées; conservée dans DECISIONS-TENUE-v1.md et les visuels v3.
- Exemple V2 : tenue-sans-cartes.html, PNG P01-E17-v4-*.png. Seuils proposés selon largeur du panneau : 2 colonnes sous 350 px, 3 dès 350 px, 4 dès 520 px. Case cochée et texte menthe signalent la sélection, sans recréer de carte.
- Statut : correction consignée, exemple V2 à valider. E17 reste actif. Aucun changement du produit autorisé; les détails fonctionnels encore ouverts restent ouverts.

Dernière mise à jour : 2026-09-17

Ce journal est chronologique. Il complète les fiches détaillées `reviews/` et empêche qu'une reprise de conversation efface une contrainte.

## Fondations produit conservées

- application organisée autour des outils utiles aux parents, jamais autour d'une page principale par enfant ;
- interaction enfant uniquement pendant les routines accompagnées et dans le calendrier de repérage temporel ;
- calendrier enfant pour comprendre Maintenant / Après / Demain / Dodos, jamais planning familial ;
- météo ludique pour comprendre le temps et choisir les vêtements avec l'adulte ;
- pastels simples et sémantiques, modes clair et sombre conçus ensemble ;
- identité avec grands ronds pastel, formes protectrices et outils parentaux calmes ;
- navigation persistante limitée à Routines, Activités et Parent ;
- écrans secondaires privilégiés en superposition pour réduire le nombre de pages.

## Décisions de PAGE-01

| Date | Élément | Demande ou décision | Statut |
|---|---|---|---|
| 2026-09-16 | Direction globale | `A — Le prochain pas` | Validé |
| 2026-09-16 | P01-E01 | `A1 — Toile continue`, fond toujours rempli à toutes les tailles | Validé |
| 2026-09-16 | P01-E02 | `R1 — Deux respirations`, grands ronds pastel recadrés | Validé |
| 2026-09-16 | P01-E03 | `H3 — Commandes flottantes`, aucun bandeau lourd | Validé |
| 2026-09-16 | P01-E04 | `L1 — Accueil Routines fixe`, la marque revient toujours à `/routines` | Validé |
| 2026-09-16 | P01-E05 | `T1 — Cercle à icône unique`, jour/nuit sans texte | Validé |
| 2026-09-16 | P01-E06 | `N2 — Navigation basse bord à bord` | Validé |
| 2026-09-16 | P01-E07 | `P1 — Petit cadenas filaire sur l'engrenage`; refus du cadenas rempli ou décoratif | Validé |
| 2026-09-16 | P01-E08 | `G1 — Fluide cadré`, marges 16/24/32 et maximum 1320 px | Validé |
| 2026-09-16 | P01-E09 | Première série météo `M1–M3` jugée trop chargée | Rejeté |
| 2026-09-16 | P01-E09 | Un seul texte météo : condition + température réelle; retirer sourcil, conseil, ressenti, pourcentage, vent et autres ajouts | Validé |
| 2026-09-16 | P01-E09 | Ordre gauche→droite : représentation météo dominante, texte, vêtements configurés, bouton Modifier | Validé |
| 2026-09-16 | P01-E09 | `B1 — Bloc tout-en-un`; bouton Modifier déplacé à droite | Validé |
| 2026-09-16 | P01-E10 | La météo n'est pas un logo ni une icône utilitaire : c'est une représentation graphique colorée et ludique du temps de la journée | Invariant validé |
| 2026-09-16 | P01-E10 | Première série `W1–W3` non retenue; demander plusieurs nouvelles propositions | Rejeté |
| 2026-09-16 | P01-E10 | Seconde série `W4–W6` présentée | Présenté |
| 2026-09-16 | P01-E10 | `W6 — Papier découpé` choisi; W4 et W5 non retenus | Validé |
| 2026-09-16 | P01-E11 | Série `N1–N3` préparée avec états interactifs, mobile et tablette | Présenté |
| 2026-09-16 | P01-E11 | `N1+ — État générique stable` choisi; mobile à un seul texte, et à partir de 768 px « Regardons le ciel » en seconde phrase uniquement quand aucune météo fiable n'est disponible | Validé |
| 2026-09-16 | P01-E12 | Série `F1–F3` préparée pour donnée récente, actualisation et donnée ancienne; `F2` recommandé pour conserver le texte météo et signaler l'état par un badge filaire sur l'illustration | Décision en attente |
| 2026-09-17 | P01-E12 | `F1+ — Actualisation invisible` choisie : toutes les dix minutes uniquement si `/routines` est affichée et l'application au premier plan; aucun indicateur visible, les cas sans donnée restent gérés par `E11` | Validé |
| 2026-09-17 | P01-E12 | `F2` et `F3` non retenus : ne montrer ni badge de fraîcheur, ni texte temporaire pendant le rafraîchissement | Rejeté |
| 2026-09-17 | P01-E14 | Série `H1–H3` préparée avec la même tenue de six éléments; `H1` recommandé pour montrer quatre essentiels choisis par zone et priorité météo | Décision en attente |
| 2026-09-17 | Reprise | Deux demandes « Reprend » reçues; reprise maintenue sur `P01-E14` sans déduire de validation | Reprise effectuée |
| 2026-09-17 | P01-E14 | `H1 — Quatre essentiels` choisi : haut ou couche chaude, bas, chaussures et protection météo prioritaire; images configurées, aucune interaction individuelle dans le bandeau | Validé |
| 2026-09-17 | P01-E14 | `H2` et `H3` non retenus : ni compteur abstrait, ni grille de six vêtements à deux lignes dans le bandeau | Rejeté |
| 2026-09-17 | P01-E16 | Série `S1–S3` préparée avec les mêmes six vêtements, les mêmes actions et le même responsive; `S1` recommandé pour réduire le texte et préserver de grandes cibles | Décision en attente |
| 2026-09-17 | P01-E16 | `S1 — Grille calme` choisi : grille de deux colonnes, cartes à cocher, bottom sheet mobile, panneau latéral dès 760 px, pied fixe avec Réinitialiser et Tenue prête | Validé |
| 2026-09-17 | P01-E16 | `S2` et `S3` non retenus : ni longue liste par moments, ni déplacement des vêtements entre deux zones | Rejeté |
| 2026-09-17 | P01-E17 | Série `Q1–Q3` préparée pour le chargement initial, l'indisponibilité, la sélection vide, la réinitialisation et l'accès aux réglages; `Q1` recommandé pour conserver un panneau stable | Décision en attente |
| 2026-09-16 | Méthode globale | Chaque reprise doit restaurer toutes les actions; chaque série doit conserver explications écrites et visuels visibles | Règle validée |

## Élément actif

`P01-E17 — États du panneau tenue`

- chargement initial lorsque le panneau ne dispose encore d'aucune météo ;
- météo indisponible et accès utile aux réglages ;
- sélection vide et disponibilité de Tenue prête ;
- comportement de Réinitialiser ;
- annonces accessibles sans bruit pendant l'actualisation invisible.

La consigne courante est la correction explicite du 2026-09-19 ci-dessous : grille complète dès l'ouverture et présélection météo. La série Q1/Q2/Q3 est archivée; ne plus demander de choisir parmi ces options.

Visuels conservés dans le projet :

- `proposals/P01-E10-W4-W6-comparison.png` ;
- `proposals/P01-E11-states-tablet.png` ;
- `proposals/P01-E11-states-mobile.png`.
- `proposals/P01-E12-refresh-tablet.png` ;
- `proposals/P01-E12-refresh-mobile.png`.
- `proposals/P01-E14-clothing-tablet.png` ;
- `proposals/P01-E14-clothing-mobile.png`.
- `proposals/P01-E16-panel-tablet.png` ;
- `proposals/P01-E16-panel-mobile.png`.
- `proposals/P01-E17-states-tablet.png` ;
- `proposals/P01-E17-states-mobile.png`.

## Éléments déjà décidés par anticipation

- `P01-E13 — Faits météo avancés` : suppression totale, y compris sur grand écran.
- `P01-E15 — Action météo` : bouton Modifier filaire à droite après les vêtements, cible 44 px et libellé accessible.

## Suite ordonnée

Après validation de `E17` : `E18` à `E38` dans l'ordre de l'inventaire. Aucun prototype consolidé et aucune intégration avant validation de tous les éléments détaillés.

## 2026-09-19 — Cadrage global demandé

- Demande : brainstorming puis todo pour reprendre rapidement toutes les pages et simplifier l'usage global.
- Réponse : création de `../BRAINSTORMING.md`, avec questions globales, travaux par surface et critères de réussite.
- Invariants : décisions acquises conservées, aucun rejet effacé, aucune nouvelle option validée et aucune construction autorisée.
- Statut : discussion globale ouverte; élément graphique actif inchangé, `P01-E17`. Ce cadrage ne lance pas la revue graphique d'une autre page.

## 2026-09-19 — Explications et visuels pour chaque point

- Demande : présenter les améliorations visuellement et par écrit, ajouter cette méthodologie à chaque point de todo.
- Décision méthodologique explicite : checklist applicable à tous les points, ajoutée à METHOD.md, MASTER.md, BRAINSTORMING.md et GRAPHIC_TODO.md.
- E17 : diagnostic confirmé par lecture de OutfitPreparationOverlay.tsx; Q1/Q2/Q3 restent en attente de choix.
- Visuels v1 conservés. Révision v2 : suppression de « Regardons le ciel » en simulation mobile, réservée à la tablette; contrôles explicites pour explorer les états. Les différences entre Q2/Q3 et le pied fixe S1 sont des compromis à valider, pas des décisions acquises.
- Références : `visuals/p01-e17-outfit-states-v2.html` et captures `proposals/P01-E17-v2-*.png`.
- Statut suivant : attendre un choix sur E17; aucune construction de l'application autorisée.

## 2026-09-19 — Correction : tous les vêtements dès l'ouverture

- Demande exacte : « non tu affiche juste tous les vêtements disponibles sur la première page a la place la météo indisponible et si la météo est disponible tu présélectionne les vêtements ».
- Périmètre contextuel : première vue du panneau Préparer la tenue, en remplacement du contenu Météo indisponible présenté dans le comparatif.
- Décision explicite : afficher tous les vêtements disponibles avec ou sans météo; lorsque la météo est disponible, présélectionner les vêtements recommandés en laissant les autres accessibles.
- Sans météo : choix manuel directement dans cette même grille; aucun écran intermédiaire d'indisponibilité ni passage obligatoire par les réglages.
- Rejets : Q1 et Q2 bloquent inutilement l'accès à la grille sans météo. Q3 n'est pas retenu tel quel car il limite la grille aux vêtements courants et comporte des comportements non demandés. Les trois options et leurs visuels restent archivés.
- Non décidé par cette correction : validation d'une sélection vide, effet exact de Réinitialiser sans météo, arrivée de la météo après des choix manuels. Ne pas déduire de validation sur ces détails.
- Statut : principe d'affichage et présélection validé; E17 reste actif pour consolidation du visuel et des détails restants. Pas d'autorisation de construction de l'application.
- Références mises à jour : MASTER.md, GRAPHIC_TODO.md, INVENTORY.md, reviews/P01-E17.md et BRAINSTORMING.md.

## 2026-09-19 — Fiche séparée illustrée et méthode portable

- Demande : conserver les décisions dans un autre fichier avec un exemple visuel à valider ensemble avant la suite; créer en parallèle un fichier réutilisable pour scanner d'autres applications et proposer des améliorations page par page selon cette méthode.
- Livrables : `DECISIONS-TENUE.md` rassemble instruction acquise, exemple V1, captures et détails ouverts; `../METHODOLOGIE-REUTILISABLE.md` est autonome et contient les prompts de lancement/reprise et les gabarits du scan aux validations.
- Exemple présenté : `visuals/tenue-grille-complete.html`, captures `proposals/P01-E17-v3-*.png`; les deux états de la même solution montrent le catalogue complet avec/sans présélection. Les anciennes séries restent archivées.
- Hypothèses explicites : 24 articles distincts avec accessoires, rien coché sans météo, validation vide désactivée, Réinitialiser restaure la sélection de départ. Ces détails ne sont pas considérés comme validés.
- Limite visuelle : cinq assets existants montrent un parapluie inadapté; symboles provisoires dans la maquette, illustrateurs définitifs à traiter avant le prototype complet.
- Vérification de la maquette : catalogue de 24 articles dans les deux états, images chargées, zéro débordement horizontal à 320/390/768 px, sélection et réinitialisation fonctionnelles; captures mobile/tablette/catalogue/sombre relues.
- Statut suivant : attendre la validation ou les corrections sur l'exemple V1. E17 reste actif; aucune construction du produit ni passage à E18.
