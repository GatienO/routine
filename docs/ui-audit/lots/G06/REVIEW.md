# G06 — Lancement et routine en cours

Statut : **construction autorisée et intégrée, validation visuelle finale en attente**. Nouveau lot ouvert le 2026-09-27 après clôture de la todo globale. Routes : `/routines` → `/child/summary` → `/child/run`, reprise depuis `/routines`, enchaînement et `/child/pause`. Les essais sur appareil iOS/Android restent hors périmètre à la demande de l’utilisateur.

## Résultats attendus

1. Comprendre quelle routine et quelle étape sont en cours, y compris après reprise.
2. Voir un temps restant juste, stable après rechargement ou retour, et distinguer clairement marche, pause et temps écoulé.
3. Valider l’étape pour chaque enfant sans perdre les commandes parentales ni déclencher deux fois la progression.
4. Conserver le contexte lors du lancement, de l’enchaînement et du retour aux Routines.

## Diagnostic du produit actuel

| ID | Preuve | Impact / priorité | Statut et critère |
|---|---|---|---|
| G06-01 | Sur origine fictive `127.0.0.1:8095`, l’étape à durée minimale affiche 0:45 avant rechargement, puis 0:57 après : l’exécution persiste, le minuteur redémarre. `useTimer.ts` ne conserve que l’état du composant et `run.tsx` appelle `start()` à son montage. | Temps minimum prolongé et repère peu fiable; P1 / M. | **Observé web et confirmé code.** Reprise à la même étape avec temps restant cohérent; pause et temps écoulé définis. |
| G06-02 | `run.tsx` calcule « Fin HH:MM » depuis la durée entière de l’étape actuelle et des suivantes, sans soustraire le temps déjà écoulé. Ce calcul est refait au rendu. | Heure de fin susceptible de glisser; P2 / S. | **Constaté code.** Estimation actualisée depuis le vrai temps restant, ou libellé remplacé si une estimation fiable n’est pas possible. |
| G06-03 | À 390 px sur l’installation fictive, l’écran en cours montre « 1/2 », étape, minuteur et enfant, mais pas le nom de la routine. La capture du produit est distincte des maquettes. | Contexte perdu, surtout en enchaînement; P2 / S. | **Observé web.** Nom de routine et numéro d’étape lisibles sans repousser l’action de validation sous l’écran. |
| G06-04 | Dans l’arbre d’accessibilité web, « Parent » est une image et un texte, sans bouton; `ParentModeButton` ouvre les actions après trois secondes de `onPressIn`. | Actions pause/passer inaccessibles au clavier; P1 / M. | **Observé web et confirmé code.** Commande parentale nommée, activable au clavier et protégée contre une activation enfant accidentelle. |
| G06-05 | `useTimer.ts` décrémente par `setInterval` et ne recalcule pas depuis une échéance; la précision après onglet masqué ou veille reste inconnue. La pause n’est pas persistée. | Risque de dérive et de reprise ambiguë; P2 / M. | **Constaté code, effet non mesuré.** Tester arrière-plan/rechargement, puis persister l’état nécessaire sans changer les récompenses. |

Ce qui fonctionne dans l’essai : Lancer ouvre la préparation; participants, présence et humeur sont guidés; l’étape et le minuteur apparaissent; la validation est bloquée avant le temps minimum. L’essai reste sur données de test isolées et ne termine pas de routine familiale. La routine fictive utilisée a une première étape de 1 minute et une seconde sans durée. Pas d’essai iOS/Android revendiqué.

## Décisions existantes à préserver

La navigation globale disparaît pendant l’exécution; les participants sont explicites; les actions sensibles restent protégées; une double validation ne doit pas attribuer deux fois la progression. L’exécution inachevée se reprend après redémarrage et les étapes supprimées sont ignorées proprement. La menthe marque l’action/progression, la lavande le temps; grands contrôles adaptés aux enfants. Aucun nouveau store parallèle ni backend.

## Trois options pour l’écran en cours

Le [prototype HTML](./prototype.html) décrit la même routine, l’étape 1/3, 0:42 restant et deux enfants. Il n’a **pas été rendu ni vérifié visuellement** : l’ouverture locale dans le navigateur automatisé a été refusée par la politique de sécurité. Les PNG comparatifs exigés par la méthode n’existent donc pas encore. Ce sont des propositions, pas des captures du produit. Le correctif de persistance du minuteur est commun aux trois options.

