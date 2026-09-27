# G05 — Routine mise en avant : choix prévisible

État au 2026-09-27 : **option A autorisée, intégrée, vérifiée sur web et validée visuellement par l’utilisateur; seuls les essais natifs transversaux G04 restent ouverts**. Périmètre : `/routines`, avec l'action Favori de `/parent/routines`. Référence historique : P01-E18.

## Trois résultats utilisateur attendus

1. Le parent comprend pourquoi une routine apparaît en premier.
2. Une édition de texte ou d'étape ne change pas la priorité sans intention de l'utilisateur.
3. Une routine identique créée pour plusieurs enfants garde une priorité cohérente si une de ses copies est favorite.

## Constat vérifié dans le code

`routines-home-screen.tsx` groupe les routines actives par nom, catégorie et étapes, garde la première copie comme `sample`, puis trie les groupes par `sample.isFavorite` et `sample.updatedAt` décroissant. `toggleFavorite` change une seule copie; `updateRoutine` renouvelle `updatedAt`. Le modèle ne contient ni horaire de routine ni champ de priorité manuelle. Ainsi, si la deuxième copie d'un groupe devient favorite, le groupe peut rester derrière un autre favori; une simple édition peut déplacer la carte principale. Ce sont des conséquences du code, pas encore des parcours UI reproduits. Priorité P2, effort M; aucun dommage aux données établi.

## Comparatif sur les mêmes données

Exemple commun : « Matin serein » pour deux enfants (la deuxième copie favorite), « Retour de l'école » modifiée aujourd'hui, « Soir calme » favorite. Chaque option conserve la météo en bandeau, une seule carte principale et les autres routines accessibles. Les visuels de décision, qui ne sont pas des captures du produit, sont dans [prototype.html](./prototype.html), [comparatif-desktop.png](./comparatif-desktop.png) et trois captures mobiles : [A](./option-a-mobile.png), [B](./option-b-mobile.png), [C](./option-c-mobile.png).

| Option | Règle et écran | Mobile / tablette | Accessibilité et états | Bénéfice | Risque |
|---|---|---|---|---|---|
| A — Favoris stables **recommandée** | Un groupe est favori si au moins une copie l'est; les favoris passent d'abord, puis ordre stable de création. Carte « Matin serein » avec mention « Favori ». | Même carte principale à toutes tailles; liste des autres ensuite. | Nom et priorité annoncés; si aucun favori, ordre stable; si routine en cours, l'action Reprendre garde priorité sur le lancement. | Corrige les deux surprises sans nouveau réglage. | Plusieurs favoris restent départagés par ancienneté, pas par moment de la journée. |
| B — Choix manuel explicite | Action Parent « Mettre en avant »; une routine épinglée devient la carte principale. | Une courte indication dans la carte, réglage dans la gestion Parent. | État épinglé annoncé; repli défini si l'épingle est désactivée/supprimée. | Contrôle total et très prévisible. | Nouveau champ persistant et une décision de plus pour le parent. |
| C — Moment estimé | Catégorie matin/école/soir selon l'heure locale, favoris en second. Carte « Retour de l'école » dans l'exemple de l'après-midi. | Pas de commande supplémentaire; même composition. | Motif « Suggérée pour cet après-midi » annoncé; repli pour catégories libres et horaires absents. | Peut proposer une routine pertinente sans action manuelle. | Catégories ≠ horaires réels; résultat peut changer brusquement et être faux pour cette famille. |

**Recommandation retenue : A.** Elle applique l'intention déjà exposée par Favoris, supprime l'effet de l'édition sur le classement et ne prétend pas connaître l'horaire familial. La maquette illustre une règle de tri, sans changer la composition validée de G02. L'autorisation de construire est consignée ci-dessous.

## Décision du 2026-09-26

Réponse de l’utilisateur : « a ». Option A retenue. À préciser lors de l'intégration autorisée : départager les groupes de même statut par `createdAt` croissant, puis par identifiant stable; conserver le regroupement et la priorité de l'action Reprendre. Aucune modification du code produit à cette étape.

## Autorisation, intégration et preuves du 2026-09-26

L’utilisateur a ensuite demandé : « tu peux construire et valider tout et termine au maximum la todo ». Cela autorise explicitement la construction de G05 après son choix A. `groupActiveRoutines` regroupe les copies actives, considère le groupe favori dès qu’une copie l’est, et trie par date de création puis identifiant. Les participants et le représentant du groupe restent stables même si le store est réordonné. La carte principale indique « Favori » et les autres cartes l’annoncent dans leur nom accessible. L’action Reprendre reste au-dessus de la carte et son comportement n’a pas changé.

