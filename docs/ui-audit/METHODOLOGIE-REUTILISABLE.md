> Version historique portable (2026-09-19). Pour Routine et son amélioration globale rapide, appliquer GLOBAL-METHOD.md; ne pas réutiliser ici les prompts de progression point par point ci-dessous.

# Audit UI/UX réutilisable — du scan aux améliorations validées

Version : 2026-09-19. Ce fichier est autonome : copiez-le dans n'importe quel projet, puis utilisez le prompt de lancement ci-dessous. Il ne suppose ni framework, ni navigation, ni identité visuelle particulière. Il décrit une méthode de travail pour un agent, pas un script qui lance automatiquement l'application.

## 1. Prompts prêts à copier

### Lancer sur une autre application

> Applique le fichier `METHODOLOGIE-REUTILISABLE.md` joint ou présent dans ce projet. Commence par lire les règles locales puis scanner réellement le dépôt et, si possible, lancer et parcourir l'application. N'invente pas les écrans non observés. Crée le dossier durable `docs/ui-audit/` avec la cartographie, la couverture du scan, le brainstorming global et une todo page par page. Préserve les décisions et travaux existants. Présente la synthèse des frictions documentées, l'ordre recommandé et le premier point : diagnostic, trois options expliquées et trois visuels comparables mobile/tablette avec PNG visible dans la même réponse. Attends mon choix avant de passer à l'élément suivant. Si je prescris directement une correction, illustre cette correction et fais valider son exemple sans inventer trois alternatives. N'implémente aucun changement dans le produit avant ma formule explicite « prototype validé — construction autorisée », appliquée au prototype identifié. Commence maintenant le scan et la documentation avec les accès disponibles ; demande seulement les informations indispensables qui manquent.

### Reprendre un audit

> Reprends l'audit à partir de `docs/ui-audit/`. Relis la méthode, MASTER, la todo de la page active, son journal, son inventaire et la fiche de l'élément actif. Restitue le point de reprise complet prévu par la méthode, puis poursuis cet élément avec explications et visuels. Conserve mes validations, corrections et rejets. Ne considère ni mon silence ni « continue » comme un choix graphique ou une autorisation de construction.

### Construire un prototype déjà examiné

> Prototype [identifiant, version et page] : prototype validé — construction autorisée. Implémente uniquement ce périmètre, suis la todo technique issue des décisions, vérifie les parcours et états réels, puis présente les preuves et les limites pour validation finale.

## 2. Principes et statuts

- Respecter les instructions applicables du projet et les demandes explicites de l'utilisateur. Signaler les contradictions documentaires et les résoudre dans le journal ; ne pas choisir silencieusement.
- La conversation seule ne suffit pas : chaque demande, correction, rejet et validation est enregistré avant de changer de point.
- Séparer **fait observé**, **déduction du code**, **hypothèse**, **proposition** et **décision utilisateur**. Une intention décrite dans le code ne prouve pas un comportement observé.
- Préserver les fonctionnalités, parcours historiques, saisies, données et changements utilisateur. Ne jamais réinitialiser un environnement, publier, migrer des données ou supprimer des contenus pour rendre le scan plus facile.
- Réutiliser les composants et conventions du projet quand ils conviennent. Ne pas imposer une stack, une refonte d'architecture ou une nouvelle dépendance au nom de l'audit.
- Une recommandation de l'agent n'est pas une validation. Un choix de comportement n'approuve pas automatiquement son apparence. La validation d'un écran ne permet pas de modifier toutes les pages.

Statuts distincts : `à observer`, `observé`, `à proposer`, `en attente de choix`, `correction prescrite — exemple à valider`, `décision validée`, `prototype à valider`, `construction autorisée`, `implémenté — à vérifier`, `à valider visuellement`, `clos`. Une proposition peut aussi être `rejetée` ou `remplacée`, avec motif et lien vers sa suite.

## 3. Scan réel et couverture

