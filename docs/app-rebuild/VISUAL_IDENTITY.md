# Identité visuelle — Routine

## Positionnement

**Routine est un compagnon calme pour les parents et un repère vivant pour les enfants.**

Signature proposée : **Des repères simples, ensemble.**

L’application n’est ni un tableau de productivité familial, ni un jeu autonome pour enfant. Elle donne aux parents des outils clairs et transforme uniquement les moments vécus avec l’enfant — routine, météo, repérage dans le temps — en expériences simples, visuelles et rassurantes.

## Principes de l’identité

1. **Rassurer avant de divertir** : l’interface parent reste sobre, stable et prévisible.
2. **Rendre visible avant d’expliquer** : étapes, pictogrammes et progression remplacent les longs textes.
3. **Une couleur, une fonction** : la couleur aide à comprendre ; elle ne sert pas de décoration gratuite.
4. **Le jeu apparaît avec l’enfant** : davantage d’échelle, de couleur et de feedback seulement en mode accompagné.
5. **Clair et sombre sont deux ambiances conçues** : le mode sombre n’est pas une simple inversion.

## Signe de marque

Le signe repose sur trois éléments :

- un contenant arrondi, protecteur ;
- un **R** simple, immédiatement reconnaissable ;
- trois points formant un petit chemin, symbole des étapes, du rythme et de la progression.

Le logo reste calme. Les mascottes et illustrations enfantines sont réservées aux contenus pédagogiques, jamais utilisées comme navigation globale.

## Couleurs sémantiques

| Famille | Rôle | Exemples |
| --- | --- | --- |
| Menthe | action et progression | lancer, continuer, étape terminée |
| Lavande | temps et repères | calendrier, aujourd’hui, bientôt |
| Ciel | information et météo | température, pluie, conseil |
| Abricot | transition et chaleur | matin, préparation, vêtement chaud |
| Corail | attention uniquement | erreur, suppression, alerte importante |

### Thème clair

| Token | Valeur |
| --- | --- |
| `background` | `#F7F5EF` |
| `surface` | `#FFFFFF` |
| `surfaceMuted` | `#EFEEE9` |
| `text` | `#303743` |
| `textMuted` | `#68707B` |
| `border` | `#DEDFDC` |
| `mintSoft` | `#B8DFCF` |
| `mintStrong` | `#397862` |
| `lavenderSoft` | `#D8D0F2` |
| `skySoft` | `#BFE1EF` |
| `apricotSoft` | `#FFD8AE` |
| `coralSoft` | `#F4B5AE` |

### Thème sombre

| Token | Valeur |
| --- | --- |
| `background` | `#171B23` |
| `surface` | `#222834` |
| `surfaceMuted` | `#2C3340` |
| `text` | `#F5F3ED` |
| `textMuted` | `#B5BDC8` |
| `border` | `#394351` |
| `mintSoft` | `#31594C` |
| `mintStrong` | `#A9DDC8` |
| `lavenderSoft` | `#453E60` |
| `skySoft` | `#304F5E` |
| `apricotSoft` | `#5B4633` |
| `coralSoft` | `#5B373B` |

Les fonds pastel portent toujours un texte foncé en thème clair et un texte clair en thème sombre. Le contraste réel devra être vérifié sur chaque composant, pas seulement sur les tokens isolés.

## Typographie

- Police système arrondie en priorité : `ui-rounded`, puis polices natives.
- Aucun ajout de dépendance nécessaire pour la première intégration.
- Deux graisses principales : normale pour lire, semi-grasse pour agir et structurer.
- Titres courts ; pas de capitales décoratives ; interlignage généreux.
- En mode accompagné : chiffres, pictogrammes et verbes d’action plus grands que le texte explicatif.

## Formes et profondeur

- Rayon `14` pour les contrôles.
- Rayon `18` pour les panneaux.
- Rayon `22` pour les cartes principales et les écrans accompagnés.
- Boutons tactiles de `44 × 44` minimum ; cible recommandée de `48 × 48` pour l’enfant.
- Une bordure légère structure les outils parentaux.
- Deux ombres maximum : carte soulevée et superposition. Aucune ombre décorative sur chaque élément.

## Iconographie et illustrations

