# Audit graphique — Shell global et Routines

Date : 2026-09-14

## Objectif

Donner à Routine une identité immédiatement reconnaissable, douce et vivante, tout en gardant le parent maître de l’outil. Le shell doit rester stable sur Routines, Activités et Parent; la page Routines doit permettre de choisir, préparer puis lancer sans devenir un tableau de bord dense.

Exclusions : aucune modification de logique métier, de store, de route ou de données; aucun nouvel écran; aucun profil autonome par enfant.

## Diagnostic du rendu réel

- La palette est conforme, mais les surfaces rectangulaires dominent encore l’expérience.
- Les deux grands ronds coupés ressemblent à des aplats décoratifs; ils ne racontent ni chemin, ni temps, ni progression.
- À 390 px, le nom et la signature de Routine disparaissent entièrement de l’en-tête.
- Le contrôle Clair/Sombre concurrence la marque et le titre de page.
- Le titre, la carte principale et les outils contextuels utilisent des volumes proches; la hiérarchie manque de contraste.
- Les cartes Calendrier et Météo sont très hautes lorsque la routine est absente.
- La navigation active est lisible, mais son grand rectangle menthe la rapproche d’un bouton primaire.
- Les actions secondaires utilisent plusieurs traitements : engrenage seul, pastille blanche, carte entière cliquable.
- Les états vide, reprise et routine disponible changent fortement la hauteur du premier écran.
- L’ensemble est propre et utilisable, mais pas encore assez singulier, chaleureux ou ludique.

## Trois directions globales

### A — Le chemin de galets — recommandée

Une suite de ronds et de cartes courtes forme un chemin vertical : le rond principal porte le moment ou le pictogramme, de petits points relient la routine aux outils Calendrier et Météo. La carte de routine reste calme et blanche; les ronds donnent le rythme.

- Bénéfice : transforme les ronds aimés en langage utile de progression et de repérage.
- Mobile : chemin vertical compact, marque toujours visible, outils contextuels en deux cartes courtes.
- Tablette : grande routine à gauche, constellation Calendrier/Météo à droite.
- Risque : demande de bien limiter les points décoratifs pour éviter l’effet “jeu de plateau”.

### B — Le carnet de repères

Une grande feuille centrale rassemble la routine du moment. Les ronds pastel deviennent des onglets ou cachets sur les bords; Calendrier et Météo ressemblent à deux marque-pages.

- Bénéfice : très rassurant et familial, lecture particulièrement simple pour le parent.
- Mobile : une feuille principale et deux marque-pages empilés.
- Tablette : feuille large avec colonne d’annotations.
- Risque : moins interactif et moins enfantin pendant les moments partagés.

### C — La constellation douce

Le contenu s’organise autour d’un grand cercle “Aujourd’hui”, entouré de trois modules : routine, temps, météo. La navigation reprend de petits indicateurs circulaires.

- Bénéfice : identité forte et mémorable, très adaptée au calendrier enfant.
- Mobile : constellation réordonnée en cartes imbriquées; grand cercle réduit.
- Tablette : composition asymétrique plus expressive.
- Risque : plus délicate avec les textes longs et potentiellement trop décorative pour les outils parentaux.

## Recommandation consolidée

Direction A, avec la chaleur calme du carnet B : un **chemin de galets pastel** dans les moments accompagnés, mais des cartes parentales neutres et très lisibles.

Décision utilisateur du 2026-09-14 : **A + C**. Le chemin de galets structure l’usage; la constellation apporte l’asymétrie et les petits astres autour des outils contextuels. La sobriété parentale reste non négociable.

Ajustement utilisateur : à partir de 768 px, la routine reste le premier bloc à gauche. À droite, un petit calendrier de la journée occupe le haut; la météo et les vêtements conseillés sont placés juste dessous.

Deuxième ajustement utilisateur : le titre éditorial de Routines est remplacé par une météo pleine largeur de hauteur comparable. Le panneau sous le calendrier devient `Tenue proposée` pour éviter de répéter les mêmes informations. `Gérer les routines` est déplacé près de la liste secondaire.

Troisième ajustement utilisateur : la tenue proposée et son action configurable rejoignent directement l’en-tête météo. À partir de 768 px, le calendrier devient l’unique panneau droit et prend toute la hauteur de la carte Routine.

Quatrième ajustement utilisateur : le thème est porté par l’élément racine et le corps occupe au minimum toute la hauteur de la fenêtre. Le fond ne laisse donc plus apparaître de bande claire sur les écrans hauts, en mode sombre comme en mode clair.

Cinquième ajustement utilisateur : sur tablette et desktop, l’identité compacte `R` accompagne à gauche la navigation directe entre Routines, Activités et Parent. À droite, le libellé `Ambiance` disparaît au profit d’un sélecteur visuel jour/nuit. Sur mobile, la navigation basse reste prioritaire afin de préserver de grandes cibles tactiles sans dupliquer les liens dans l’en-tête.

Sixième ajustement utilisateur : le header est réduit à deux icônes, sans texte visible. Le symbole Routine à gauche ramène toujours à la page principale. À droite, une seule icône contextuelle lune/soleil bascule entre les thèmes sombre et clair. Les libellés accessibles restent présents pour les technologies d’assistance.

Septième ajustement utilisateur : la navigation basse Routines / Activités / Parent reste persistante sur mobile, tablette et desktop. Sa disparition à partir de 720 px provenait d’une règle responsive devenue invalide après le retrait de la navigation haute.

Principes proposés :

- marque complète `R · Routine` toujours visible, même à 320 px;
- thème déplacé dans un contrôle circulaire compact, libellé accessible;
- petits ronds reliés comme signature, jamais deux énormes disques sans fonction;
- routine du moment clairement dominante;
- Calendrier et Météo deviennent deux étapes contextuelles compactes;
- navigation flottante plus légère, avec un cercle coloré sous l’icône active et le texte toujours visible;
- un seul aplat pastel fort dans le premier écran;
- aucun mouvement permanent; les trois points du chemin réagissent seulement lors d’une action.

## Inventaire à valider

- P00-E01 — Marque et en-tête : nom conservé sur mobile; thème compact.
- P00-E02 — Fond et ronds : chemin de galets fonctionnel, intensité calme.
- P00-E03 — Navigation : trois destinations, sélection circulaire légère.
- P01-E01 — Titre Routines : contexte court, réglages secondaires explicites.
- P01-E02 — Routine principale : pictogramme rond, participants, durée et trois étapes.
- P01-E03 — Action principale : un seul bouton `Lancer avec…`.
- P01-E04 — Calendrier : galet lavande, Maintenant/Après, accès entier cliquable.
- P01-E05 — Météo : galet ciel/abricot, constat puis préparation.
- P01-E06 — Autres routines : liste courte, action de création secondaire.
- P01-E07 — États : vide, chargement météo, erreur, reprise, texte long et plusieurs enfants.
- P01-E08 — Responsive : 320/390 vertical; 768/1440 composition 2/3 + 1/3.
- P01-E09 — Accessibilité : 44 px, contraste, grand texte, focus et aucune information par couleur seule.
- P01-E10 — Mouvement : pression courte uniquement et réduction des animations.

## Porte de validation

La construction applicative commence après validation d’une direction ou d’une combinaison explicite.
