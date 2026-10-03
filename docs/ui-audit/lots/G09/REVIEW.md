# G09 — tour responsive de l'application

**État au 2026-10-03 : G09 clos à la demande de l'utilisateur, avec réserves de couverture.** Les corrections reproduites ont été intégrées et contrôlées sur web local; la clôture de la todo ne vaut pas vérification exhaustive de chaque état, validation sur tablette physique ni push. Le présent registre conserve séparément les observations et les états non vérifiés.

**Bilan de clôture.** Le cadre des trois accueils a été parcouru en portrait et paysage web; l'accueil Parent en paysage court, les onglets Progrès/Météo à 320 px, les écrans Pause/Bien-être sombres, les titres du résumé enfant et le libellé de recherche vide dans Activités ont été corrigés. Les 42 routes sont inventoriées, 40 ont eu au moins un passage responsive ciblé. `/onboarding/child` et `/onboarding/complete` n'ont pas été rejouées pendant G09; le parcours G07 antérieur reste la seule preuve les concernant. Les autres limites sont archivées ci-dessous pour tout audit ultérieur. Aucun push sans accord explicite juste avant l'envoi.

**Validation utilisateur du 2026-10-03.** Après le complément, l'utilisateur confirme « ok cloture je valide et push ». Sur l'origine fictive préparée, l'onglet se trouve ensuite sur `/parent/add-routine` avec l'enfant « Lily » sélectionnable; le parcours de création a donc abouti côté utilisateur. L'agent n'a pas observé directement les écrans `/onboarding/child` et `/onboarding/complete` pendant leur traversée : leur contrôle responsive propre reste non attesté. Le clavier virtuel réel et le texte système agrandi restent également non testés. La clôture est acceptée avec ces limites.

### Complément demandé après clôture — 2026-10-03

À 320×700 sombre, le profil local fictif a permis de vérifier le PIN erroné (`1111`) : « Code incorrect. Réessayez. » apparaît, le clavier se réactive après la remise à zéro, et « Annuler et revenir à Routines » mène à `/routines`. Aucun code n'a été changé. Dans Activités, le filtre « Extérieur » donne 33 idées; une recherche absente donne zéro résultat et « Effacer la recherche » restaure les 33 idées sans supprimer le filtre. Après remise à zéro des filtres, les 98 cartes ont été chargées à 320 px; la dernière (« Escape Room Salon ») devient visible au-dessus de la navigation basse après défilement, et `scrollWidth = innerWidth = 320`. À 1024×768, les 98 cartes chargées n'élargissent pas le document (`scrollWidth = innerWidth = 1024`).

Le navigateur intégré n'a pas exposé de clavier virtuel réel ni de changement effectif du zoom par raccourci clavier. Ces deux réserves restent **non vérifiées**; une simulation de largeur ne prouve pas le comportement du texte système agrandi. Les écrans d'onboarding Enfant/Fin ne sont pas encore rejoués pendant ce complément, car une installation neuve impose la création d'un nouveau code Parent avant de les atteindre; cette saisie doit être faite par l'utilisateur dans l'interface.

L'origine fictive `localhost.:8099` a été préparée avec « Famille Test G09 » jusqu'à « Créez votre code ». Cet écran ne déborde pas à 320×700 ni à 1024×768 (`scrollWidth = innerWidth`). L'onglet reste ouvert pour la saisie du code par l'utilisateur. Après ce complément documentaire, TypeScript strict, 27 suites / 174 tests Jest et `git diff --check` passent. Aucune donnée du profil familial réel ni aucun code existant n'ont été modifiés.

### Reprise ciblée — recherche vide et largeur Famille (2026-10-03)

Sur le profil fictif local en sombre à 320×700, la carte enfant de `/parent/children` mesure 272 px dans une zone de 320 px et le document ne déborde pas; sa largeur de base est déjà limitée par `contentWidth`. L'hypothèse d'un débordement de cette carte est rejetée, sans changement produit. Le PIN de test `0000` a été utilisé normalement.

