> **Mise à jour du 2026-09-20 : amélioration globale.** La méthode active est désormais [GLOBAL-METHOD.md](./GLOBAL-METHOD.md), avec le suivi [GLOBAL-AUDIT.md](./GLOBAL-AUDIT.md). Elle remplace les obligations de progression page par page et de validation de chaque micro-élément ci-dessous. Les décisions et rejets historiques restent conservés. Le texte suivant est l'ancienne méthode, gardée pour traçabilité.

# Méthode persistante d'audit UI/UX

Date d'adoption : 2026-09-16
Source : méthodologie universelle fournie par l'utilisateur, renforcée avec un protocole de continuité et de restitution.

## 1. Source de vérité

La mémoire de conversation n'est jamais considérée comme suffisante. Les sources durables sont, dans cet ordre :

1. `AGENTS.md` pour les règles obligatoires du dépôt ;
2. `docs/ui-audit/MASTER.md` pour la page courante ;
3. `GRAPHIC_TODO.md` pour la phase et l'ordre d'exécution ;
4. `DECISION_LOG.md` pour l'historique chronologique des demandes, rejets et validations ;
5. `INVENTORY.md` pour l'état de chaque élément stable `PXX-EXX` ;
6. `reviews/PXX-EXX.md` pour le diagnostic et les propositions de l'élément actif ;
7. `docs/app-rebuild/VISUAL_IDENTITY.md` pour les fondations globales.

En cas de contradiction, ne jamais choisir silencieusement : corriger les documents en s'appuyant sur la demande utilisateur la plus récente et explicite, puis inscrire la correction dans le journal.

## 2. Journalisation obligatoire

Après chaque demande qui ajoute, corrige, rejette ou valide une décision, inscrire avant de changer de point :

- la date ;
- la page et l'élément concernés ;
- un résumé fidèle de la demande utilisateur ;
- les invariants ajoutés ou retirés ;
- les propositions rejetées et leur motif ;
- la décision validée, seulement si elle est explicite ;
- le statut suivant ;
- les fichiers et visuels de référence.

Une nouvelle proposition ne remplace jamais silencieusement l'ancienne. L'ancienne reste marquée « rejetée » ou « archivée ».

## 3. Reprise obligatoire de la todo

Lorsque l'utilisateur dit « reprends », « continue », « go », « termine » ou « reprends la todo », commencer par reconstruire et restituer le paquet de reprise :

1. page réelle et route ;
2. objectif utilisateur de la page ;
3. phase actuelle ;
4. fondations globales utiles ;
5. liste complète des éléments déjà validés avec leurs codes ;
6. propositions rejetées et motifs ;
7. élément actif et ce qui reste à décider ;
8. états invisibles ou fonctionnalités historiques à ne pas oublier ;
9. prochaine action concrète ;
10. porte de validation qui interdit d'aller plus loin.

Le paquet est ensuite actualisé dans `GRAPHIC_TODO.md`. La reprise ne repart jamais d'un souvenir ou du dernier message seul.

## 4. Contrat d'une série de propositions

Renforcement explicite demandé le 2026-09-19 : ce contrat s'applique à **chaque point d'amélioration de la todo**, global ou propre à une page. Chaque point renvoie à une fiche avec : observation de l'existant, amélioration expliquée, trois options comparables, visuels mobile/tablette et PNG visible, accessibilité et états, bénéfice/compromis, recommandation, décision datée, puis tâches vérifiables après autorisation. Ne jamais cocher un point sur la seule livraison d'un visuel. Le gabarit opérationnel est dans `BRAINSTORMING.md`, section « Méthode obligatoire pour chaque point ».

Chaque série comporte exactement trois propositions comparables, sauf demande explicite contraire. Pour chacune, fournir par écrit :

- nom et principe ;
- hiérarchie et contenu ;
- comportement mobile, tablette et bureau ;
- accessibilité et états importants ;
- avantage ;
- risque ou compromis.

Les trois propositions utilisent le même contenu, la même taille de référence et les mêmes fonctionnalités. Une recommandation argumentée est donnée, mais elle ne vaut jamais validation.

## 5. Contrat visuel

Une validation ne peut pas être demandée sans visuel.

- Chaque proposition écrite possède son visuel correspondant.
- Les trois visuels apparaissent dans la même réponse que les explications.
- Le visuel montre au minimum mobile et tablette; le bureau est ajouté si sa composition diffère.
- Un rendu interactif doit aussi avoir une capture PNG de secours directement visible dans la réponse.
- Si le rendu n'apparaît pas ou est illisible, la demande de validation est annulée et le visuel est renvoyé.
- Un code comme `W4` n'est jamais présenté seul : son nom et son sens restent visibles.

## 6. Structure obligatoire de la réponse de validation

1. **Où nous en sommes** — page, phase, élément actif.
2. **Ce qui est déjà verrouillé** — décisions et règles pertinentes.
3. **Diagnostic** — existant, problème et éléments oubliés.
4. **Trois propositions écrites** — comparables et complètes.
5. **Visuels** — comparatif et PNG de secours.
6. **Recommandation** — avec motif et compromis.
7. **Décision attendue** — choix exact ou combinaison autorisée.
8. **Suite après validation** — prochain identifiant, sans l'exécuter avant le choix.

Une réponse qui ne contient que le visuel, seulement une phrase ou uniquement les codes des options est incomplète.

## 7. Séquence page par page

1. Cadrer la page et ses exclusions.
2. Capturer le produit réel et ses états.
3. Présenter trois directions globales écrites et visuelles.
4. Obtenir une direction explicite.
5. Inventorier tous les éléments visibles, conditionnels, cachés et historiques.
6. Traiter chaque `PXX-EXX` un par un avec le contrat complet.
7. Consolider uniquement les décisions validées dans un prototype de page entière.
8. Obtenir `prototype validé — construction autorisée`.
9. Créer une todo technique vérifiable.
10. Intégrer, tester et présenter les preuves du code réel.
11. Obtenir la validation visuelle finale avant de fermer la page.

## 8. Contrôle avant chaque réponse

Avant de répondre sur une page en audit :

- relire la méthode, la todo courante, le journal, l'inventaire et la fiche active ;
- vérifier que les dernières demandes sont consignées ;
- vérifier qu'aucune option rejetée n'est reproposée sans raison ;
- vérifier que les décisions déjà validées sont visibles dans le paquet de reprise ;
- vérifier que texte et visuels sont présents ensemble ;
- vérifier la présence de la capture PNG de secours ;
- vérifier que la question finale demande une décision précise ;
- ne pas avancer au point suivant sans cette décision.

## 9. Critère de réussite

Une autre personne doit pouvoir reprendre le travail depuis les fichiers et répondre sans interprétation : ce qui existait, ce qui a été demandé, ce qui a été rejeté, ce qui a été validé, ce qui reste ouvert, ce qui vient ensuite et quelle validation est nécessaire.
