# Architecture cible proposée

## Principe directeur

Une destination répond à une intention durable. Une superposition répond à une tâche courte. Une route immersive répond à un moment qui exige toute l'attention.

Cette règle ramène l'application à trois destinations persistantes sans supprimer les capacités existantes.

## Navigation cible

```text
Barre basse
├── Routines
├── Activités
└── Parent

Routines
├── Prochaines routines de la famille
├── Toutes les routines (recherche et filtres repliables)
├── Calendrier enfant (surface prioritaire route-backed)
└── Lancement accompagné (seul mode enfant)

Activités
├── Découvrir
├── Favoris
├── Récentes
├── Surprise (superposition)
└── Détail (superposition route-backed)

Parent — protégé
├── Famille
├── Routines
├── Calendrier
├── Progrès
└── Réglages
```

La barre basse disparaît pendant le lancement accompagné, l'exécution, le bien-être, la célébration et les formulaires plein écran. Les profils enfants sont des données associées aux routines et événements, jamais des destinations ni des pages d'accueil personnelles.

## Posture produit

Le shell normal est un outil pour les parents. L'enfant ne navigue pas seul dans Routines, Activités, Calendrier ou Parent. Son interaction commence uniquement lorsqu'un adulte lance une routine et reste présent pour l'accompagner.

Conséquences :

- aucune page `Bonjour <enfant>` servant de tableau de bord personnel ;
- aucune navigation principale propre à un enfant ;
- les enfants apparaissent sous forme d'étiquettes, participants ou filtres contextuels ;
- le parent choisit ponctuellement le calendrier à préparer ou à montrer, sans changer toute l'application de contexte ;
- le mode enfant est temporaire, plein écran et rattaché à une routine précise ;
- le PIN reste un réglage de sécurité optionnel, pas la définition de l'espace Parent.

## Trois directions globales

- **A — Trois maisons** : chaque onglet possède son propre tableau de bord et toutes les fonctions secondaires s'ouvrent au-dessus. Très lisible, mais peut conserver trop de blocs de synthèse.
- **B — Une intention, une action forte** : chaque destination met une seule action prioritaire au premier écran et replie le reste. Plus simple pour l'enfant, mais nécessite une hiérarchie stricte.
- **C — Parcours guidés** : presque tout devient une séquence pas à pas. Très rassurant pour la création et le lancement, mais trop lent pour les usages fréquents.

Recommandation : **B avec C uniquement pour le lancement et le constructeur Parent**.

## Surface Routines

Action principale : permettre au parent de préparer puis lancer la prochaine routine avec le bon enfant ou groupe d'enfants.

Ordre proposé :

1. contexte familial du jour, sans enfant sélectionné globalement ;
2. prochaines routines avec participants, durée, étapes et bouton `Lancer avec…` ;
3. contexte compact météo/humeur seulement s'il aide le parent à adapter la routine ;
4. entrée visible `Calendrier enfant` avec le prochain repère de l'enfant concerné ;
5. accès `Voir toutes les routines` ;
6. suivi et récompenses comme outils parentaux secondaires.

La recherche et les filtres ne doivent pas occuper le premier écran tant que le parent n'a pas demandé toutes les routines.

### Météo et tenue

La météo apparaît comme outil de préparation familiale et peut injecter deux étapes dans une routine : `Regarder le temps` puis `Choisir la tenue`. L'apprentissage ludique se produit seulement dans la routine accompagnée. Le parent conserve la décision finale et peut modifier la proposition.

Voir [WEATHER_CLOTHING_VISION.md](./WEATHER_CLOTHING_VISION.md) pour les règles, états et garde-fous.

## Surface Activités

Action principale : trouver rapidement une idée adaptée au contexte.

- Segments internes : `Découvrir`, `Favoris`, `Récentes`.
- Recherche toujours disponible, filtres dans une feuille.
- `Surprise` ouvre une feuille courte puis affiche le résultat dans le détail superposé.
- Une carte montre uniquement le minimum pour décider : titre, durée, lieu, énergie et matériel essentiel.
- Le détail reste au-dessus de la liste afin que la fermeture restitue exactement recherche, filtres et position de scroll.

## Système de calendrier et repérage temporel

Le calendrier est une capacité transversale majeure conçue pour l'enfant. Son interface principale est simple, visuelle et orientée Maintenant / Après / Demain / Dodos.

- **Calendrier enfant** donne les repères temporels dans le langage de l'enfant ;
- **Configurer les repères** permet au parent d'ajouter dates, horaires, routines et événements sans exposer un agenda adulte dans la vue enfant.

L'enfant ne manipule pas cette vue de façon autonome : le parent l'ouvre et la parcourt avec lui. Le calendrier reste accessible depuis Routines et se configure dans la section Calendrier, sans devenir une page d'accueil personnelle.

Voir [CALENDAR_VISION.md](./CALENDAR_VISION.md) pour les principes et étapes spécifiques.

## Surface Parent