Dans `/activities`, une recherche ne donnant aucun résultat affichait « Effacez quelques filtres » et « Effacer les filtres » alors que seule la recherche pouvait être en cause. L'état vide indique désormais d'essayer un autre mot-clé et l'action efface uniquement la recherche. À 320 px sombre, le texte, l'action et le retour des 98 idées ont été vérifiés au clic; `scrollWidth = innerWidth = 320`. Le filtre combiné a ensuite été vérifié dans le complément ci-dessus; le clavier virtuel et le texte système agrandi restent non vérifiés.

Contrôles après correction : TypeScript strict, 27 suites / 174 tests Jest, 4 suites / 10 tests web et `git diff --check` réussis. Les avertissements `react-test-renderer` sont inchangés. Aucun push.

### Couverture complémentaire et parcours enfant — 2026-10-03

Le cadre commun des trois accueils a été revu en sombre à 1024×768 : Routines (lancement, calendrier et dernières actions atteints par défilement), Activités (recherche, deux cartes puis grille complète et « Afficher 12 idées de plus »), Parent (conseil entier au premier écran). Sur Parent, les Réglages rapides ouverts défilent jusqu'au dernier lien et au conseil, au-dessus de la barre fixe. La largeur du document reste de 1024 px. Ces constats s'ajoutent aux contrôles précédents en clair/paysage et portrait; **R1 est couvert sur web local**, sans essai sur tablette physique.

À 320×700 sombre, l'accès direct `/parent/add-child` ouvre le panneau jusqu'au bouton final; `/parent/edit-routine` montre cinq étapes et « Enregistrer » par défilement, et l'édition d'une étape ouvre son panneau sans sauvegarde. `/parent/catalog` mène après le PIN normal au constructeur avec catalogue ouvert. Le PIN lui-même a été observé et utilisé à 320 px; création et erreur de code restent non testées.

Les anciennes routes `/child`, `/child/home`, `/child/participants`, `/child/presence` et `/child/mood` ont été suivies jusqu'à leur destination effective, avec les paramètres d'une routine fictive pour les trois dernières. `/child/rewards` mène au PIN protégeant `/parent/stats`. `/child/calendar` a été défilé jusqu'au dernier repère à 320×700 sombre.

Les anciennes routes Activités ont été ouvertes à 320 px : Favoris et Récentes sélectionnent le bon onglet; Surprise ouvre son panneau et garde l'action finale visible; Résultat revient à Découvrir quand aucune activité courante n'est définie; le formulaire historique revient à Activités. Un lien direct vers `yoga-rigolo` ouvre le détail en panneau, défilé jusqu'aux trois actions basses. À 1024×768 sombre, la grille Activités et sa dernière action chargée sont atteignables. Les compteurs singuliers Favoris/filtre ont été corrigés. Aucun favori ou activité terminée pendant ce passage.

Une origine temporaire vierge sur `localhost.:8099` a ensuite permis de revoir `/onboarding/family` à 320×700, 390×844, 768×1024 et 1024×768 en clair : champ, aide et bouton final visibles, aucune largeur de document dépassée à 320 px. Aucun nom saisi, aucun PIN créé. Les étapes Enfant et Fin restent donc hors de ce passage G09; leur parcours antérieur G07 demeure documenté. Le navigateur temporaire a été fermé. La liste Parent avec une routine fictive et son menu d'actions a aussi été vue à 320×700 sombre jusqu'à « Mettre à la corbeille », sans la déclencher.

Contrôles techniques après les corrections de cette reprise : `npx tsc --noEmit`, 27 suites / 174 tests Jest, 4 suites / 10 tests web et `git diff --check` réussis. Les avertissements `react-test-renderer` restent présents dans les tests web.

