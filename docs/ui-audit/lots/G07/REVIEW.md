# G07 — Première création du profil familial

Statut au 2026-09-27 : **prototype validé, construction autorisée et intégrée; validation visuelle finale ouverte**. Après « Continue g07 », l'utilisateur a écrit « je valide go ». Cette autorisation porte sur le prototype G07 et le parcours décrit ici; elle ne vaut pas validation finale du produit.

## Parcours attendu

Sur une installation neuve, guider la famille dans cet ordre :

1. Message de bienvenue et informations de base : expliquer brièvement que le profil et ses données restent sur cet appareil, puis demander le nom de la famille et seulement les informations réellement utiles.
2. Création puis confirmation du code Parent à quatre chiffres.
3. Création du premier enfant.
4. Fin du parcours : ouvrir `/routines` avec un accueil cohérent avec le nouvel état de la famille.

Résultats visés : un fil conducteur clair, aucune étape oubliée ou répétée après relance, un accès Parent protégé, et une arrivée explicite sur l’accueil. Les données d’un profil déjà créé doivent rester intactes.

## Diagnostic de l’existant

Observation web sur `127.0.0.1:8093`, dans un profil navigateur isolé sans données familiales : [premier écran actuel](./current-first-start.png) à 500 px. La création de profil apparaît comme une fenêtre sur `/routines`, avec le menu derrière. Cette capture ne prouve pas les étapes après saisie.

| ID | Source et constat | Effet / statut | Critère |
|---|---|---|---|
| G07-01 | `LocalProfileGate.tsx` initialise le nom puis ferme sa fenêtre; `app/_layout.tsx` ne dirige pas vers le code Parent. | Parcours interrompu après le profil. **Constaté dans le code**, P1/M. | Le nom enregistré mène à la création du code sans passer par l’accueil. |
| G07-02 | `pin-screen.tsx` sait créer et confirmer un code, puis dirige par défaut vers `/parent`; `parentAccess.ts` autorise Parent sans code tant qu’aucun enfant n’existe. | Les fonctions nécessaires existent mais l’ordre demandé n’est pas orchestré. **Constaté dans le code**, P1/M. | Code confirmé avant la création d’enfant, sans accès inopiné aux outils Parent. |
| G07-03 | `app/parent/add-child.tsx` réutilise `FamilyScreen`; son paramètre `onboarding=1` redirige vers `/parent` (ou `/pin`) après sauvegarde, et la fermeture du formulaire revient à `/parent/children`. | Pas de fin explicite sur `/routines` ni de retour adapté à l’onboarding. **Constaté dans le code**, P1/M. | Après un enfant enregistré, un écran de fin ouvre `/routines`; annulation et relance reprennent le bon stade. |
| G07-04 | `AppTutorialModal.tsx` indique « le code parent se choisit après le premier enfant ». | Guide contradictoire avec le nouvel ordre. **Constaté dans le code**, P2/S. | Texte du guide et parcours réel racontent le même ordre. |
| G07-05 | `localProfileStore`, `appStore` et `childrenStore` persistent séparément nom, PIN et enfants, sans état dédié à la progression du premier démarrage. | Risque d’étape répétée ou sautée après fermeture; effet utilisateur **non observé**, P1/M. | Reprise à l’étape inachevée après relance, sans création en double ni perte de données existantes. |

Le sens retenu provisoirement pour « informations de base » est le **nom de famille** et une explication courte du stockage local. Aucun autre champ personnel ne paraît nécessaire dans l’état du produit. Ne pas ajouter de compte distant ni de backend.

## Prototype de parcours

[Prototype HTML](./prototype.html) et captures de secours : [mobile](./prototype-mobile.png), [tablette](./prototype-tablet.png), [comparaison des quatre vues](./prototype-desktop.png), [thème sombre](./prototype-dark.png), [code incorrect](./prototype-pin-error.png). Ces images sont des maquettes, pas des captures de l’application intégrée. La vue mobile a été contrôlée à 390 px dans le document; le navigateur de rendu Windows impose une largeur interne minimale, compensée par une largeur fixe de la maquette. Contrastes calculés des textes principaux : 10,99:1 en clair et 15,54:1 en sombre; boutons : 5,20:1 et 11,39:1. Le comportement clavier et lecteur d’écran reste à vérifier dans l’app intégrée.

La séquence et la destination ont été définies par l’utilisateur; aucun nouveau choix de structure n’est ouvert. Le prototype applique l’identité existante : fond crème et ronds pastel, menthe pour continuer, cartes blanches, titres courts. La première vue présente l’information locale une seule fois; le code garde la saisie et la confirmation existantes; l’enfant demande uniquement prénom et âge, avec illustration modifiable plus tard; un court écran de fin donne un bouton explicite « Ouvrir l’accueil ».

À valider visuellement avant construction : longueur des textes, présence de l’écran de fin et simplification du choix d’illustration au premier démarrage. Le thème sombre et l’erreur de confirmation PIN sont montrés; le retour et la reprise après relance sont spécifiés dans les critères mais restent à observer sur le produit isolé. Aucun arbitrage n’est inféré de cette fiche.

## Reprise selon la méthode globale

1. **Couvrir et observer** : code et premier écran isolé examinés. Reste à rejouer fermeture à chaque étape, erreurs de saisie, retour, relance et profil existant sans toucher au profil familial réel.
2. **Décider** : prototype clair/sombre préparé pour les quatre étapes, avec état d’erreur PIN. Obtenir la validation visuelle explicite. Trois options écrites et visuelles ne seront nécessaires que si un nouveau choix de structure apparaît; l’ordre demandé n’est pas remis en débat.
3. **Réaliser après autorisation explicite** : relier les écrans et la progression dans les stores existants, sans dupliquer le PIN, l’enfant ni le profil; préserver la reprise après interruption et les anciennes routes.
4. **Vérifier** : les quatre étapes dans l’ordre, le code confirmé avant l’accès Parent, le premier enfant enregistré une seule fois, l’ouverture sur `/routines`, la reprise après fermeture à chaque étape et l’absence de retour au parcours pour une famille existante. Vérifier clavier/focus, 320/390/768 px, thèmes, TypeScript, tests et export web. Les essais iOS/Android restent hors périmètre tant que l’utilisateur ne les redemande pas.

## Intégration et vérification

- La première ouverture affiche une page dédiée pour le nom familial et l'information sur le stockage local; le menu principal est masqué pendant la création. [Capture de la première vue intégrée](./integration-family.png) sur navigateur isolé à 500 × 850 px.
- Le PIN existant crée et confirme le code avant le profil enfant. Un nouvel écran enfant ne demande que prénom et âge; il utilise le store existant et bloque un double clic. Une page de fin ouvre explicitement `/routines`. Le guide suit le même ordre.
- La progression est persistée dans `localProfileStore`. Le routage reconduit vers la première étape manquante après relance et laisse les familles existantes hors onboarding. Aucune donnée réelle n'a été modifiée.
- TypeScript, 169 tests automatisés (dont les reprises à chaque étape), export web et `git diff --check` réussis. Le parcours complet au clic et le rendu des étapes 2 à 4 sur navigateur isolé restent à rejouer; aucune validation visuelle finale n'est inférée. Essais sur appareils iOS/Android hors périmètre demandé.