1. Lire les règles locales, la documentation et les audits existants. Relever l'état du dépôt avant toute écriture. Si un audit existe, le compléter sans écraser son historique.
2. Identifier la stack, les commandes disponibles, routes/écrans, navigation, composants partagés, stockage, rôles, permissions, intégrations et tests. Inspecter aussi les panneaux, modales, formulaires, menus, liens profonds et anciennes routes.
3. Démarrer l'application avec sa procédure documentée si l'environnement le permet. Parcourir les intentions principales de bout en bout avec des données de démonstration ou un environnement adapté. Ne pas déclencher d'achat, d'envoi ou de modification réelle de données pour inspecter une interface.
4. Capturer et noter le réel : route, rôle, préconditions, dimensions, thème, scénario, actions, résultat attendu/réel et preuve. Utiliser des exemples anonymisés dans les propositions et éviter d'exposer des données personnelles dans les captures partagées.
5. Explorer les états applicables : premier usage, normal, vide, chargement, erreur, hors ligne, permission refusée, contenu long, clavier, validation de formulaire, retour, fermeture, interruption et reprise. Ajouter les états spécifiques au produit ; marquer ceux qui ne s'appliquent pas avec leur raison.
6. Examiner la lisibilité, la hiérarchie, les actions principales, les erreurs, la conservation du contexte, les gestes, le focus, les libellés accessibles, le contraste, les grands textes et la réduction des animations selon la plateforme.
7. Maintenir la couverture : un écran trouvé dans le dépôt mais jamais ouvert reste **connu — non observé**. Un écran bloqué reste **inaccessible**, avec obstacle et moyen de vérification. Ne jamais annoncer un audit complet si des parcours restent non vérifiés.

Table de couverture minimale :

| ID | Page/surface et route | Rôle/état | Source code | Observation réelle et preuve | Couverture | Limite / prochaine vérification |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | À renseigner | À renseigner | Chemin ou absent | Capture/scénario ou absent | Observé / connu non observé / inaccessible | À renseigner |

Si le lancement est impossible, continuer l'inventaire statique et les propositions clairement étiquetées comme telles. Documenter l'obstacle sans fabriquer de captures de l'existant ; un prototype est toujours nommé « proposition ».

## 4. Brainstorming global et priorisation

Décrire les utilisateurs, leurs intentions et les parcours majeurs avant de traiter la décoration. Pour chaque friction observée, noter sa fréquence, sa gravité, le parcours affecté, la preuve et l'incertitude. Distinguer les blocages d'usage, les ralentissements et les incohérences visuelles.

Proposer un ordre court qui privilégie les parcours importants et les composants partagés. Créer des points transversaux identifiés `GXX` pour navigation, langage, formulaires ou fondations visuelles. Conserver les points propres à chaque page sous `PXX-EXX`. Les questions non documentées restent des hypothèses de brainstorming, jamais des défauts affirmés.

Pour une décision globale encore ouverte, présenter trois directions écrites et visuelles comparables, puis recueillir un choix explicite. Si une identité ou une direction existe déjà, la conserver et ne proposer que les améliorations pertinentes. Les décisions globales ne doivent pas masquer les exceptions nécessaires à certaines pages.

## 5. Travail page par page et point par point

1. Cadrer l'intention de la page, ses entrées, retours, rôles et exclusions.
2. Montrer les preuves de l'existant et inventorier tous ses éléments visibles, conditionnels et historiques.
3. Donner à chaque amélioration un identifiant stable et une fiche liée à la todo. Traiter les décisions dans un ordre explicite.
4. Pour un choix ouvert, présenter exactement trois options complètes selon le contrat ci-dessous, sauf demande explicite contraire.
5. Journaliser le choix ou la correction avant de passer au point suivant. Ne pas rouvrir une décision acquise sans nouvelle demande ou fait concret expliqué.
6. Consolider les décisions validées dans un prototype complet, versionné, incluant les états importants et les transitions.
7. Attendre la formule `prototype validé — construction autorisée` pour ce prototype avant de modifier le produit. La création des documents et maquettes isolées sert la décision et ne constitue pas une implémentation.
8. Construire la todo technique, implémenter le périmètre autorisé, vérifier le réel puis demander la validation visuelle finale avant de fermer la page.

### Contrat de chaque proposition

Dans la **même réponse**, fournir le diagnostic et trois options nommées A/B/C. Pour chacune : principe, changement concret, hiérarchie, contenu, interactions, comportement mobile/tablette/bureau, états utiles, accessibilité, bénéfice et risque/compromis. Conclure par une recommandation motivée et une décision précise attendue.