`/child/summary` a été ouvert par « Lancer » depuis `/routines` sur la routine fictive à cinq étapes. À 320×700 sombre, les noms des étapes étaient tronqués malgré leur brièveté : la case, le numéro, l'icône et les flèches occupaient la même ligne. La rangée compacte place désormais les deux flèches sous le titre, en gardant leurs cibles de 44 px et le texte entier. Les cinq lignes et l'action fixe ont été revues à 320 px; disposition normale conservée à 390 px. Les écrans Présence et Humeur ont été parcourus à 320 px, puis Humeur à 768 px, sans lancer la routine ni enregistrer d'humeur. La présence cochée est temporaire dans ce parcours.

Sur le profil de test local, `/child/pause` à 320×700 sombre avait des titres presque invisibles et une carte enfant superposée au texte et à l'action. La page héritait de couleurs claires statiques et imposait une hauteur fixe à son contenu. Correction intégrée : en-tête partagé lié au thème; texte, badge et carte de Pause liés au thème; contenu défilable sans superposition. Après correction, texte et action finale ont été revus à 320×700 sombre et clair, 667×375 sombre (défilement jusqu'au bouton) et 768×1024 sombre. Le document ne déborde pas horizontalement à 320 px.

`/child/wellness` à 320×700 sombre présentait le même manque de contraste; le bouton « Commencer » était coupé et la page ne défilait pas. Les textes/cartes de l'introduction et des composants Respiration/Étirements utilisent désormais le thème; la page défile. Introduction et bouton final revus à 320×700 clair/sombre, 390×844 et 768×1024 clairs, et 667×375 sombre; phase Respiration ouverte et lisible en paysage. Aucun exercice terminé, aucune étoile attribuée. `/child/celebration` a été observé en lecture seule à 320×700 sombre : récapitulatif et bouton final accessibles par défilement. Les autres états de ces écrans et la tablette physique restent à tester. TypeScript strict et 27 suites / 174 tests Jest passent après ces corrections.

## Point de départ observé

Sur la capture fournie, la section « Idées et conseils » de `/parent` commence immédiatement au-dessus de la navigation basse et son contenu n'est pas visible. **À confirmer** : la capture seule ne prouve pas que le contenu est impossible à atteindre en défilant. Reproduire la largeur, la hauteur utile et l'orientation de la tablette, puis tester le défilement jusqu'au dernier conseil. Priorité **P1** si le dernier contenu ou une action reste sous la navigation; **P2** si seule la composition au premier écran est maladroite.

Hypothèses à vérifier, sans conclure avant reproduction : hauteur et zone réservée à `AppBottomNavigation`, espace bas du `ScrollView` Parent, adaptation des cartes selon la hauteur du paysage et safe-area. Le cadre commun réserve une hauteur mesurée à la barre; l'accueil Parent ajoute son propre défilement. Examiner leur interaction avant une correction locale.

### Première observation locale — 2026-10-01

Sur le profil de test local `localhost.:8081`, le PIN `0000` fourni antérieurement par l'utilisateur permet un contrôle **sans écriture de données**. En sombre à 1280×768, le haut de « Idées et conseils » apparaît au bord de la barre, comme sur la capture; après défilement, le conseil entier et son bouton « Suivant » sont visibles au-dessus de la barre. À 1280×896, le conseil est déjà entier au premier écran. À 320×700 en sombre, le conseil, le bouton et les Réglages rapides ouverts restent atteignables par défilement; la largeur du document reste de 320 px. **Conclusion provisoire : contenu accessible; défaut de composition au premier écran selon la hauteur utile (P2), pas de chevauchement bloquant reproduit.** La hauteur CSS utile de la tablette de l'utilisateur n'est pas connue et le rendu physique reste non testé.

