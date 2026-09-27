# Directions de style global

> Direction retenue : **Pastel utile**. Sa déclinaison complète est définie dans [VISUAL_IDENTITY.md](./VISUAL_IDENTITY.md).

Date : 2026-09-13

Statut : direction validée le 2026-09-13 et base structurelle intégrée.

## Direction consolidée — Pastel utile

Préférences explicitement exprimées :

- couleurs pastel ;
- mode clair et mode sombre ;
- couleurs simples, peu nombreuses et efficaces ;
- caractère enfantin et ludique ;
- interactions évidentes ;
- interface globalement simple.

Décision proposée : un shell parental calme avec trois accents pastel stables — menthe pour l'action, lavande pour le temps, bleu ciel ou abricot pour la météo et les moments ludiques. Les couleurs gagnent en présence dans le calendrier enfant et les routines accompagnées, sans modifier la structure des composants.

Le mode sombre utilise un fond bleu nuit et des surfaces anthracite, jamais du noir pur. Les accents pastel restent reconnaissables mais sont assombris en grandes surfaces afin de préserver le contraste.

## Décision de méthode

Le style global ne sera pas repoussé à la fin du rebuild. Les tokens, composants partagés et premières pages dépendent de cette décision. La direction visuelle doit donc être validée avant la construction du shell réel.

L'application possède deux niveaux d'expression :

- le shell et les outils parentaux doivent rester calmes, efficaces et crédibles ;
- le calendrier enfant, la météo pédagogique et les routines accompagnées peuvent devenir plus illustrés et ludiques.

Le style ne doit pas donner l'impression que toute l'application est un jeu pour enfant.

## A — Atelier doux

- Couleurs chaudes, crème, terre cuite et papier.
- Titres plus éditoriaux et formes légèrement artisanales.
- Sensation familiale et humaine.
- Risque : paraître décoratif ou moins immédiatement lisible dans les outils denses.

## B — Signal clair

- Structure nette, surfaces lumineuses, bleu-vert calme et accents jaunes.
- Peu d'ombres, rayons modérés et informations rapidement scannables.
- Le ludique est réservé aux pictogrammes et aux modes accompagnés.
- Risque : devenir trop générique si les illustrations et micro-interactions manquent de personnalité.

## C — Album vivant

- Contrastes graphiques, formes asymétriques et compositions plus expressives.
- Forte identité pour le calendrier, la météo et les routines.
- Sensation mémorable sans utiliser une palette « bébé ».
- Risque : fatiguer le parent si cette intensité est appliquée à toutes les pages de gestion.

## Combinaisons possibles

- **B + touches de A** : shell clair avec chaleur éditoriale.
- **B + moments C** : outils parentaux calmes, calendrier et routine plus expressifs.
- **A + structure B** : matières et palette chaleureuses avec géométrie plus fonctionnelle.

Les trois directions initiales ont servi à clarifier le choix. Elles sont remplacées par **Pastel utile**, plus simple que C, plus enfantin que B et moins éditorial que A.

## Éléments à figer après le choix

- palette sémantique ;
- typographies et échelle ;
- rayons, bordures et ombres ;
- densité des cartes ;
- style des pictogrammes et illustrations ;
- barre de navigation ;
- panneaux et confirmations ;
- intensité visuelle des modes enfant ;
- mouvement et réduction des animations ;
- variantes contraste élevé et texte agrandi.

## Validation attendue

- [x] STYLE-D01 — Choisir la direction Pastel utile.
- [x] STYLE-D02 — Garder les outils parentaux simples et calmes.
- [x] STYLE-D03 — Rendre le calendrier et les routines enfantins, ludiques et interactifs.
- [x] STYLE-D04 — Déclinaison mobile et tablette contrôlée à 320, 390 et 768 px.
- [x] STYLE-D05 — Construction locale du design system autorisée.