Les visuels présentent le même contenu, les mêmes fonctionnalités, les mêmes états et les mêmes tailles de référence. Montrer au minimum mobile et tablette ; ajouter le bureau si sa composition diffère. Pour une application strictement limitée à une plateforme, préciser cette contrainte et choisir avec l'utilisateur les formats pertinents au lieu d'inventer une version qui n'existe pas.

Chaque option a un visuel identifiable. Fournir des PNG de secours **directement visibles**, même avec un rendu interactif. Vérifier lisibilité, absence de recouvrement et correspondance texte/visuel avant présentation. Un simple lien vers une maquette ne remplace pas les images visibles. Si le rendu échoue, réparer et renvoyer les PNG avant de solliciter une validation.

### Cas d'une correction directement prescrite

Quand l'utilisateur décrit précisément le comportement voulu, ne pas le diluer dans trois alternatives artificielles. Enregistrer la correction comme instruction, conserver les anciennes options avec leur rejet, puis montrer **un exemple visuel corrigé** et l'expliquer. Distinguer ce qui est déjà demandé de ce qui reste à valider dans l'exemple : placement, libellés, états ou interactions non précisés. Ne pas considérer cet exemple comme approuvé tant que l'utilisateur ne l'a pas validé.

Exemple générique : « Afficher toute la liste dès l'ouverture et présélectionner les éléments recommandés quand la donnée est disponible. » Le comportement est prescrit ; le visuel montre la liste avec et sans recommandation. Les questions encore ouvertes sont consignées, sans réintroduire un écran d'indisponibilité rejeté.

## 6. Documents produits et gabarits

Utiliser cette arborescence, ou la structure équivalente déjà établie dans le projet :

```text
docs/ui-audit/
  METHOD.md                         # Copie opérationnelle de cette méthode et adaptations explicites
  MASTER.md                         # Couverture, ordre, page/élément/phase actifs et liens
  SCAN.md                           # Stack, commandes, parcours, preuves et limites
  BRAINSTORMING.md                   # Intentions, frictions, priorités et points GXX
  DECISIONS.md                       # Registre transversal avec liens vers les journaux locaux
  page-XX-nom/
    GRAPHIC_TODO.md                 # Chaque point suit la checklist ci-dessous
    DECISION_LOG.md                 # Historique chronologique conservé
    INVENTORY.md                    # Éléments et états avec identifiants stables
    reviews/PXX-EXX.md              # Diagnostic, options, choix et critères
    decisions/PXX-EXX-vN.md         # Fiche de décision illustrée indépendante
    visuals/                       # Prototypes et leurs sources
    captures/                      # Preuves de l'application réelle
    proposals/                     # PNG des propositions, versionnés
    TECHNICAL_TODO.md               # Actions issues du prototype autorisé
    VERIFICATION.md                 # Résultats, preuves, limites et validation finale
```

Pour les points GXX, utiliser un dossier transversal avec les mêmes fiches et journaux. Garder des chemins relatifs dans les documents portables ; utiliser des liens compatibles avec l'outil de restitution pour afficher effectivement les fichiers et images à l'utilisateur.

### Checklist à instancier pour chaque point, global ou local

```markdown
### [PXX-EXX ou GXX] — Intitulé orienté usage
Statut : … | Fiche : … | Dépendances : …
- [ ] Existant observé et preuve, ou limite d'observation indiquée.
- [ ] Problème et amélioration expliqués.
- [ ] Trois options écrites et visuelles comparables ; ou correction prescrite illustrée.
- [ ] Mobile/tablette, bureau si différent, états et accessibilité traités.
- [ ] PNG visibles dans la réponse de décision, avec bénéfices/risques et recommandation.
- [ ] Choix, correction, rejets et questions ouvertes consignés.
- [ ] Exemple/prototype validé explicitement, référence et version conservées.
- [ ] Autorisation de construction consignée pour le périmètre concerné.
- [ ] Tâches techniques et critères vérifiables établis.
- [ ] Résultat réel vérifié et preuves présentées.
- [ ] Validation finale recueillie ; clôture cohérente dans les documents.
```

### Fiche de revue et de décision illustrée