Sur un second profil local `127.0.0.1:8098`, `/routines` a été vu à 320×700, 390×844, 768×1024, 1024×768 et 1440×900; les éléments bas restent atteignables en défilant à 320 et 1024. `/activities` a été vu aux mêmes tailles, en sombre sauf 1024×768 en clair; le panneau Filtres et le détail d'activité ont été ouverts à 320×700, puis défilés jusqu'aux boutons du bas. `/child/calendar` a été vu et défilé à 320×700 en sombre. Ces observations sont **ciblées**, pas la validation finale de ces routes, des autres états, des deux thèmes à chaque taille ni des 42 routes.

### Correction locale — accueil Parent en paysage court

Après l'accord « Ok go » sur G09, les espacements verticaux et la hauteur minimale des cartes de `/parent` sont réduits uniquement à partir de 900 px de large et en dessous de 820 px de haut. La grille, l'ordre des outils, les textes et les cibles restent inchangés. Comparaison sur le même profil fictif : avant, à 1280×768 sombre, le titre « Idées et conseils » était visible mais la carte coupée par le bas du premier écran; après, la carte et « Suivant » tiennent entièrement au-dessus de la barre. Le même résultat a été observé à 1024×768 sombre et 1280×768 clair. Le rendu à 320×700, 390×844, 768×1024 et 1440×900 clair conserve sa disposition précédente. Correction **intégrée et observée sur web local**, sans validation visuelle explicite de l'utilisateur ni essai sur tablette physique.

Contrôles techniques après cette correction : `npx tsc --noEmit`, 27 suites / 172 tests Jest, 3 suites / 5 tests web et `git diff --check` réussis. Les avertissements de dépréciation de `react-test-renderer` restent présents dans les tests web. Aucun changement de données de test enregistré pendant le parcours responsive.

### Reprise locale — 2026-10-02

Sur `localhost.:8081` avec le profil de test et le PIN normal `0000`, `/parent/children` a été observé à 320×700 clair : liste, dernière carte et panneau « Ajouter un enfant » accessibles par défilement; le panneau a aussi été observé à 1024×768. `/parent/calendar` à 320×700 clair : état vide, action finale et panneau de création atteignables. Aucune donnée enregistrée.

À 320×700, les onglets de `/parent/stats` et `/parent/weather` débordaient : « Récompenses réelles » et « Repères horaires » étaient coupés. Les onglets occupent désormais la largeur disponible et leurs libellés peuvent revenir à la ligne en mode compact. `/parent/stats` a été revu à 320×700 clair et sombre, 390×844 sombre et 768×1024 sombre. `/parent/weather` a été revu à 320×700, 390×844 et 768×1024 en sombre, y compris l'ouverture de « Repères horaires ». Il s'agit d'une vérification **web locale**, pas d'une validation sur appareil. TypeScript strict et 27 suites / 174 tests Jest réussis après correction.

Suite du parcours, sans écriture de données : `/parent/import` à 320×700 sombre, champ et action finale atteignables par défilement; onglet Corbeille vide vu à la même taille. `/parent/routines` à 320×700 sombre : état vide, recherche et filtres visibles. `/parent/add-routine` à 320×700 sombre : formulaire vide jusqu'à l'action finale, sélecteur de pictogrammes avec catégories et bouton « Voir plus d'icônes », catalogue en panneau et éditeur d'étape. L'éditeur a aussi été vu à 1024×768 et 667×375 : ses champs défilent jusqu'au bas tandis que l'action reste accessible. Pas de débordement horizontal du document à 320 px. **Limites :** états remplis et listes longues, clavier virtuel réel, modification/enregistrement et autres tailles/thèmes non rejoués pour ces écrans.

`/parent/rewards` a ensuite été observé à 320×700 sombre : les deux onglets sont lisibles, l'état vide et « Créer une récompense » sont accessibles par défilement, puis le formulaire de création s'ouvre avec son action basse visible; aucune récompense créée. `/child/calendar/day` a été ouvert directement à 320×700 sombre, défilé jusqu'à son texte final, puis l'onglet Semaine et sa dernière carte ont été atteints. Ce passage ne couvre pas les repères nombreux ni la vue avec plusieurs enfants.