Les tests ciblés couvrent favori sur la seconde copie, deux favoris, égalité de date, édition de `updatedAt`, désactivation et suppression. TypeScript strict, 22 suites et 157 tests réussis. Export de production web/iOS/Android réussi; le premier essai Hermes Android dans le bac à sable a échoué avec `spawn EPERM`, puis a réussi après relance autorisée. Sur l'origine web fictive, l’état vide et l’accès à la création derrière le PIN fonctionnent; la création a été annulée sans saisie. Il n’y avait pas de routine dans ce jeu et aucun PIN à quatre chiffres n’a été fourni pour créer le jeu peuplé dans l’interface. Le classement et son badge sont donc vérifiés par les tests et la compilation, **pas encore observés avec des routines dans l'app**, ni validés visuellement par l’utilisateur. Ne pas contourner le PIN pour compléter cette preuve.

Le 2026-09-27, une nouvelle installation isolée sur `127.0.0.1:8081` a été créée avec un profil « Audit G05 » et un enfant « Lina Test ». L'application exige alors un nouveau PIN à quatre chiffres avant l'accès Parent. L'écran « Créez votre code » a été laissé ouvert dans un onglet de test; la saisie et la confirmation du code sont réservées à l’utilisateur. TypeScript strict, 22 suites/157 tests et `git diff --check` repassent. Aucun `adb`, émulateur ou SDK Android trouvé dans les chemins usuels de cette machine Windows; il n'y a donc pas de preuve d'interaction native à cette étape.

Après création du PIN par l’utilisateur, le jeu fictif comprend deux enfants, « Lina Test » et « Noé Test », et trois copies de routines : « Retour G05 » pour Lina, puis « Matin G05 » pour les deux enfants. Dans l’app web, sans favori, « Retour G05 » est bien la carte principale et les deux copies identiques de « Matin G05 » apparaissent comme une seule carte avec les deux enfants. Le passage vers la gestion Parent redemande normalement le PIN; l’écran de déverrouillage est ouvert pour que l’utilisateur saisisse le code existant. Le cas décisif « favori sur la seconde copie » reste à rejouer après ce déverrouillage. Aucun code n’a été lu ou saisi par l’agent.

L’utilisateur a ensuite déverrouillé Parent et autorisé explicitement l’usage du code de ce **seul profil de test**. La copie « Matin G05 » de Noé a été mise en favori, celle de Lina est restée sans favori. Dans l’app, « Matin G05 » est alors passée en carte principale avec l’étiquette « FAVORI », et « Retour G05 » est restée dans les autres routines. La modification de la description de « Retour G05 » n’a pas changé cet ordre. L’action Lancer a ouvert la préparation avec les deux enfants sélectionnés; aucune exécution n’a été démarrée.

Le contrôle visuel web a couvert 320/390/768 px sans débordement horizontal et le thème clair/sombre à 390 px. Une incohérence mineure observée entre l’ordre des prénoms de la carte et celui de la préparation a été corrigée : les participants suivent désormais l’ordre de la famille dans les libellés et les paramètres de lancement. Le dernier bundle affiche « Lina Test, Noé Test ». TypeScript strict, 22 suites/158 tests, export de production web/Android/iOS et `git diff --check` réussis après cette correction. Les interactions sur appareil, le lecteur d’écran réel et la validation visuelle finale par l’utilisateur restent ouverts.

Reprise « continue la todo » : le panneau Enchaîner s'ouvre avec « Matin G05 » déjà sélectionnée en position 1 et « Retour G05 » disponible. La commande Préparer reste désactivée avec une seule routine; après sélection de la seconde, elle ouvre la préparation des deux routines dans l'ordre choisi, avec Lina et Noé sélectionnés. Le panneau se ferme après la transition. Retour à Routines sans démarrer l'exécution. Ce contrôle web complète le critère de lancement groupé; l'exécution native reste ouverte.

Validation finale : après présentation du produit intégré et de ses contrôles web, l’utilisateur répond explicitement le 2026-09-27 « je valide et continue la todo ». Le rendu G05 est donc validé. Cette validation ne remplace pas les interactions iOS/Android et lecteur d’écran du lot G04.

Contrôle clavier complémentaire après validation : dans le panneau Enchaîner, la touche Espace ne changeait pas la case de la seconde routine, alors qu’Entrée fonctionnait. La ligne utilise désormais un `Pressable` avec gestion explicite d’Espace sur le web. Après rechargement, Espace ajoute puis retire « Retour G05 », met à jour l’état annoncé et active/désactive « Préparer 2 routines ». TypeScript strict, 22 suites/158 tests, export web/iOS/Android et `git diff --check` réussissent après ce correctif. L’essai avec lecteur d’écran et appareil natif reste à faire.

## Vérifications prévues après décision

- Jeux isolés : aucun favori, un favori, deux favoris, copies identiques avec favori sur la seconde, édition, désactivation et suppression.
- La carte principale, les autres routines, le lancement groupé et la reprise en cours restent cohérents.
- Contrôles 320/390/768, clair/sombre, clavier et annonces des raisons de priorité; TypeScript, Jest et exports adaptés.