```markdown
# [ID] — Sujet — version N
Page/route, rôle, objectif, phase : …
Existant / preuve / limite : …
Diagnostic et changement proposé : …
Invariants et décisions déjà acquises : …
Options A/B/C (ou correction prescrite) : …
Responsive, accessibilité, états et retours : …
Bénéfice, compromis, recommandation : …
Visuels et PNG affichables : …
Instruction utilisateur exacte ou résumé fidèle : …
Décision : en attente / validée explicitement le …
Ce que cette décision valide : …
Ce qu'elle ne tranche pas encore : …
Options rejetées, motifs, anciennes versions : …
Prochain point et validation nécessaire : …
Critères de réussite après autorisation : …
```

La fiche indépendante `decisions/…` rassemble le résultat et son exemple visuel pour relecture rapide ; elle renvoie au journal sans le remplacer. Une fiche en attente porte ce statut jusque dans sa légende.

### Entrée de journal

`Date — ID — demande/correction/rejet/validation — formulation fidèle — invariants ajoutés/retirés — options rejetées et motifs — portée exacte du choix — référence/version du visuel — statut suivant — questions ouvertes.`

Ne jamais effacer une option rejetée ni substituer une image à une version déjà examinée. Créer une nouvelle version avec les différences expliquées.

### Ligne de todo technique

`ID — décision source et prototype autorisé — action/fichiers concernés — dépendances — scénario de réussite observable — test ou vérification adapté — preuve attendue — état/résultat.`

## 7. Continuité à chaque reprise

Relire dans l'ordre : règles locales, METHOD, MASTER, GRAPHIC_TODO de la page active, DECISION_LOG, INVENTORY, puis fiche active. Restituer avant de poursuivre :

1. Page réelle et route ; objectif utilisateur.
2. Phase actuelle et fondations globales pertinentes.
3. Liste complète des éléments déjà validés avec identifiants et sens.
4. Propositions rejetées et motifs.
5. Élément actif, dernière demande et questions restantes.
6. États non observés, cachés ou historiques à préserver.
7. Prochaine action concrète.
8. Validation qui conditionne l'étape suivante.

Actualiser ce point de reprise dans la todo. Un identifiant seul n'est jamais une explication suffisante. « Continue », le silence, un délai ou une recommandation ne valent pas choix graphique.

## 8. Construction, preuves et portes de validation

| Porte | Condition pour avancer |
| --- | --- |
| Scan → proposition | Preuves disponibles et limites visibles ; aucune prétention de couverture inventée. |
| Proposition → décision | Explications et visuels lisibles ensemble ; choix explicite consigné. |
| Correction → exemple validé | Instruction respectée ; exemple visuel examiné et approuvé explicitement. |
| Prototype → code | Prototype identifié/versionné et formule explicite `prototype validé — construction autorisée`. |
| Code → fermeture | Vérifications adaptées, preuves du résultat réel, limites indiquées et validation visuelle finale. |

Après autorisation, préserver le périmètre accepté. Si une contrainte d'implémentation impose une modification perceptible, documenter le problème, illustrer le compromis et obtenir le choix correspondant avant de l'intégrer.

Adapter les vérifications à la stack et aux règles du dépôt : compilation/types, lint, tests unitaires ou d'intégration pertinents, parcours de bout en bout si disponibles. Ne pas ajouter des tests sans valeur pour des documents ou maquettes isolées. Exécuter les commandes obligatoires du projet avant de terminer une modification du produit et rapporter honnêtement tout contrôle impossible ou échec préexistant.

Vérifier l'application construite aux tailles et plateformes convenues, avec clavier/grands textes et thèmes pertinents. Rejouer les parcours touchés, les retours, les erreurs et la conservation des données. Une capture du prototype ne prouve pas que le code final fonctionne. Consigner les commandes et résultats réellement obtenus, les captures du produit réel et les risques résiduels ; ne jamais annoncer des tests non exécutés.

Avant chaque réponse de validation, contrôler : dernière demande enregistrée, invariants conservés, rejets visibles, texte et images cohérents, PNG affichés, statut exact, choix précis demandé et absence de changement produit non autorisé. Le travail est reprenable lorsque quelqu'un peut identifier sans interprétation ce qui existe, ce qui est proposé, ce qui a été choisi ou rejeté, ce qui reste ouvert et quelle action est autorisée ensuite.