Les alias `/`, `/today` et `/explore` ont été ouverts sur le profil local et leur destination effective confirmée (`/routines`, `/routines`, `/activities`). `/child/run` a été observé en lecture seule avec une exécution de test déjà en cours à 320×700, 390×844 et 768×1024 en sombre : titre, étape, compte, minuteur et validation sont visibles sans débordement observé. Aucune étape validée, aucune pause ni fin déclenchée; ce n'est pas un rejeu fonctionnel complet du parcours.

## Périmètre initial et réserves archivées — aucune todo G09 active

- [x] **R1 — Cadre commun et trois accueils (web local).** Le paysage court de Parent, Routines et Activités a été revu avec défilement jusqu'aux dernières actions; Réglages rapides ouverts sur Parent. Contrôles portrait et clair consignés ci-dessus. La tablette physique reste hors périmètre.
- **R2 — Parent, partiellement observé.** Les pages et panneaux listés dans le registre ont eu un premier passage; création/erreur du PIN, clavier virtuel, corbeille remplie et listes longues restent non vérifiés dans G09.
- **R3 — Routines et parcours enfant, partiellement observé.** Préparation, minuteur, pause, bien-être, célébration et calendrier ont eu des contrôles ciblés; plusieurs enfants, grands textes et exécution complète n'ont pas été rejoués pendant G09. Les essais fonctionnels antérieurs G06 restent documentés séparément.
- **R4 — Activités et premier démarrage, partiellement observé.** Recherche vide, filtres, surprise, collections, détail et première page d'onboarding ont été vus; filtres combinés, clavier et les deux dernières pages d'onboarding restent non vérifiés dans G09. Le parcours G07 antérieur n'est pas réattribué à G09.
- **R5 — Vérification transverse, échantillonnée.** Les tailles, thèmes et états effectivement vus figurent plus haut. Pas de matrice exhaustive écran × taille × thème, de zoom/texte système agrandi, de clavier virtuel réel, ni d'essai sur appareil iOS/Android; ces limites ne sont pas déclarées réussies.

## Registre des pages à ne pas oublier

Les 42 fichiers de route hors layouts sont rattachés ci-dessous. Une case cochée signifiera **parcours responsive observé**, avec largeur, thème et preuve notés; la présence dans cette liste signifie seulement **inventorié**. Pour les redirections, vérifier la destination et le retour, puis tester le rendu sur la page cible.

### Accueils et anciennes adresses — R1

- [x] `/routines` — premier passage web aux cinq tailles; états longs encore ouverts
- [x] `/activities` — premier passage web aux cinq tailles; tous les filtres/états encore ouverts
- [x] `/parent` — premier passage web aux cinq tailles et correction paysage court; tablette physique encore ouverte
- [x] `/` → Routines — redirection locale confirmée
- [x] `/today` → Routines — redirection locale confirmée
- [x] `/explore` → Activités — redirection locale confirmée

### Parent et accès — R2

- [x] `/pin` — déverrouillage normal à 320 px sombre; création, erreur et retour non rejoués
- [x] `/parent/children` — 320×700 clair, panneau ajout; 1024×768 panneau
- [x] `/parent/add-child` — accès direct, panneau jusqu'au bouton final à 320 px sombre
- [x] `/parent/routines` — états vide et rempli, menu d'actions jusqu'en bas à 320×700 sombre
- [x] `/parent/add-routine` — état vide, catalogue, icônes, éditeur d'étape à 320×700 sombre; éditeur à 1024×768 et 667×375
- [x] `/parent/edit-routine` — cinq étapes, action finale et panneau d'étape à 320 px sombre; aucune sauvegarde
- [x] `/parent/catalog` → `/parent/add-routine?catalog=1` — PIN puis catalogue ouvert à 320 px sombre
- [x] `/parent/calendar` — 320×700 clair, panneau ajout
- [x] `/parent/stats` — 320/390/768, onglets corrigés; autres états à parcourir
- [x] `/parent/rewards` — 320×700 sombre, état vide et formulaire sans enregistrement
- [x] `/parent/weather` — 320/390/768 sombre, onglets corrigés; contenu long à parcourir
- [x] `/parent/import` — champ et action finale à 320×700 sombre
- [x] `/parent/trash` — onglet Corbeille vide à 320×700 sombre; contenu rempli à vérifier

