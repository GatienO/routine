> Dossier historique de reconstruction. Le chantier courant est décrit dans ../ui-audit/MASTER.md. VISUAL_IDENTITY.md reste une référence de fondations; les anciens audits ne prouvent pas le rendu actuel.

# Audit global et roadmap de reconstruction

Date de l'audit : 2026-09-11

Statut : diagnostic et proposition. Aucune reconstruction n'est autorisée avant validation explicite de l'architecture cible.

## Résultat du tour de l'application

L'application contient actuellement 39 fichiers de route hors layouts. Une partie correspond à des redirections utiles, mais plusieurs intentions sont éclatées entre des pages, des doublons et des parcours techniques.

Le produit peut être ramené à trois destinations persistantes :

1. **Routines** — choisir, préparer et lancer une routine.
2. **Activités** — trouver une activité, l'ouvrir et la conserver.
3. **Parent** — configurer les profils, les routines, le calendrier et les récompenses.

Les autres expériences deviennent soit un parcours immersif, soit un état superposé, soit une ancienne URL redirigée.

## Documents

- [Inventaire actuel](./APP_INVENTORY.md) : chaque route, son rôle et sa destination cible.
- [Architecture cible](./TARGET_ARCHITECTURE.md) : navigation, superpositions, logique globale et découpage métier.
- [Vision Calendrier enfant](./CALENDAR_VISION.md) : rôle produit, repères temporels et progression de développement.
- [Vision Météo et tenue](./WEATHER_CLOTHING_VISION.md) : préparation parentale et apprentissage ludique pendant la routine.
- [Directions de style](./STYLE_DIRECTIONS.md) : trois identités globales à comparer avant intégration.
- [Identité visuelle](./VISUAL_IDENTITY.md) : direction retenue, tokens, composants et règles clair/sombre.
- [Baseline technique](./BASELINE.md) : contrats de navigation, état des vérifications et propriétaires AsyncStorage.
- [Audit de cohérence du 13 septembre](./INCONSISTENCY_AUDIT_2026-09-13.md) : écarts visibles après reprise et ordre de correction.
- [Roadmap d'intégration](./REBUILD_ROADMAP.md) : ordre de migration, critères de contrôle et portes de validation.

## Décision attendue

Avant toute modification de l'application, valider ou corriger ces quatre décisions :

- supprimer **Accueil** de la navigation basse et rediriger `/` vers `/routines` ;
- limiter la navigation basse à **Routines / Activités / Parent** ;
- regrouper les outils Parent dans cinq sections internes et réserver la sécurité aux actions sensibles ;
- faire du calendrier enfant un système transversal majeur, préparé par le parent puis parcouru avec l'enfant ;
- utiliser la météo pour préparer les vêtements puis expliquer leur utilité pendant une routine accompagnée ;
- ne créer aucune page personnelle par enfant et réserver l'interaction enfant aux routines accompagnées ;
- remplacer les pages secondaires par des feuilles, dialogues ou états internes tout en conservant leurs anciennes URL comme redirections.

Formule de validation proposée : `architecture globale validée — préparer le prototype du shell`.

## Prototype PAGE-00

Le prototype interactif du shell a été construit localement le 2026-09-12 puis corrigé pour devenir parental. Il couvre les trois destinations, le calendrier conçu pour aider l'enfant à se repérer et le lancement accompagné comme seul autre mode enfant. Sa todo de validation se trouve dans [`docs/ui-audit/page-00-shell/TODO.md`](../ui-audit/page-00-shell/TODO.md).

Le 2026-09-13, la structure fonctionnelle a été acceptée mais le style du prototype a été rejeté. La validation visuelle est donc remontée avant toute construction du shell réel.