| Option | Hiérarchie | Responsive | Accessibilité / états | Bénéfice | Risque |
|---|---|---|---|---|---|
| A — Repère calme **recommandée** | Nom de routine et progression en haut; étape, grand minuteur et statut au centre; validations alignées en bas. | Une colonne mobile; le même ordre au centre sur tablette, enfants en deux colonnes. | Temps annoncé « en cours / en pause / écoulé »; Parent reste un bouton nommé; les validations portent leur état. | Contexte clair sans nouveau geste. | Moins de vue sur les étapes suivantes. |
| B — Petit parcours | Bandeau des étapes visibles sous le titre, minuteur plus compact et validations sous la carte. | Bandeau horizontal mobile; grille de progression sur tablette. | Étape active annoncée; défilement du bandeau au clavier; pause explicite. | Vision de la suite. | Plus dense; risque de distraire l’enfant. |
| C — Concentration | Étape et minuteur dominent; le contexte de la routine et la progression sont dans un bandeau inférieur. | Plein écran mobile; zones latérales sur tablette. | L’ordre du focus garde Parent puis étape, timer, enfants; pause explicite. | Garde l’attention sur l’action présente. | Nom de la routine moins visible; reprise moins évidente. |

**Recommandation : A.** Elle applique les décisions de calme et de visibilité sans allonger le lancement. Le minuteur doit devenir durable et fondé sur le temps réel, indépendamment du choix graphique. La durée minimale ne doit pas pouvoir être contournée par rechargement ou pause; une heure de fin n’est montrée que si elle est honnête.

## Suite selon la méthode

L’utilisateur a répondu « j'autorise continue » immédiatement après la présentation du diagnostic G06 et de la recommandation A. Cette autorisation explicite pour poursuivre prime sur le point d’arrêt documentaire; elle ne vaut pas validation visuelle finale. L’option A a été intégrée sans nouvelle navigation : nom de routine visible, minuteur fondé sur une échéance persistée dans `currentExecution`, pause/reprise persistées, estimation de fin imprécise retirée, panneau Parent accessible par bouton et commandes nommées. À 768 px, la composition passe sur une colonne pour préserver le nom de l’enfant.

Contrôle web sur des origines fictives isolées : le minuteur conserve environ 0:45 après rechargement au lieu de repartir à 1:00; une pause à 0:45 garde exactement 0:45 après rechargement puis peut reprendre. Le panneau Parent s’ouvre avec Entrée, son bouton de fermeture et ses actions sont exposés; l’étape suivante sans durée n’hérite pas du minuteur précédent. Captures observées à 320, 390 et 768 px en clair, puis à 390/320 px en sombre avec un nom de routine long. La composition à 768 px a été corrigée pour éviter de tronquer le prénom et le titre long s’affiche sur plusieurs lignes. L’enchaînement d’une routine minutée avec une seconde routine sans durée a été joué jusqu’à la célébration finale. Un accès transitoire à une exécution nulle découvert pendant cet essai a été corrigé puis le parcours rejoué sans erreur. TypeScript strict, 23 suites/160 tests et `git diff --check` réussissent; tests de calcul d’échéance, pause et persistance ajoutés. La validation visuelle finale de l’utilisateur reste ouverte; aucun essai natif revendiqué.

Le prototype HTML antérieur n’a toujours pas de PNG comparatifs car son ouverture locale a été bloquée par la politique de sécurité du navigateur automatisé. Les captures du **produit intégré** ont pu être observées sur l’origine fictive; elles ne sont pas présentées comme les trois maquettes comparatives exigées pour un nouveau choix graphique. La direction A recommandée a été construite sur autorisation de l’utilisateur, sans inférer son approbation visuelle finale.

## Correctif de reprise — écran `/child/run` vide

Demande utilisateur : après lancement, l’écran des étapes et du minuteur ne s’affiche plus. Le code présentait deux chemins vers une vue vide : la redirection se déclenchait avant la réhydratation du store local, et une humeur difficile supprimait toutes les étapes si elles étaient toutes facultatives (ou anciennes sans indicateur `isRequired`). La redirection attend désormais la réhydratation; le filtrage ne retire que les étapes explicitement facultatives et conserve le déroulé complet si le filtre devait le vider. Les données enregistrées ne sont pas réécrites. Régression couverte par des tests de sélection des étapes; vérification visuelle en attente car le navigateur automatisé a bloqué l’origine locale de test.

Après retour utilisateur, l’URL de production fournie reste sur `/child/summary` lors de l’écran blanc. L’ouverture directe de `/child/run` sur `douceroutine.vercel.app` reproduit une erreur JavaScript dans le bundle : `ReferenceError: process is not defined`, à l’import du module `react-native-worklets/platformChecker` (`process.env.JEST_WORKER_ID`). Les précédentes hypothèses sur l’état de l’exécution ne suffisaient donc pas à expliquer ce parcours. L’entrée web de l’app initialise `process.env` avant de charger Expo Router lorsque le navigateur ne fournit pas `process`. Ce correctif ne touche ni les routines ni les données locales. TypeScript, 163 tests et le build web passent. Après publication du commit `9da0933`, le nouveau bundle Vercel charge `/child/run` sans cette exception et, faute de routine dans le navigateur de test isolé, revient normalement à Routines. La vérification du lancement avec les données locales de l’utilisateur reste ouverte.