### Enfant, préparation et exécution — R3

- [x] `/child` → Routines — redirection confirmée
- [x] `/child/home` → Routines — redirection confirmée
- [x] `/child/participants` → préparation — paramètres fictifs conservés
- [x] `/child/mood` → préparation — paramètres fictifs conservés, Humeur affichée
- [x] `/child/presence` → préparation — paramètres fictifs conservés, Présence affichée
- [x] `/child/summary` — cinq étapes, Présence et Humeur à 320 px; Humeur à 768 px; lancement final non déclenché
- [x] `/child/run` — étape et minuteur observés à 320/390/768 sombre; pause, fin et textes longs encore ouverts
- [x] `/child/pause` — contraste et défilement corrigés, 320 clair/sombre, 667×375 et 768 sombre
- [x] `/child/wellness` — contraste et bouton corrigés; introduction et Respiration observées, fin non jouée
- [x] `/child/celebration` — état de test à 320 sombre, bouton final atteint sans clic
- [x] `/child/calendar` — 320×700 sombre, dernier repère atteint
- [x] `/child/calendar/day` — 320×700 sombre, fin de page atteinte
- [x] `/child/calendar/week` — onglet Semaine et dernière carte à 320×700 sombre
- [x] `/child/rewards` → PIN puis Progrès Parent — redirection confirmée

### Activités et onboarding — R4

- [x] `/activities/activity/[id]` → détail en panneau, `yoga-rigolo` à 320 px sombre
- [x] `/activities/activity-form` → Activités — redirection confirmée
- [x] `/activities/favorites` → Favoris — onglet et carte à 320 px sombre
- [x] `/activities/history` → Récentes — onglet et cartes à 320 px sombre
- [x] `/activities/result` → Activités si aucun résultat courant — redirection confirmée
- [x] `/activities/surprise` → panneau Surprise — action finale à 320 px sombre
- [x] `/onboarding/family` — installation vierge à 320/390/768/1024 clair, sans saisie
- `/onboarding/child` — non observé pendant G09; vérification G07 antérieure seulement
- `/onboarding/complete` — non observé pendant G09; vérification G07 antérieure seulement

### États transversaux souvent oubliés — R5

- Dialogues, panneaux, catalogue, filtres, détails et sélecteurs : observations ciblées seulement; focus et clavier virtuel non vérifiés partout.
- Listes vides et longues, texte agrandi, noms longs, erreurs de chargement et passage portrait ↔ paysage : couverture incomplète, voir les preuves par écran.
- Barre de navigation, en-tête, fonds, safe-area et dernière action : contrôles ciblés sur les trois accueils et les écrans corrigés, pas de validation systématique de chaque route.

## Critères de clôture initiaux et limite de la clôture demandée

L'objectif initial exigeait une vérification de chaque état significatif de la [matrice globale](../../GLOBAL-COVERAGE.md), sans contenu coupé, aux tailles et thèmes prévus. **Cet objectif exhaustif n'est pas démontré** par les passages ciblés de G09. La demande explicite de clôture retire G09 de la file active avec ces réserves documentées; elle ne transforme pas un écran inventorié ou observé en écran vérifié. Les corrections réellement intégrées ont passé TypeScript strict, les tests du dépôt et `git diff --check` lors de la dernière reprise.

Les tests sur appareil iOS/Android avaient été écartés par l'utilisateur; G09 couvre le web responsive et les inspections de code correspondantes. Un navigateur simulé ne vaut pas validation sur sa tablette réelle.
