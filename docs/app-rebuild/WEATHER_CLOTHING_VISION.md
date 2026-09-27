# Vision produit — Météo et tenue accompagnée

Date : 2026-09-12

Statut : décisions intégrées dans la base structurelle; finition visuelle à traiter page par page.

## Intention

La météo est un outil parental de préparation qui devient un apprentissage ludique uniquement pendant une routine accompagnée.

Elle doit aider l'enfant à comprendre trois relations simples :

- il fait frais ou chaud → j'ajuste les couches ;
- il pleut ou neige → je protège ce qui doit rester sec ;
- il y a du vent ou du soleil → j'ajoute la protection adaptée.

Le système propose; le parent garde toujours la décision finale selon le confort, la santé et les habitudes de l'enfant.

## Deux niveaux d'usage

### Outil parental

Sur Routines et dans les réglages météo, le parent voit :

- le moment concerné : matin, sortie, école ou soir ;
- température et ressenti ;
- pluie, vent et soleil utiles à la décision ;
- une tenue courte proposée par zones : corps, jambes, pieds, extérieur ;
- une explication `Pourquoi ?` ;
- l'action `Utiliser dans la routine`.

Cette surface sert à préparer les vêtements ou adapter une routine. Elle n'est pas une page personnelle d'enfant.

### Étape ludique de routine

Lorsque la routine contient `Regarder le temps` ou `Choisir la tenue` :

1. l'adulte lit ou montre le temps observé ;
2. l'enfant choisit parmi quelques vêtements visibles ;
3. l'application explique la relation, sans punir un mauvais choix ;
4. l'adulte vérifie le confort réel et valide l'étape.

L'enfant n'accède à ce jeu que dans la routine plein écran et accompagné.

## Interaction recommandée

- Limiter le choix à 3 ou 4 vêtements à la fois.
- Utiliser les illustrations de vêtements déjà présentes dans le projet.
- Montrer les indices avant le choix : thermomètre, pluie, vent, soleil.
- Répondre par une explication courte : `Le pull garde la chaleur`.
- Accepter l'exploration et permettre de changer d'avis.
- Ne pas employer de croix rouge, score négatif ou son d'échec.
- Terminer par `On vérifie ensemble` plutôt que `Bonne réponse`.

## Règles de recommandation

La proposition doit combiner :

- température ressentie, pas seulement température brute ;
- précipitations et intensité ;
- vent ;
- moment de la journée configuré ;
- activité prévue : intérieur, école, sortie calme ou activité physique ;
- préférences parentales éventuellement enregistrées.

Les règles doivent rester testables et explicables. Une recommandation doit pouvoir fournir ses raisons, par exemple :

```text
pull léger → ressenti frais
imperméable → pluie prévue
bottes → pluie durable ou flaques probables
casquette → soleil et sortie extérieure
```

## États indispensables

- météo disponible et récente ;
- météo ancienne ou indisponible ;
- localisation refusée avec ville saisie manuellement ;
- aucun lieu configuré ;
- changement rapide entre matin et après-midi ;
- forte pluie, vent, chaleur ou froid ;
- activité uniquement intérieure ;
- vêtement recommandé non disponible ;
- enfant sensible au froid ou à la chaleur ;
- plusieurs enfants ayant des besoins différents.

En cas d'incertitude, afficher `Regardez dehors et vérifiez ensemble` au lieu d'inventer une précision.

## Architecture proposée

```text
WeatherObservation = conditions et fraîcheur de la donnée
WeatherContext = lieu + moment + activité prévue
ClothingPreference = ajustements décidés par le parent
ClothingRecommendation = vêtements proposés + raisons
GuidedClothingStep = sélection simplifiée incluse dans une routine
```

Le service météo et les recommandations existants doivent être réutilisés. Le réglage des horaires météo reste une configuration parentale. Aucune donnée météo ne doit créer un nouveau store concurrent.

## Confidentialité et sécurité

- Demander la géolocalisation au moment où le parent choisit cette option.
- Fournir toujours la saisie manuelle d'une ville.
- Ne jamais exposer une position précise dans le mode routine.
- Présenter les vêtements comme suggestions et non prescriptions de santé.
- Le parent valide en dernier ressort.

## Mesures de réussite

- Le parent comprend la tenue proposée et sa raison en quelques secondes.
- Il peut injecter la tenue dans une routine sans ressaisie.
- Pendant la routine, l'enfant relie au moins un indice météo à un vêtement.
- Un refus de localisation ne bloque pas l'outil.
- Une météo indisponible ne produit pas de conseil trompeur.
- Les choix restent utilisables à 320 px et avec de gros pictogrammes.

## Décisions validées

- [x] MET-D01 — Nom : `Météo & tenue`.
- [x] MET-D02 — Outil contextuel permanent sur Routines et étape seulement quand la routine le prévoit.
- [x] MET-D03 — Ajout manuel dans le constructeur, avec reconnaissance des anciennes étapes d’habillage.
- [x] MET-D04 — Repères horaires persistants par enfant; ajustement de tenue seulement temporaire.
- [x] MET-D05 — Trois ou quatre vêtements proposés dans le jeu accompagné.