- Conserver Phosphor pour les actions et la navigation parentales.
- Employer uniquement le style **Regular linéaire** : trait simple de 1,5 à 2 px, extrémités arrondies, sans aplat, sans Duotone et sans mélange de familles.
- Garder des formes immédiatement reconnaissables et peu détaillées, avec une taille et une épaisseur visuelle cohérentes.
- Réserver emojis, vêtements illustrés et éléments météo expressifs aux contenus vécus avec l’enfant.
- Ne jamais utiliser la couleur seule pour transmettre un état : ajouter texte, icône ou forme.

## Deux niveaux d’expression

### Outils parentaux

Calmes, denses juste ce qu’il faut, orientés décision. Fonds neutres, couleurs pastel en accents, libellés précis et actions regroupées. Exemples : organiser les routines, choisir les participants, préparer demain, modifier une activité.

### Mode accompagné

Plus visuel et plus généreux. Une seule intention à la fois, gros pictogrammes, progression évidente et feedback immédiat. L’adulte garde la maîtrise des sorties, réglages et modifications.

## Composants de base

- **Bouton principal** : menthe, réservé à l’action attendue de l’écran.
- **Bouton secondaire** : surface neutre avec bordure.
- **Bouton fantôme** : actions discrètes, jamais l’action principale.
- **Action destructive** : corail, avec libellé explicite et confirmation si la perte est importante.
- **Carte outil** : titre, contexte court, une action visible ; pas de liste de liens imbriquée.
- **Carte enfant** : pictogramme ou illustration, phrase courte, grande cible.
- **Pastille** : filtre ou état ; ne remplace pas un bouton important.
- **Superposition** : catalogue, détail, filtres et sélecteurs afin de réduire les routes, avec fermeture claire et retour préservé.

## Mouvement

- Pression : `120–150 ms`.
- Ouverture de panneau : `180–220 ms`.
- Progression de routine : transition courte, positive et non bloquante.
- Pas d’animation continue dans les outils parentaux.
- Respect systématique de la réduction des animations.

## Ton rédactionnel

La voix est chaleureuse, directe et jamais infantilisante pour le parent.

- Préférer : **Lancer avec Emma**.
- Préférer : **On vérifie la météo ensemble**.
- Préférer : **Il manque une étape. Ajoutez-la pour continuer.**
- Éviter : formulations techniques, félicitations excessives, textes longs et injonctions culpabilisantes.

## Règles par fonctionnalité

### Routines

La couleur montre l’avancement, pas la personnalité de chaque enfant. Le lancement commence par la routine, puis demande les participants si nécessaire. L’exécution devient l’écran le plus expressif de l’application.

### Calendrier enfant

Lavande comme repère principal. Montrer **hier, aujourd’hui, demain**, puis **maintenant, ensuite, plus tard**. Ce n’est pas un planning familial : seuls les événements utiles au repérage de l’enfant sont présents.

### Météo et habillement

Ciel pour le constat météo, abricot pour la préparation. Le parent voit un conseil rapide ; dans la routine, l’enfant choisit ou confirme les vêtements avec l’adulte.

### Activités

Les couleurs servent les catégories et filtres sans transformer l’écran en mosaïque arc-en-ciel. Une activité mise en avant à la fois ; surprise, favoris et historique restent des outils secondaires.

## Garde-fous

- Une seule action principale par écran ou superposition.
- Trois couleurs fonctionnelles maximum visibles simultanément.
- Aucun écran personnel permanent par enfant.
- Aucun calendrier familial généraliste.
- Aucun effet ludique qui ralentit une tâche parentale.
- Aucun texte essentiel dans une illustration.
- Toutes les interfaces doivent rester utilisables à 320 px, en grand texte et en thème sombre.

## Ordre d’intégration

1. Créer les tokens clair/sombre et les primitives de surface, texte, bordure et état.
2. Refaire le shell et la navigation à trois intentions.
3. Uniformiser boutons, cartes, pastilles, champs et superpositions.
4. Appliquer le niveau parent aux écrans Routines, Activités et Parent.
5. Construire le niveau accompagné pour l’exécution des routines.
6. Ajouter le calendrier enfant et la météo avec leurs rôles couleur dédiés.
7. Vérifier contraste, tailles tactiles, grand texte, réduction des animations et cohérence des libellés.
