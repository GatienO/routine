# PAGE-01 — Routines — diagnostic et propositions globales

Date : 2026-09-15

## Cadrage validé

Permettre au parent de comprendre le prochain moment, préparer l’enfant avec la météo et le calendrier, puis lancer facilement une routine accompagnée.

Exclusions : aucune page centrée sur un enfant, aucun planning familial, aucune interaction autonome de l’enfant hors routine et aucun backend.

## Socle identitaire commun aux trois directions

Les propositions A, B et C ne sont **pas** trois identités graphiques. Elles testent uniquement trois organisations de la même page. Elles conservent toutes :

- le fond crème et les surfaces blanches en mode clair, avec un mode sombre conçu spécifiquement ;
- la menthe pour agir, la lavande pour le temps, le ciel pour la météo et l’abricot pour préparer la tenue ;
- les grands ronds pastel partiellement hors cadre et les petits galets utiles comme signature ;
- les rayons 14 / 18 / 22 px, la typographie système arrondie et deux graisses ;
- un outil parental calme, puis une expression plus ludique seulement dans la routine accompagnée ;
- une action principale menthe, au plus trois couleurs fonctionnelles simultanées et aucune animation décorative permanente ;
- la marque compacte `R` + trois points, le bouton jour/nuit sans texte et la navigation basse flottante avec seule l’entrée active en menthe.

Les visuels comparatifs ont été corrigés le 2026-09-15 pour rétablir ce socle. Toute proposition qui l’omet est invalide, même si sa composition est intéressante.

## Diagnostic du produit réel

La page actuelle contient bien les fonctions principales : météo, tenue configurable, routine prioritaire, aperçu d’étapes, lancement, reprise, calendrier enfant, autres routines, enchaînement, création et gestion. Le header et la navigation basse appartiennent au shell commun.

Les 17 captures contrôlées ne présentent aucun débordement horizontal et les cibles détectées atteignent 44 px. Elles révèlent néanmoins plusieurs problèmes globaux :

- sur mobile, météo, reprise, routine puis calendrier forment une succession de grandes cartes; le calendrier et les autres routines descendent rapidement sous le premier écran ;
- météo et routine sont toutes les deux très dominantes, ce qui rend la priorité du moment moins immédiate ;
- sur tablette, la composition routine + calendrier fonctionne mieux, mais les panneaux gardent beaucoup de hauteur même avec peu de contenu ;
- sur grand écran, le contenu utile occupe la partie haute puis laisse une grande zone vide ;
- l’état vide conserve une grande carte de routine presque vide ;
- la reprise ajoute un bloc complet au lieu de transformer l’action principale existante ;
- le tiroir d’enchaînement devient immense sur tablette et laisse beaucoup d’espace inutilisé ;
- le panneau de tenue est fonctionnel, mais ressemble à un outil séparé de la météo qui l’a déclenché ;
- le premier démarrage affiche une création de profil local qui masque entièrement Routines : c’est un état global oublié qui devra être revu dans la phase détaillée ;
- les ronds pastel existent, mais plusieurs sont seulement décoratifs et ne renforcent pas encore clairement le repérage dans le temps.

## Proposition A — Le prochain pas

### Hiérarchie et structure

La routine à lancer est l’élément central. La météo devient un bandeau de préparation compact au-dessus. Le calendrier enfant reste un repère latéral sur tablette et un résumé court après la routine sur mobile. La reprise remplace la zone d’action de la routine au lieu d’ajouter une carte supplémentaire.

### Parcours

Voir les conditions → comprendre le prochain moment → lancer ou reprendre → consulter les autres routines si nécessaire.

### Responsive

- Mobile : météo compacte, routine complète immédiatement après, calendrier résumé, autres routines.
- Tablette : météo pleine largeur, routine dominante à gauche, calendrier de même hauteur à droite.
- Bureau : même composition dans une largeur maximale maîtrisée, liste secondaire densifiée sans étirer les cartes.

### Signature

Un chemin de trois petits galets relie météo, routine et temps. Les grands ronds de fond sont réduits et placés seulement aux changements de section.

### Bénéfice et risque

Bénéfice : l’action attendue est comprise immédiatement par le parent. Risque : le calendrier enfant paraît secondaire si son résumé devient trop discret sur mobile.

## Proposition B — Aujourd’hui en trois repères

### Hiérarchie et structure

La page est organisée comme une journée en trois repères égaux : `Le temps qu’il fait`, `Ce qu’on fait maintenant`, `Ce qui vient après`. La routine reste l’unique action forte, mais météo et calendrier participent visuellement à la même séquence.

### Parcours

Observer aujourd’hui → situer maintenant/après → démarrer la routine proposée → explorer les suivantes.

### Responsive

- Mobile : trois repères verticaux courts reliés par un chemin.
- Tablette : météo et calendrier forment une colonne temporelle; la routine occupe la colonne principale.
- Bureau : composition asymétrique 2/3–1/3 avec les trois repères alignés en hauteur.

### Signature

Les ronds deviennent des jalons temporels utiles portant une icône, un mot et un état. La lavande reste réservée au temps, le ciel à la météo et la menthe à l’action.

### Bénéfice et risque

Bénéfice : meilleure cohérence avec l’objectif d’aider les enfants à se repérer dans le temps. Risque : la page peut devenir trop narrative pour un parent qui veut seulement lancer rapidement une routine.

## Proposition C — Le tableau calme du parent

### Hiérarchie et structure

La routine et son action occupent la première zone. Météo, tenue et calendrier sont regroupés dans une barre de contexte compacte. Les autres routines utilisent une liste dense avec gestion et enchaînement dans un menu secondaire.

### Parcours

Lancer ou reprendre immédiatement → vérifier un contexte si besoin → gérer les autres outils depuis des superpositions.

### Responsive

- Mobile : routine au premier écran, contexte météo/temps replié dessous.
- Tablette et bureau : routine large avec rail latéral compact; plusieurs routines visibles sans défilement important.
- Les outils secondaires utilisent des panneaux dimensionnés par leur contenu plutôt que toute la hauteur.

### Signature

Un seul grand galet illustré marque la routine; le reste est volontairement neutre et parental.

### Bénéfice et risque

Bénéfice : efficacité maximale et densité réduite. Risque : météo et calendrier deviennent trop discrets, et l’identité enfantine est moins présente.

## Recommandation

**A + le langage temporel de B** : conserver la routine comme prochain pas évident, tout en donnant une fonction réelle aux galets pour relier météo, maintenant et après. Cette combinaison répond au besoin parental sans sacrifier le calendrier enfant.

Cette recommandation concerne uniquement l’organisation globale. Elle ne valide aucun composant, texte, couleur, panneau ou comportement détaillé.

## Décision

**A — Le prochain pas** a été choisie par l’utilisateur le 2026-09-16.

Cette validation fixe seulement la hiérarchie générale : météo de préparation, routine dominante, calendrier contextuel et autres routines en second niveau. Tous les éléments restent à auditer et valider séparément dans `INVENTORY.md`.

## Comparatif visuel

Les trois directions utilisent le même contenu fonctionnel et peuvent être comparées en mobile et tablette dans `routines-directions.html`, livré avec la demande de validation. Seule la hiérarchie change; l’identité visuelle reste constante.
