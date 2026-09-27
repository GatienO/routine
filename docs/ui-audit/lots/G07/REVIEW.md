# G07 — Première création du profil familial (todo future)

Statut : **À examiner — futur lot, non construit**. Demande du 2026-09-27. Ce lot ne rouvre pas les lots clos et ne vaut ni validation d’un prototype ni autorisation de modifier le produit.

## Parcours attendu

Sur une installation neuve, guider la famille dans cet ordre :

1. Message de bienvenue et informations de base : expliquer brièvement que le profil et ses données restent sur cet appareil, puis demander le nom de la famille et seulement les informations réellement utiles.
2. Création puis confirmation du code Parent à quatre chiffres.
3. Création du premier enfant.
4. Fin du parcours : ouvrir `/routines` avec un accueil cohérent avec le nouvel état de la famille.

Résultats visés : un fil conducteur clair, aucune étape oubliée ou répétée après relance, un accès Parent protégé, et une arrivée explicite sur l’accueil. Les données d’un profil déjà créé doivent rester intactes.

## État connu et incertitudes

Le code contient déjà `LocalProfileGate` pour le nom du profil local, `pin-screen` pour créer/confirmer le code Parent, et la création d’enfant dans l’espace Parent. Ces fonctions sont séparées; leur enchaînement automatique au premier démarrage et l’arrivée finale sur `/routines` ne sont **pas encore vérifiés**. Le terme « informations de base » doit être précisé pendant le diagnostic, sans demander de données inutiles. Ne pas ajouter de compte distant ni de backend.

## Reprise selon la méthode globale

1. **Couvrir et observer** : cartographier le démarrage, `LocalProfileGate`, `/pin`, `/parent/add-child`, `/routines`, les stores et les redirections. Rejouer sur une origine de test isolée : installation vide, fermeture à chaque étape, erreurs de saisie, retour, relance, et profil existant. Ne pas toucher au profil familial réel.
2. **Décider** : produire une fiche de constats et un prototype du parcours complet, mobile/tablette, clair/sombre et états d’erreur. Comparer trois options écrites et visuelles seulement si un choix de structure reste réellement ouvert. Conserver les décisions graphiques existantes et soumettre le résultat à la validation du lot.
3. **Réaliser après autorisation explicite** : relier les écrans et la progression dans les stores existants, sans dupliquer le PIN, l’enfant ni le profil; préserver la reprise après interruption et les anciennes routes.
4. **Vérifier** : les quatre étapes dans l’ordre, le code confirmé avant l’accès Parent, le premier enfant enregistré une seule fois, l’ouverture sur `/routines`, la reprise après fermeture à chaque étape et l’absence de retour au parcours pour une famille existante. Vérifier clavier/focus, 320/390/768 px, thèmes, TypeScript, tests et export web. Les essais iOS/Android restent hors périmètre tant que l’utilisateur ne les redemande pas.

Prochaine action lorsque ce lot sera choisi : audit de l’existant et prototype. La présente inscription à la todo n’autorise pas sa construction.