L'espace Parent regroupe les outils de configuration. Un PIN peut protéger les actions sensibles ou la sortie du mode routine, mais la navigation parentale normale ne doit pas être conçue comme un espace secondaire derrière l'expérience enfant.

Les cinq sections sont une navigation interne au contenu, pas cinq onglets globaux :

- **Famille** : profils utilisés comme participants, ajouter/modifier, sans page personnelle.
- **Routines** : liste, tri, création, édition, duplication, fusion et corbeille contextuelle.
- **Calendrier** : préparer les repères temporels montrés à l'enfant.
- **Progrès** : suivi et récompenses réelles.
- **Réglages** : météo, sécurité, import/export et corbeille.

Sur mobile, ces sections peuvent être des boutons segmentés défilants ou une grille d'accueil courte. Sur tablette et grand écran, elles peuvent devenir un rail latéral. Les URLs historiques restent des alias vers `section` et `panel` pour préserver les favoris et liens.

## Modèle de superposition

Trois niveaux maximum :

1. **Destination** : Routines, Activités ou Parent.
2. **Panneau de tâche** : détail, filtres, calendrier, formulaire, surprise.
3. **Confirmation** : suppression, abandon, récompense réclamée.

Ne jamais ouvrir un quatrième niveau. Fermer une confirmation revient au panneau; fermer le panneau revient à la destination avec son état intact.

### Types de surfaces

- **Bottom sheet** : choix courts, filtres, humeur, confirmation.
- **Feuille plein écran** : création/édition complexe sur téléphone.
- **Panneau latéral** : même tâche sur tablette ou desktop.
- **Modal centrée** : confirmations seulement.
- **Route immersive** : exécution et respiration/bien-être.

Les détails importants conservent une URL route-backed pour le bouton retour, le rafraîchissement web et les liens profonds.

## Machines d'état à introduire

### Lancement

```text
idle → routineSelected → mood? → summary → presence? → running
                                           ↘ cancel → idle
running ↔ paused
running → wellness? → running
running → celebration → idle
```

La présence et l'humeur restent optionnelles selon la configuration. Une seule machine décide de l'étape suivante.

### Constructeur de routine

```text
details → steps → schedule → review → saved
   ↑         ↑
catalogue  stepCatalogue
```

Création et édition utilisent le même état et le même validateur. Le catalogue préremplit; il n'enregistre jamais directement.

## Découpage de code cible

```text
app/                         routes minces, redirections et présentation des overlays
src/features/routines/       lanceur, launch flow, exécution, constructeur partagé
src/features/activities/     découverte, collections, surprise et détail existants
src/features/parent/         shell Parent et cinq sections
src/features/calendar/       vues et logique de calendrier partagées
src/features/rewards/        progression virtuelle et récompenses concrètes explicites
src/components/              composants réellement transversaux
src/stores/                  stores existants, sans duplication
src/constants/               tokens et configuration produit
```

Les routes ne portent pas la logique métier. Elles lisent les paramètres, ouvrent la bonne surface et délèguent à une feature.

## Socle global applicable partout

- Un seul shell avec largeur, safe areas et comportement clavier communs.
- Une seule barre basse à trois intentions.
- Un registre central des routes, panels et conditions de visibilité.
- Un composant commun de feuille responsive et un composant de confirmation.
- Restitution du focus et du scroll après fermeture.
- Cibles tactiles de 44 × 44 px minimum.
- Titres et boutons courts, vocabulaire stable entre enfant et parent.
- Un seul feedback animé par action et respect de la réduction des animations.
- États standardisés : chargement, vide, erreur, succès et reprise.
- Télémétrie locale éventuelle limitée à des événements anonymes; aucune donnée enfant sensible.
- Aucun scroll horizontal involontaire à 320 px et à 200 % de zoom web.

## Décisions produit à valider

| ID | Proposition | Recommandation |
|---|---|---|
| G-01 | Nombre de destinations persistantes | 3 |
| G-02 | Rôle de l'Accueil actuel | Supprimé comme destination; contenu utile absorbé par Routines |
| G-03 | Organisation Parent | 5 sections internes protégées |
| G-04 | Détails et outils secondaires | Superpositions route-backed |
| G-05 | Lancement enfant | Machine d'état superposée puis exécution immersive |
| G-06 | Calendrier et repérage temporel | Fonction transversale majeure; une source de données, représentations enfant et Parent adaptées |
| G-07 | Création/édition de routine | Constructeur unique |
| G-08 | Direction visuelle | Pastel utile : clair/sombre, couleurs simples, shell calme, modes enfant ludiques |
| G-09 | Posture d'usage | Application parentale et familiale; interaction enfant uniquement pendant une routine accompagnée |
| G-10 | Météo et vêtements | Outil parental de préparation + jeu explicatif intégré aux routines accompagnées |

Décisions G-01 à G-10 : **acceptées le 2026-09-13**. La construction est autorisée uniquement en local, par lots réversibles suivant la roadmap.
