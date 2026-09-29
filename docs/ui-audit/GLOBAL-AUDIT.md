# Audit global — bilan et suivi

## État actuel — 2026-09-27

Nouvelle demande G08 : inventaire des endroits avec choix ou affichage d'icônes, avatars et images, à partir du signalement « très peu d'icônes » dans le constructeur de routine sur tablette. Diagnostic confirmé par le code : 18 premiers émojis de la catégorie Hygiène seulement sont présentés pour routines et étapes, alors que huit groupes existent. La [todo G08 par emplacement](./lots/G08/REVIEW.md) couvre également avatars, calendrier, Activités, humeurs, météo, récompenses, image d'étape et rendu partagé `OpenMoji`. Le rendu sur la tablette de l'utilisateur n'a pas été testé ici; aucun code produit ni donnée familiale modifié.

Clôture G06 à la demande « termine la todo et une fois terminé supprime » : le parcours `/child/run` a été rejoué sur un profil Edge temporaire avec routine fictive. Étape, nom et minuteur visibles; la pause garde son temps après rechargement, puis reprend avec une échéance persistée. Captures à 320/390/768 px sans débordement; `npm run test:web-run` réussit. Les trois maquettes comparatives disposent maintenant d'un PNG lisible. **Aucune tâche G06 ne reste dans la todo active**; les diagnostics précédents restent conservés ci-dessous comme journal historique. Pas d'essai iOS/Android, selon le périmètre demandé.

Nouvelle demande initialement inscrite en **todo future G07** : refaire le parcours de première création du profil, dans l’ordre message de base/nom de famille/informations utiles → code Parent → premier enfant → accueil. La demande d’inscription seule n’autorisait pas la construction; voir [G07/REVIEW.md](./lots/G07/REVIEW.md). Aucun changement de produit ni de données pour cette demande.

G07 a ensuite été autorisé explicitement par « je valide go ». L'installation neuve reçoit maintenant les trois étapes puis une fin avec ouverture de `/routines`; le stade inachevé est conservé dans le profil local et les familles existantes ne sont pas relancées dans le parcours. La première vue intégrée a été capturée sur profil navigateur isolé; contrôles et limites dans [G07/REVIEW.md](./lots/G07/REVIEW.md). La validation visuelle finale du produit n'est pas déduite de l'autorisation de construire.

Clôture G07 le 2026-09-27, à la demande « termine la todo et une fois terminé supprime » : parcours intégral rejoué par clic sur profil Edge temporaire, PIN confirmé avant l’enfant, un seul enfant enregistré, retour et reprise après rechargement aux étapes PIN/enfant/fin, arrivée durable sur `/routines`. Captures intégrées vérifiées à 320/390/768 px sans débordement, ainsi qu’en thème sombre. TypeScript, 169 tests, export web et contrôle Git réussis. **Aucune tâche G07 ne reste dans la todo active**; la fiche et les preuves restent en archive de travail. Aucun essai sur appareil iOS/Android, conformément au périmètre demandé.

Reprise G07 : code du profil local, des routes Parent/PIN/enfant et des stores examiné; premier écran capturé sur navigateur isolé. Les étapes existent séparément, le guide historique dit « enfant puis code » et aucune progression ne mène automatiquement de la saisie du nom au code puis à l’enfant. Prototype complet clair/sombre et état d’erreur préparé dans [G07/REVIEW.md](./lots/G07/REVIEW.md). Aucune modification produit; décision visuelle et autorisation de construction encore ouvertes.

Demande ultérieure : étendre le fond à ronds de l’accueil à toutes les pages. Le décor `PastelOrbs quiet` est désormais rendu une seule fois dans le cadre racine; les fonds opaques des sous-routes Parent, des pages Parent existantes, du calendrier enfant (y compris son état vide), des écrans de préparation et d’exécution enfant, ainsi que du cadre Activités, sont transparents. Les cartes et surfaces de contenu restent opaques pour préserver la lisibilité. Après signalement sur l’URL Vercel `/child/summary`, le tour des routes et des conteneurs a confirmé que le dégradé de préparation masquait le fond commun; cette page et le calendrier enfant ont été corrigés. TypeScript, 165 tests, export web et `git diff --check` réussissent. Le rendu visuel final sur les pages du navigateur de l’utilisateur reste à confirmer; aucun changement des données locales.

Après publication de `b4f07fb` sur `main`, le domaine de production a servi un nouveau bundle (`index-9a7aac…` au lieu de `index-f940454…`). Captures du produit publiées contrôlées à largeur navigateur 821 px : `/routines`, `/activities`, `/child/summary` avec la routine existante en lecture seule, `/parent` arrêté au PIN et `/child/calendar` montrent tous les deux ronds pastel sur le fond clair. Aucun lancement, changement de PIN ou écriture dans les données familiales. Le rendu dans le navigateur personnel de l’utilisateur et le thème sombre restent non vérifiés visuellement.

La todo globale est **validée et clôturée par l’utilisateur le 2026-09-27** dans le périmètre web et code convenu. G01, G02 et G05 ont été explicitement autorisés, intégrés et validés visuellement. Les parcours métier G03 ont été rejoués sur données fictives isolées et les corrections sont détaillées dans [FUNCTIONAL-AUDIT.md](FUNCTIONAL-AUDIT.md). TypeScript et 158 tests réussissent; les exports de production web, Android et iOS du code actuel ont réussi. Les contrôles web ont été rejoués sur des origines séparées des données familiales. E17/V3 a été intégré puis validé visuellement le 2026-09-26. G05 option A a été vérifiée avec une installation fictive peuplée à `127.0.0.1:8081`, puis validée visuellement le 2026-09-27. Les essais sur appareil iOS/Android et avec lecteur d’écran réel ont été retirés du périmètre de clôture à la demande de l’utilisateur; ils restent **non testés**. La section suivante conserve le point de départ historique pour comparaison.

## Point de reprise — 2026-09-20

Objectif : améliorer la clarté, la cohérence et la fiabilité de l'existant. G01 autorisé explicitement, intégré et contrôlé sur web : fiche lots/G01/REVIEW.md et preuves lots/G01/integration/. Parent observé après déverrouillage utilisateur. Les réserves natives, les essais de création du PIN sur jeu isolé et la validation visuelle finale restent ouverts. G02 préparé : trois variantes comparables dans lots/G02/REVIEW.md. Prochaine action : choix/corrections puis autorisation du lot; aucune construction G02/G03 autorisée.

Décisions acquises : trois destinations, identité existante, PAGE-01 E01–E16 et corrections ultérieures. N2 barre bord à bord et P1 cadenas filaire restent des références; E17/V3 reste ouvert, non validé visuellement. Les rejets précédents restent dans le journal de PAGE-01. Aucun nouveau choix graphique ni rejet dans le chantier global.

## Ce qui existe et fonctionne déjà

- 39 routes hors layouts, 4 layouts, 3 intentions; plusieurs routes sont des alias, pas 39 écrans distincts. Dix stores dans src/stores et un store Activités; données locales sans backend applicatif. La météo dépend d'un service externe.
- Routines : prochaine routine, aperçu des étapes, lancement, calendrier, autres routines, enchaînement, gestion et tenue. Lancement vers préparation et retour calendrier observés.
- Activités : 98 idées affichées dans la session; recherche, collections Découvrir/Favoris/Récentes, filtres, surprise, fiche et confirmation de participation. État Favoris vide et ouverture/fermeture de fiche observés.
- Parent, lu dans le code : cinq outils, famille, constructeur création/édition commun, catalogue en superposition, calendrier, progrès/récompenses, météo, import et corbeille.
- Le catalogue préremplit l'état du formulaire; addRoutine est appelé par Enregistrer, pas par applyTemplate (routine-builder-screen.tsx). Contrat correct dans le code, à rejouer en UI.
- ResponsiveOverlay partagé; thème réactif sur Routines/Activités; pas de débordement horizontal de document mesuré sur ces deux pages à 320/768/1440.

## Constats prioritaires et suivi

Mise à jour après G01 : G01-01 à G01-05 intégrés, contrôles web décrits dans la fiche du lot; réserves natives et validation finale ouvertes. Le tableau conserve les preuves initiales pour comparaison. G03-01 confirmé partiellement en UI : Import et export ouvre une page Importer/Corbeille, sans commande d’export visible.

| ID / lot | Constat et preuve | Impact / certitude | Priorité / effort indicatif | Critère de réussite |
|---|---|---|---|---|
| G01-01 | AppBottomNavigation.tsx et routines-390.png : barre flottante arrondie; cadenas rempli, actif bold | Écart N2/P1 confirmé code + écran | P1 / S | Menu commun conforme à la décision retenue, trois libellés et état actif clair |
| G01-02 | Activités → Parent → PIN → Retour aboutit à Routines | Retour de contexte perdu, reproduit | P1 / M | Annuler rend la destination d'origine et son contexte; liens directs ont un repli défini |
| G01-03 | pin-390.png et pin-dark-390.png identiques en thème clair/sombre; chiffres très pâles; app/pin.tsx et AppTopNavigation utilisent COLORS fixes | Rupture de thème observée; contraste à mesurer | P1 / M | PIN lisible dans les deux thèmes, noms/rôles clavier et annonces d'erreur vérifiés |
| G01-04 | app/_layout.tsx réserve bottomOffset; les trois écrans ajoutent 120 px en bas | Cumul de code confirmé, excès à mesurer en fin de défilement | P2 / S | Une réserve justifiée, aucune action cachée ou espace superflu |
| G01-05 | AppBrandHeader minHeight 72 et bandeau blanc; header visible dans captures | Écart aux commandes flottantes H3; impact à arbitrer par lot | P2 / S | Cadre cohérent et hauteur utile, appliqué sur les trois destinations |
| G02-01 | activities-390.png et activities-320.png : premier écran occupé par titres, tabs sur deux lignes, recherche et commandes; suggestion seulement en bas | Densité avant le contenu observée | P1 / M | Une première idée exploitable ou l'action de recherche clairement visible sans long défilement |
| G02-02 | measurements.json : Filtrer/Effacer 32 px de haut, favoris 40 × 40, 15 contrôles sous 44 parmi les boutons DOM rendus d'Activités | Mesure web confirmée; contrôle de hitSlop/natif restant | P1 / S | Cible effective ≥44 ×44, vérifiée tactile/clavier |
| G02-03 | activity-detail-390.png : 13 pastilles de métadonnées, dont durée/âge déjà répétés au-dessus | Charge de lecture observée | P2 / M | Consigne et matériel prioritaires; détails conservés mais hiérarchisés |
| G02-04 | filters-390.png : 12 rubriques dans une navigation latérale; certains libellés Autonome/Sans surveillance | Densité observée; cohérence avec usage accompagné à clarifier | P2 / M | Choix courants rapides, filtres avancés conservés et vocabulaire cohérent |
| G02-05 | routines-1440.png : ressenti, vent et pluie encore visibles; météo et outfit-390.png gardent conseils et cartes | Écarts aux décisions E09/E13 et corrections tenue confirmés | P2 / M | Ne pas réintroduire les choix rejetés; séparer corrections acquises et détails E17 encore ouverts |
| G03-01 | ParentHomeScreen promet Import et export / Sauvegarder ou restaurer; DataToolsScreen expose import/trash; RoutineShareModal et CompactRoutineRows sans appel repéré dans les routes/features actuelles | Export/partage/impression potentiellement devenus inaccessibles; code, UI Parent non vérifiée | P1 / M | Chaque fonction historique a un accès réel ou une décision explicite; promesse de sauvegarde fidèle au périmètre exporté |
| G03-02 | /parent vit dans (tabs), hors ParentLayout; le menu protège via PIN mais l'écran ParentHomeScreen n'a pas de garde | Différence de couverture d'accès confirmée dans le code; pas de tentative de contournement | P1 / M | Politique d'accès cohérente entre menu, lien direct et relance, selon périmètre explicitement choisi |
| G03-03 | AppTutorialModal sans appel repéré; localProfileStore conserve tutorialPromptPending et complétion | Fonction historique potentiellement orpheline | P2 / S | Premier usage guidé ou abandon explicite; aucun état stocké sans rôle défini |
| G04-01 | Captures anciennes, décisions, prototypes et produit réel ne décrivent pas le même état | Risque de travailler sur une hypothèse documentaire | P1 / S | Un point d'entrée actuel; sources historiques datées; validation ≠ intégration ≠ vérification |

Efforts S/M indicatifs, pas engagements de durée. Aucun P0 établi par le tour initial. G01 a ensuite été intégré, voir son suivi.

## Couverture et limites

**Observé réellement sur web local :** Routines et Activités à 320/390/768/1440 en clair; 390 en sombre; PIN clair/sombre; tenue, calendrier Maintenant, préparation de routine, filtres, fiche d'activité et Favoris vide à 390. Ouvertures/fermetures et retour du PIN depuis Activités rejoués. Captures datées dans global-evidence-2026-09-20.

**Pas encore vérifié :** parcours Parent complets derrière le PIN, premier démarrage isolé, création/édition/enregistrement, import/export/restauration, météo en panne/permission refusée, exécution complète/pause/fin/reprise après relance, multi-enfants, attribution de récompenses, aliases en navigation réelle, liens invalides, clavier complet/lecteur d'écran/contrastes chiffrés/grand texte, mouvement réduit et appareils natifs. Le cadre des trois pages et Parent responsive clair/sombre ont depuis été contrôlés dans G01; les parcours métier ne le sont pas exhaustivement. Une mesure du document sans débordement n'exclut pas toute troncature interne.

Les mesures ne recensent que les éléments exposant role=button, pas tous les contrôles. Les captures représentent l'état courant des données locales, pas un jeu de test exhaustif. L'ouverture de la fiche Défi silence alimente automatiquement Récentes; aucune activité terminée, récompense attribuée ou routine modifiée. Thème clair restauré après contrôle.

## Journal

### 2026-09-20 — Adaptation initiale

Demande : audit de l'existant puis correction globale, notamment menu. Passage de la revue stricte page/élément aux lots; décisions et rejets conservés. E17 suspendu sans validation. Journal initial complet conservé dans GLOBAL-AUDIT-HISTORY-2026-09-20.md.

### 2026-09-20 — Tour réel et méthode complète mais rapide

Demande : parcourir app et méthodologie, vérifier les oublis et préparer une montée en qualité globale. Action : lecture des routes/features/stores et méthodes; relance Expo local; tour UI avec captures; couverture des 39 routes et fonctions sans route. Ajouts à la méthode : cinq passages, limite 3–5 résultats par lot, matrice de risques, données de test, critères mesurables, distinction présent/accesssible/testé, sources actives et archives. PIN non contourné; accès Parent demandé sans solliciter le code. Aucun nouveau prototype ni construction validé.

## Todo priorisée

- [x] Cartographier les 39 routes et les rattacher aux surfaces.
- [x] Croiser anciens audits, décisions et code actuel; signaler les fonctions sans accès repéré.
- [x] Observer les surfaces accessibles et enregistrer captures/mesures.
- [x] Rendre la méthode complète, limitée par lots et sans validation par micro-détail.
- [x] Clarifier METHOD, MASTER et AGENTS; conserver les historiques.
- [x] Observer l’accueil Parent, ses réglages et le retour depuis Import après déverrouillage utilisateur; parcours métier complets encore à vérifier en G03.
- [x] G01 : fiche et prototype menu/cadre, retour de contexte et PIN, critères et captures.
- [x] G01 : prototype validé, construction autorisée, intégration et vérifications web réalisées.
- [x] G01 : validation visuelle finale donnée explicitement le 2026-09-26 après la question de clôture.
- [x] G01 : essais sur appareil retirés du périmètre le 2026-09-27 à la demande de l’utilisateur; **non testés**. Création du PIN ouverte et annulation vérifiées sur installation isolée.
- [x] G02 : diagnostic, trois variantes et prototype transversal avec captures préparés.
- [x] G02 : prototype A corrigé (grille directe) validé; construction explicitement autorisée et intégrée sur les trois destinations.
- [x] G02 : contrôles web des trois destinations à 320/390/768/1440, clair/sombre à 390/768, grille 1/2/3 colonnes et panneaux au clavier; cibles Parent corrigées.
- [x] G02 : validation visuelle finale du produit par l’utilisateur (« je valide continue la suite »).
- [x] G02/G04 : contrôle sur appareil natif et lecteur d’écran réel retiré du périmètre le 2026-09-27; **non testé**.
- [x] G03 : parcours essentiels, import, restauration, enchaînement, météo, calendrier, récompenses et alias rejoués sur données fictives; corrections intégrées dans FUNCTIONAL-AUDIT.md.
- [x] G03 : guide, URL Activités, recherche vide et favori persistant rejoués sur une installation fictive; premier enfant/PIN et état du menu corrigés.
- [x] G04 : tests TypeScript/Jest, retour Activités → PIN → annulation sur le dernier bundle, et exports de production web/Android/iOS actuels.
- [x] G04 : essais sur appareil iOS/Android, lecteur d’écran réel, grand texte et permission système refusée retirés du périmètre par l’utilisateur; **non testés**. Les vérifications web, tests et exports restent les preuves de clôture disponibles.
- [x] G05 : option A choisie pour la routine mise en avant dans [la fiche comparative](./lots/G05/REVIEW.md).
- [x] G05 : construction explicitement autorisée après le choix A; regroupement et tri stables intégrés, tests ciblés et exports web/iOS/Android réussis.
- [x] G05 : installation fictive avec deux enfants et trois copies de routines; ordre sans favori et regroupement des deux copies observés dans l'app web.
- [x] G05 : favori activé sur la seconde copie et carte principale vérifiée dans l'app; édition, lancement du groupe, enchaînement de deux routines, ordre des participants, responsive et thèmes web contrôlés.
- [x] G05 : validation visuelle finale du produit intégré donnée explicitement le 2026-09-27; essais natifs suivis uniquement dans G04.

## Vérifications de cette intervention

2026-09-20 : TypeScript (npx tsc --noEmit) réussi; Jest : 16 suites, 109 tests réussis; git diff --check réussi avec la configuration normale du dépôt. 18 PNG enregistrés. Modifications limitées aux documents et preuves; aucun code produit changé. Le serveur local Expo a été relancé pour le tour réel.

### 2026-09-20 — Démarrage G01 demandé

Demande : « commence le travail alors ». Démarrage de la fiche et du prototype G01 conformément à la méthode. Décisions H3/N2/P1 et retour au contexte précédent relues; elles couvrent les corrections du lot, sans nouvelle direction à choisir. Aucun prototype G01 n'a encore été présenté ni validé; aucune autorisation de construction déduite de cette demande. Le prototype restera séparé du produit et n'utilisera aucune donnée ni aucun PIN réels.

### 2026-09-20 — Reprise pendant le prototype G01

Demande : « reprends la todo ». Point de reprise restitué : prototype G01 créé, vérification/captures en cours; H3/N2/P1 conservés, aucune nouvelle option validée, Parent réel toujours protégé. Poursuivre les contrôles puis présenter le lot; cette reprise ne vaut pas autorisation de construction.

### 2026-09-20 — G01 v1 prêt à examiner

Fiche : lots/G01/REVIEW.md; prototype local : lots/G01/prototype.html. H3/N2/P1 consolidés sans rouvrir trois directions. 20 rendus responsive contrôlés, captures mobile/tablette clair/sombre, erreur clavier et retour de contexte vérifiés dans le prototype. TypeScript et 109 tests réussis. Aucun code produit modifié. Prochaine action : choix explicite sur G01, puis construction seulement après autorisation; G02 reste en attente.

### 2026-09-20 — G01 autorisé puis intégré

Validation explicite « G01 — prototype validé — construction autorisée », puis demande « reprends la todo » pendant les contrôles. Intégration menu/cadre/PIN réalisée. Parent observé après déverrouillage utilisateur; recherche, Favoris, position de lecture et focus conservés au retour du PIN. 26 captures produit, TypeScript et 136 tests réussis. Réserves et prochain point de reprise dans lots/G01/integration/README.md. G02 à préparer; aucune nouvelle autorisation G01 à solliciter.

### 2026-09-20 — Reprise vers G02

Demande : « continue la todo ». G01 reste intégré avec réserves documentées, sans validation finale déduite. Préparation de G02 : accès au contenu Activités, cibles/hiérarchie, détails/filtres et corrections météo acquises; trois variantes sur le placement des outils, sans rouvrir la direction historique A + C. Aucun code produit G02 autorisé.

### 2026-09-20 — Prototype G02 prêt

Trois variantes A/B/C du placement des outils Activités, corrections communes Routines/Parent et aperçus détail/filtres. 32 rendus contrôlés, comparatifs mobile/tablette, mesures de référence produit enregistrées. A recommandée sans validation déduite. Aucun fichier produit modifié pendant cette préparation. Voir lots/G02/REVIEW.md.

### 2026-09-20 — Choix G02 A

Réponse utilisateur « a » : A — Tout à portée retenue. B/C conservées comme alternatives non retenues. Choix acquis; autorisation de construction explicite encore attendue. Aucun fichier produit modifié.

### 2026-09-20 — Correction A : grille directe

L’utilisateur demande de retirer l’activité unique mise en avant et d’afficher directement les activités en cases alignées. Prototype A corrigé; activité conservée dans la grille homogène. Anciennes propositions archivées. Contrôlé à 320/390/768/1440, aucun débordement; captures grille-a-mobile.png et grille-a-tablette.png. Aucun changement produit.

### 2026-09-20 — Prototype G02 corrigé validé

Réponse « ok valide » : validation du prototype A avec grille directe sans activité vedette. Validation graphique acquise; autorisation explicite de construction encore attendue. Aucun code produit modifié.

### 2026-09-21 — Tenue : autorisation explicite et intégration locale

Demande : « applique ces corrections sur l'app en local ». Autorisation ciblée sur les corrections tenue de cette conversation, indépendamment du périmètre G02 initial. Catalogue complet sans météo, présélection météo, grille compacte sans cartes, images seules hors sélection, pin et contour vert pâle intégrés. Aucun accord final sur l'ensemble de l'audit n'est inféré.

Contrôles produit sur origine et données isolées : 24 articles, sélection et réinitialisation avec/sans météo, largeurs 320/390/600/768, aucun débordement. TypeScript et 143 tests réussis. Cinq illustrations provisoires conservées ; contrôle natif restant. Détails et captures : page-01-routines/DECISIONS-TENUE.md et page-01-routines/integration/. Le statut des autres lots reste inchangé.

Contrôle git diff --check : espace final préexistant hors périmètre dans src/features/activities/components/FilterBar.tsx:822 ; non modifié dans ce lot.

### 2026-09-21 — Tenue sans effet : correction demandée

L'utilisateur signale que sélectionner la tenue ne change pas le bloc météo et précise « ça doit pas créer une routine ». Cause : sélection locale jetée à la fermeture, bandeau indépendant limité à quatre recommandations. Correction : validation vers les préférences persistées, bandeau affichant tous les choix, réouverture fidèle et fermeture sans validation conservant l'état appliqué. Aucun effet sur les routines. Voir DECISIONS-TENUE.md pour le détail de cette correction ciblée.

Correction tenue vérifiée sur le produit web : six choix visibles après validation, conservés après rechargement/réouverture ; annulation respectée ; données routines inchangées. 320/390/768 px sans débordement. TypeScript et 143 tests réussis. Réserve git diff --check hors périmètre : FilterBar.tsx:822. Preuves : page-01-routines/integration/apply-checks.json.

### 2026-09-25 — Reprise de la todo fonctionnelle

Demande : « Reprend le travail ». G02 demeure autorisé et construit; aucune validation finale n’est déduite. Reprise des essais sur données fictives déjà effectués : Activités, Parent/PIN, Famille, création/catalogue, gestion et import de routines, calendrier, récompenses, exécution/enchaînement, météo/tenue, corbeille/restauration et routes historiques. Détails et limites dans FUNCTIONAL-AUDIT.md.

Dernières corrections : paramètres d’URL Activités retirés à la fermeture; guide de démarrage de nouveau accessible depuis Réglages Parent. TypeScript strict réussi, 19 suites et 146 tests réussis. Le navigateur intégré ne présentait plus de surface disponible lors de cette reprise; les nouveaux clics et mesures responsive restent ouverts. Aucun contrôle natif ni validation visuelle finale annoncé.

### 2026-09-25 — Suite demandée

Demande : « Continue la todo ». Relecture de la méthode et de la fiche G02; sa checklist reflète maintenant l’intégration et les parcours Activités effectivement rejoués. Le guide de démarrage utilise les couleurs du thème actif, y compris sombre. Vérification du code du routeur : les paramètres `undefined` sont omis dans l’URL générée; le comportement final dans l’interface reste à rejouer. TypeScript strict réussi. Le navigateur intégré n’expose toujours aucune app ni aucun onglet (`apps: [], browsers: []`); la matrice responsive et les nouveaux clics restent ouverts, sans validation inférée.

### 2026-09-25 — Demande de clôture de la todo

Demande : « Termine cette todo ». Les exports de production web, Android et iOS réussissent; TypeScript strict et 146 tests réussissent. Le guide utilise une couleur de bouton lisible dans les deux thèmes. Les répertoires temporaires des exports natifs ont été supprimés après vérification. L’interface de contrôle ne présente toujours aucun navigateur ni appareil (`apps: [], browsers: []`), même après tentative d’ouverture d’un onglet isolé. La vérification réelle des derniers clics, du responsive produit et des interactions natives reste donc ouverte. Un navigateur intégré a été demandé pour terminer ces preuves; aucune case n’est cochée sur la seule base d’un export.

### 2026-09-25 — Navigateur revenu, clôture des contrôles web

Réponse utilisateur : « ok termine la todo tu peux maintenant ? ». L’origine `localhost.:8081` a permis une installation fictive indépendante des données familiales. Guide Parent, URL Activités, état vide, favori persistant, premier enfant, annulation du PIN, focus/Échap et grille directe ont été rejoués. Les trois destinations ont été mesurées à 320/390/768/1440, clair/sombre à 390/768; aucun débordement horizontal. Corrections supplémentaires : deux cibles Parent agrandies à 44 px et carte conseil compactée, retour PIN nettoyé des paramètres internes, menu Parent verrouillé après premier enfant sans PIN, niveaux de titres accessibles. TypeScript, 147 tests et contrôle git diff réussis après ces corrections. Les parcours nécessitant la création d’un nouveau PIN et les essais iOS/Android sur appareil restent hors des preuves web. Validation finale du rendu par l’utilisateur non inférée.

### 2026-09-25 — Validation visuelle G02 et suite G03/G04

Réponse utilisateur « je valide continue la suite » à la question explicite sur le rendu G02 intégré. Validation visuelle finale G02 acquise; essais natifs G04 et réserve G01 distincte non déduits. Le guide Parent relie maintenant l’ouverture et la fin aux indicateurs locaux déjà stockés, avec libellé « Découvrir » au premier accès puis « Revoir ». Test de la différence fermeture/fin ajouté. TypeScript strict, 19 suites et 148 tests réussis; `git diff --check` réussi. Aucun appareil n’est exposé par le navigateur intégré et ni `adb` ni l’émulateur Android ne sont installés dans le PATH; l’export Android/iOS réussi reste un contrôle de compilation, pas une validation tactile ou lecteur d’écran.

### 2026-09-25 — Suite G04 : écran Météo

Revue ciblée du repli météo après permission refusée et du format étroit. À 320 px, les cartes de réglage imposaient 280–290 px de largeur minimale dans un contenu de 272 px : elles passent maintenant sur une colonne sans minimum forcé. L’action « Choisir une ville » dans l’erreur de localisation dispose d’une cible d’au moins 44 px. TypeScript strict, 19 suites et 148 tests réussis; `git diff --check` réussi. La géolocalisation refusée et le rendu natif restent à rejouer sur appareil; la revue du code ne vaut pas essai système.

### 2026-09-25 — Validation des dernières corrections

Réponse utilisateur « je valide » après la présentation de la correction responsive et de la cible tactile de l’écran Météo. Validation de ces corrections enregistrée. Elle ne constitue pas une observation du refus de permission sur appareil, ni une validation implicite de la réserve finale G01 ou de l’ensemble des essais G04.

### 2026-09-26 — Reprise de G04, position indisponible

Demande : « continue la todo ». La revue du repli météo a révélé qu’une permission accordée suivie d’un échec de lecture de la position pouvait interroger Paris silencieusement. L’échec produit désormais un état « Position indisponible » avec action « Choisir une ville »; le refus de permission conserve son message distinct. Un échec du géocodage inverse n’annule plus une position déjà obtenue; le lieu s’affiche alors comme « Ma position ». Trois tests vérifient le refus, l’échec de position et le géocodage inverse indisponible. TypeScript strict, 20 suites et 151 tests réussis; `git diff --check` réussi. Aucun `adb` ou émulateur dans le PATH; permission système, grand texte, lecteur d’écran, retour natif et validation G01 restent ouverts sur appareil.

### 2026-09-26 — Suite G04, validation de la ville

Demande : « continue la todo ». Revue du réglage Météo : la ville saisie était persistée avant la réponse réseau, même si elle était introuvable; une actualisation ignorée pendant un chargement pouvait aussi produire un toast de réussite. La ville n’est désormais enregistrée qu’après une actualisation réussie. Le store distingue réussite, échec et actualisation ignorée; deux tests ciblés vérifient ce contrat. TypeScript strict, 21 suites et 153 tests réussis; `git diff --check` réussi. Les scénarios de permission et d’accessibilité native restent non vérifiés sur appareil.

### 2026-09-26 — Clôture maximale des preuves disponibles

Demande : « essaie de cloturer un max pour passer a la suite ». Sur l’origine fictive `localhost.:8081`, le dernier bundle confirme Activités avec recherche « yoga » → Parent verrouillé → PIN → Annuler → Activités avec recherche conservée et focus rendu à Parent. L’origine porte déjà un PIN de test, qui n’a pas été saisi ni modifié. Une seconde origine de navigateur n’a pas été accessible; aucun nouveau parcours Parent/Météo n’est donc annoncé. La commande de viewport du navigateur n’a pas changé sa taille effective, et ne fournit aucune nouvelle preuve responsive; les mesures précédentes restent la référence. L’export de production web puis les exports Android et iOS du code actuel ont réussi. Les dossiers temporaires des exports natifs ont été supprimés après vérification de leur chemin. Les exports prouvent la compilation, pas les interactions sur appareil. Restent uniquement les contrôles système natifs (permission, retour, grand texte, lecteur d’écran, PIN) et la validation visuelle finale distincte de G01; les choix E17/V3 restent suspendus hors de cette clôture.

### 2026-09-26 — Suite G04, noms accessibles de Météo

Demande : « ok continue ». Aucun appareil ni émulateur n’est disponible. Revue ciblée de l’écran Météo : la ville et la localisation ont maintenant un nom accessible explicite; les interrupteurs de sieste et commandes horaires incluent le jour, et l’enfant sélectionné expose son état. TypeScript strict, 21 suites et 153 tests réussis; `git diff --check` réussi. Contrôle lecteur d’écran réel encore ouvert; cette vérification de code ne le remplace pas. E17/V3 reste suspendu sans validation ni autorisation de construction.

### 2026-09-26 — Requêtes météo concurrentes

Demande : « continue et cloture un max de todo ». Un chargement météo vieux de plus de 12 secondes autorisait une nouvelle tentative; son résultat tardif pouvait ensuite écraser le nouveau lieu. Le store ignore maintenant les résultats et erreurs des tentatives dépassées. Test avec deux réponses inversées : Rennes reste affichée et l’ancienne tentative ne signale pas de succès. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi. Cette correction clôt le risque de concurrence observé dans le code, pas les essais de réseau ou de permission sur appareil.

Les exports de production web, Android et iOS ont ensuite été relancés avec cette correction et ont réussi. Les répertoires temporaires natifs ont été supprimés après contrôle de leurs chemins; le résultat reste une preuve de compilation uniquement.

### 2026-09-26 — Suite G01/G04 : état du verrou au démarrage

Demande : « ok continue la todo ». Cette réponse de poursuite n’est pas comptée comme validation visuelle finale de G01. Le menu commun attend maintenant l’hydratation du store du PIN comme celle des enfants avant d’annoncer Parent déverrouillé, ce qui évite un état transitoire trompeur au démarrage. Sur l’origine fictive `localhost.:8081`, Parent est annoncé « verrouillé » après rechargement. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi. Ce contrôle ne remplace pas une observation frame par frame avant hydratation ni un essai natif. Les exports mentionnés plus haut précèdent cette dernière correction mineure.

### 2026-09-26 — Réduction des animations au démarrage

La préférence de mouvement réduit est lue de façon asynchrone. Le hook partagé part désormais de l’état prudent « mouvement réduit » jusqu’à la réponse du système et conserve cet état si la lecture échoue; ceci évite d’animer brièvement avant de connaître la préférence. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi. Le résultat visuel et la préférence système réelle restent à contrôler sur appareil.

### 2026-09-26 — Reprise E17 et correction du statut

Demande : « continue la todo ». La fiche tenue consignait déjà l'autorisation explicite « applique ces corrections sur l'app en local » du 2026-09-21, l'intégration de la grille de 24 articles et la correction qui applique la sélection au bandeau météo sans créer de routine. Plusieurs résumés continuaient pourtant à annoncer « aucune construction autorisée ». Le point actuel est corrigé dans MASTER, la fiche E17, son inventaire, son journal et sa todo graphique; les textes datés du 2026-09-20 restent historiques. E17 n'est pas clos : cinq illustrations sont provisoires, le rendu final de V3 n'a pas de validation explicite et les essais natifs/lecteur d'écran réel restent à faire. Aucun nouveau choix visuel n'est inféré de cette demande. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi.

### 2026-09-26 — Cinq illustrations E17 remplacées

Demande : « continue la todo ». Le sélecteur et le bandeau affichaient encore des emoji pour veste légère, imperméable, sandales, bouteille et maillot; les cinq PNG provisoires présents sur disque ne correspondaient pas aux objets. Cinq illustrations dédiées, transparentes et de style cohérent avec le catalogue ont été générées puis enregistrées sans écraser les anciens fichiers. `OutfitImage` emploie désormais `ClothingIcon` pour ces articles comme pour les autres. Fichiers et transparence inspectés; TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` et export web de production réussis. Le dossier temporaire de l'export a été retiré après vérification de son chemin. Rendu interactif dans l'app, validation visuelle finale de V3 et essais natifs non encore vérifiés.

### 2026-09-26 — Contrôle interactif E17 sur le dernier bundle

Demande : « ok continue ». Le navigateur affichait d'abord l'ancien bundle avec les emoji; le serveur local a été relancé sur le code actuel. Après rechargement de `localhost.:8081/routines`, le panneau Tenue montre les cinq nouvelles images parmi les 24 articles. Sur l'origine de test, le maillot a été sélectionné, appliqué et observé dans le bandeau météo; la sélection initiale a ensuite été restaurée. Le rendu web de ces images et cette interaction sont vérifiés. La validation visuelle finale par l'utilisateur, l'accessibilité sur lecteur d'écran et les essais natifs restent ouverts.

### 2026-09-26 — Libellé du compteur de tenue

Demande : « continue la todo ». Le texte du compteur était rendu par fragments (« 9 sélectionné s »). Il est désormais construit comme une chaîne unique avec le nom « article » : « 0 article sélectionné », « 1 article sélectionné », « 9 articles sélectionnés ». Les trois états ont été contrôlés dans l'app web sur l'origine fictive; à zéro, « Tenue prête » est désactivé. Le brouillon a été annulé puis la sélection initiale de neuf articles a été retrouvée. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi. Cela ne vaut pas validation visuelle finale de E17 ni essai natif.

### 2026-09-26 — Clavier des cases de tenue

Demande : « continue la todo ». Sur l'origine fictive, une case de tenue annoncée comme checkbox réagissait à Entrée mais pas à Espace. `TouchableOpacity` remplaçait le gestionnaire clavier ajouté; la case utilise désormais `Pressable` et traite Espace explicitement sur web, tout en conservant le retour visuel à la pression. Sélection puis désélection avec Espace, activation avec Entrée et fermeture sans enregistrer par Échap observées dans l'app. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi. Le lecteur d'écran et les interactions natives restent à tester sur appareil.

### 2026-09-26 — Exports natifs du code actuel

Demande : « continue la todo ». Après les nouvelles illustrations et la correction clavier, les exports web, Android et iOS ont réussi. Le premier essai Android dans le bac à sable s'est arrêté au lancement de Hermes (`spawn EPERM`); la relance dans un contexte autorisé a abouti. Les cinq nouvelles images ont été retrouvées dans chacun des deux exports natifs par leur empreinte MD5. Les dossiers temporaires ont été supprimés après contrôle de leurs chemins. Aucun `adb` ni émulateur dans le PATH : ces exports prouvent la compilation et l'inclusion des ressources, pas le rendu ou les interactions sur appareil.

### 2026-09-26 — États accessibles et thèmes de la tenue

Demande : « continue la todo ». Dans React Native 0.83 du projet, `View` convertit `aria-checked` vers `accessibilityState.checked` pour le natif; le rôle et l'état de chaque case E17 sont donc fournis sans ajouter de second état. Sur le jeu fictif web, le panneau et les cinq nouvelles illustrations ont été inspectés en thème clair puis sombre; les objets, les contours sélectionnés et les commandes restent lisibles. Le thème sombre initial a été rétabli. Cette inspection et la lecture du contrat natif ne remplacent pas un essai VoiceOver/TalkBack ni la validation visuelle finale par l'utilisateur.

### 2026-09-26 — Colonnes de la grille tenue aux seuils responsive

Demande : « continue la todo ». Une mesure réelle à 320 px a révélé que les deux cases calculées à partir de `onLayout` dépassaient le conteneur de moins d'un pixel à cause d'un arrondi; la grille se repliait alors en une seule colonne malgré la règle prévue. La largeur des cases est maintenant arrondie vers le bas avec une marge d'un pixel. Mesures du dernier bundle sur l'origine fictive : 2 colonnes à 320 px, 3 à 390 px, 4 à 600 px et 3 dans le panneau latéral à 768 px; `document.scrollWidth` égale la largeur du viewport à chaque point. Le pied et ses actions restent visibles à 320 px. Taille du navigateur rétablie ensuite. TypeScript strict, 21 suites et 154 tests réussis; `git diff --check` réussi. Les anciens contrôles responsive précédaient cette mesure de l'arrondi et ne suffisaient pas à établir les deux colonnes effectives à 320 px.

### 2026-09-26 — Exports finaux après correction responsive

Demande : « continue la todo ». Les exports de production web, Android et iOS du code actuel ont réussi après la correction d'arrondi de la grille. Les dossiers temporaires ont été retirés après vérification de leur chemin. Aucun appareil ou émulateur n'était disponible; cela clôt la vérification de compilation, sans valider l'interaction native. G01 attend toujours sa validation visuelle finale explicite; E17/V3 attend la sienne ainsi que les essais natifs/lecteur d'écran réel. Aucun de ces accords n'est inféré de « continue la todo ».

### 2026-09-26 — Validations visuelles finales G01 et E17/V3

Deux questions distinctes ont été soumises à l'utilisateur : validation visuelle finale du menu commun et du parcours Parent/PIN pour G01, puis de la grille Tenue V3 sur Routines pour E17. Sa réponse directe « je valide continue » valide ces deux rendus. Ces accords clôturent les réserves visuelles correspondantes et n'attestent pas des essais iOS/Android, de VoiceOver/TalkBack, du grand texte, des permissions système ni du retour natif. Prochaine action : avancer sur les points encore vérifiables sans appareil, puis organiser les contrôles natifs restants.

### 2026-09-26 — G05 : priorité de la routine mise en avant, diagnostic et choix

Après clôture visuelle de G01 et E17, reprise du point P01-E18 dans le cadre global. Lecture du code : le groupe de copies identiques hérite du favori de sa première copie seulement, et le tri par `updatedAt` peut modifier la carte principale après une simple édition. Le modèle ne dispose pas d'horaire de routine. Trois règles comparables sont documentées dans [G05/REVIEW.md](./lots/G05/REVIEW.md), avec maquettes et PNG mobile/grand écran. A — favoris cohérents puis ordre stable — est recommandée; B ajoute une épingle parentale, C infère un moment depuis la catégorie. Diagnostic de code, non reproduit en UI; aucun choix utilisateur ni autorisation de construire G05 à ce stade. G04 natif reste indépendant.

### 2026-09-26 — G05 : option A choisie

Après présentation des trois maquettes G05, l'utilisateur répond « a ». L'option A est décidée : statut favori calculé sur toutes les copies d'un groupe, favoris en premier et ordre de création stable au sein de chaque statut. La réponse ne formule ni validation explicite du prototype ni autorisation de construction pour G05. La fiche du lot précise les cas de vérification; aucun code produit n'a été changé à cette étape.

### 2026-09-26 — G04 : annonce du menu corrigée

Demande : « continue la todo ». Sur le dernier bundle web, l'arbre d'accessibilité annonçait les trois destinations comme cases à cocher. La cause était `aria-pressed` sur les boutons de navigation. Cet attribut a été remplacé par `aria-current="page"` sur la destination active. Après rechargement, les trois éléments sont annoncés comme boutons; Routines → Activités → Routines change correctement l'attribut courant. TypeScript strict réussi. Contrôle avec lecteur d'écran réel et sur appareil toujours ouvert.

### 2026-09-26 — G05 : construction autorisée et intégrée

Demande : « tu peux construire et valider tout et termine au maximum la todo ». Cette autorisation explicite porte sur le lot G05 après le choix A. Le regroupement utilise le favori de n'importe quelle copie et un ordre de création stable; la carte principale expose le motif Favori. Les tests ciblés passent avec TypeScript et 157 tests au total. Exports web/iOS/Android réussis après une relance hors du bac à sable pour Hermes (`spawn EPERM` au premier essai). L'app web sur l'origine de test n'avait aucune routine; Créer a ouvert le PIN, puis l'accès a été annulé sans saisie. Le rendu avec routines peuplées n'est donc pas attesté et le PIN n'a pas été contourné. Les essais natifs et la validation visuelle du produit G05 restent ouverts.

### 2026-09-27 — Installation G05 isolée et arrêt au PIN

Demande : « termine tout ». L'ancien serveur local était arrêté; il a été relancé après `spawn EPERM` lié à l'ouverture automatique du navigateur. Une nouvelle origine `127.0.0.1:8081`, distincte de l'origine familiale et des essais précédents, a été ouverte. Profil fictif « Audit G05 » et enfant « Lina Test » créés par l'interface; le premier enfant déclenche l'écran « Créez votre code ». L'onglet est laissé visible sur cet écran pour que l'utilisateur saisisse et confirme lui-même le nouveau PIN. Aucune tentative de code ni contournement. Les tests TypeScript/Jest (157 tests) et `git diff --check` réussissent. `adb`, l'émulateur, le SDK et Android Studio ne sont pas présents dans les chemins usuels; aucun contrôle sur appareil n'a pu être effectué.

### 2026-09-27 — G05 : données fictives peuplées et ordre initial vérifié

L’utilisateur a créé le PIN dans l’onglet de test, puis l’agent a créé « Retour G05 » pour Lina, ajouté « Noé Test », et créé « Matin G05 » pour les deux enfants depuis le catalogue. Dans l’app, les trois copies se résument à deux cartes; sans favori, la plus ancienne « Retour G05 » est principale et « Matin G05 » affiche les deux participants. Le retour à Routines verrouille de nouveau Parent; la gestion demande le code existant. L’onglet est laissé sur cet écran pour que l’utilisateur le saisisse. Le favori porté uniquement par la seconde copie et son effet sur la carte restent non observés.

### 2026-09-27 — G05 : favori groupé, édition et rendu final web

L’utilisateur a déverrouillé le profil fictif et autorisé l’usage de son PIN de test. Favori activé seulement pour « Matin G05 » de Noé : le groupe commun devient la carte principale avec « FAVORI »; « Retour G05 » reste dans la liste. Une édition de sa description ne modifie pas la priorité. Lancer le groupe ouvre la préparation avec Lina et Noé déjà sélectionnés; retour sans exécution. Contrôles à 320/390/768 px sans débordement, clair/sombre à 390 px. L’ordre des prénoms de la carte ne correspondait pas à celui de la préparation; il suit maintenant l’ordre de la famille et le dernier bundle affiche « Lina Test, Noé Test ». TypeScript strict, 22 suites/158 tests, exports de production web/Android/iOS et `git diff --check` réussis. Validation visuelle finale utilisateur et essais natifs toujours ouverts.

### 2026-09-27 — G05 : enchaînement du groupe favori

Demande : « continue la todo ». Sur le jeu fictif web, Enchaîner présélectionne le groupe « Matin G05 ». La commande de préparation est désactivée avec une seule routine; « Retour G05 » sélectionnée en deuxième position active « Préparer 2 routines ». L’écran de préparation présente les deux routines dans cet ordre, 12 étapes/32 minutes et Lina/Noé sélectionnés. Le panneau précédent disparaît après la transition; retour à l’accueil sans lancer l’exécution. Aucun nouvel accord visuel de l’utilisateur n’est inféré de « continue la todo ».

### 2026-09-27 — G05 : validation visuelle finale

Après les contrôles du rendu intégré, l’utilisateur répond « je valide et continue la todo ». Cette réponse donne la validation visuelle finale de G05. Les essais G04 sur appareil restent indépendants; aucune interaction iOS/Android n’est déduite de cette validation.

### 2026-09-27 — G05 : correction du clavier dans Enchaîner

Après validation visuelle, un contrôle au clavier sur l’origine fictive révèle qu’Entrée sélectionne une routine dans le panneau Enchaîner, mais qu’Espace ne le fait pas. La ligne de sélection a été corrigée : Espace ajoute et retire désormais « Retour G05 », avec état de case et disponibilité de l’action Préparer mis à jour. TypeScript strict, 22 suites/158 tests, export web/iOS/Android et `git diff --check` réussissent. Aucun essai natif ou avec lecteur d’écran réel n’est déduit de ces résultats.

### 2026-09-27 — Clôture du périmètre vérifiable sans appareil

Demande : « ignore les test ios android je pourrais pas le faire continue la todo ». Les contrôles G01/G02/G04 qui exigeaient un appareil iOS ou Android, un lecteur d’écran réel, le grand texte système ou une permission système refusée sont retirés du périmètre de clôture. Ils ne sont **ni effectués ni validés**; les exports natifs établissent seulement la compilation. G01, G02, G03, G05 et les contrôles web de G04 sont terminés selon les preuves ci-dessus. Aucun nouveau lot ni choix graphique n’est ouvert dans la todo globale active.

### 2026-09-27 — Validation finale et fermeture de la todo

Demande explicite : « valide tout et termine ». L’utilisateur valide le résultat global et demande la fermeture du chantier. Aucun élément actif ne reste dans la todo priorisée du périmètre convenu. Cette validation confirme les résultats web et code livrés; elle ne transforme pas les essais sur appareil et avec lecteur d’écran réel, précédemment écartés, en essais effectués. Les limites historiques et le protocole facultatif ci-dessous sont conservés pour traçabilité.

### 2026-09-27 — Nouveau lot G06 : lancement et routine en cours

Demande : « reprends les lancement de routine et l'afichage des routines en cours avec le timer et tout; reprend la méthodo ». Nouveau périmètre G06, distinct de la todo globale clôturée. Lecture de la méthode, des décisions d’exécution PAGE-03 et de l’identité visuelle. Sur une origine fictive isolée (`127.0.0.1:8095`), lancement complet jusqu’à l’écran en cours : une étape avec minimum 1 minute affiche 0:45, puis environ 0:57 après rechargement; l’exécution reste mais le minuteur repart. À 390 px, l’écran ne rappelle pas le nom de la routine; « Parent » n’apparaît pas comme bouton dans l’arbre d’accessibilité. Le code confirme un minuteur local à l’écran, une estimation de fin calculée avec la durée entière de l’étape et une ouverture des actions parentales par appui long. Trois options de hiérarchie et un prototype HTML sont documentés dans [G06/REVIEW.md](./lots/G06/REVIEW.md). L’ouverture du prototype local dans le navigateur automatisé a été refusée par sa politique de sécurité; aucun PNG comparatif n’est donc revendiqué et aucun choix graphique n’est demandé à ce stade. Aucun code produit G06 modifié ni autorisé.

### 2026-09-27 — G06 : construction autorisée, minuteur et écran en cours corrigés

L’utilisateur répond « j'autorise continue » à la présentation de G06. La direction A recommandée est intégrée : nom de routine sur l’écran en cours, minuteur à échéance persistée dans l’exécution, pause et reprise conservées, estimation horaire incertaine retirée. « Parent » est un bouton ouvrant un panneau avec fermeture et actions nommées; la mise en page à 768 px donne toute sa largeur aux enfants. Sur jeux fictifs web séparés, le décompte ne repart plus après rechargement, la pause à 0:45 reste à 0:45 après rechargement et peut reprendre; l’étape suivante sans durée n’affiche pas l’ancien minuteur. Contrôles visuels 320/390/768 et clavier réalisés. TypeScript strict et 23 suites/160 tests réussissent. La validation visuelle finale de l’utilisateur n’est pas inférée de cette autorisation; thèmes, contenu long et chaîne minutée restent à contrôler.

Suite G06 : un nom de routine long en thème sombre a été contrôlé à 390 et 320 px sur une troisième origine isolée. Le texte apparaît sur plusieurs lignes sans cacher le minuteur ni la validation. À 768 px, la disposition en une colonne remplace les cartes enfants comprimées. Le calcul du temps restant a aussi été borné à la durée de départ pour éviter un affichage transitoire « 1:01 » sur un minuteur d’une minute. Ces observations complètent thème et contenu long; la chaîne minutée et la validation visuelle finale restent ouvertes.

Suite G06 : l’enchaînement d’une routine à minuteur avec une routine sans durée a révélé un accès transitoire à `stepTimer` quand l’exécution précédente se ferme. Une garde sur l’exécution courante corrige cette erreur; le parcours fictif a ensuite été rejoué jusqu’à la célébration de la seconde routine, sans retour intempestif à Routines. TypeScript strict, 23 suites/160 tests et `git diff --check` passent. La validation visuelle finale de l’utilisateur reste ouverte; aucun essai sur appareil n’est revendiqué.

Reprise G06 : l’utilisateur signale que `/child/run` n’affiche plus les étapes ni le minuteur. Analyse du code : la redirection pouvait partir avant la réhydratation du store, et le filtrage des étapes en humeur difficile pouvait produire une liste vide, notamment pour une routine entièrement facultative. Le correctif attend la réhydratation et garantit qu’une routine contenant des étapes conserve un déroulé affichable. Aucun changement de données familiales; contrôle visuel local limité par le refus de l’origine de test dans le navigateur automatisé. Voir [G06/REVIEW.md](./lots/G06/REVIEW.md).

Retour utilisateur : le problème persiste après ce premier correctif. Sur l’URL Vercel fournie, l’ouverture directe de `/child/run` reproduit `ReferenceError: process is not defined` dans `react-native-worklets/platformChecker`. L’écran de préparation reste sur `/child/summary`, donc l’erreur du bundle web est la cause confirmée à corriger. L’entrée de l’app fournit `process.env` au navigateur avant de charger Expo Router; build web, TypeScript et 163 tests réussissent. Un profil de test local a été créé dans le navigateur isolé de Codex; la création d’un enfant fictif sur cette origine Vercel a ensuite été refusée par la revue automatique et n’a pas eu lieu. Les données familiales du navigateur de l’utilisateur n’ont pas été touchées.

Après déploiement du commit `9da0933`, le bundle de production a changé et l’ouverture directe de `/child/run` ne produit plus `process is not defined`; sans exécution locale dans le navigateur isolé, la route revient à Routines. Cette observation confirme le chargement du module corrigé, pas encore le parcours complet avec les données de l’utilisateur. Sa vérification est demandée séparément.

## Protocole sur appareil écarté du périmètre (non testé)

### 2026-09-27 — G08 : trois exemples et contrôle responsive final

Demande : ajouter la vérification responsive en fin de toutes les todos d'écran, commencer G08 et générer trois exemples. La méthode active et la fiche G08 imposent maintenant ce contrôle final à 320/390/768/1440 px, avec thème, contenu long, défilement, clavier et cible tactile selon l'écran. Pour le choix d'icône de routine/étape, trois maquettes comparables mobile/tablette sont préparées : A, panneau par catégories (recommandé); B, grille dans le formulaire; C, recherche et récents. Les trois PNG et le prototype HTML se trouvent dans [G08](./lots/G08/REVIEW.md). Ces visuels sont des propositions et non des captures du produit ni une validation du rendu sur la tablette de l'utilisateur. Aucun code produit G08 n'a été modifié; choix et autorisation de construire restent ouverts.

### 2026-09-27 — G08 : option C choisie

L'utilisateur répond « c » à la comparaison des trois maquettes. Le choix de conception G08-01/02 est **C — recherche, récents et catégories complètes**. Ce choix ne vaut pas validation explicite du prototype ni autorisation de construction selon la méthode du dépôt; le code produit reste inchangé. La fiche G08 précise les états et les vérifications requis pour l'intégration ultérieure.

### 2026-09-29 — G08 : construction du premier groupe

L'utilisateur répond « je valide CONTINUE la todo » : le prototype C est validé et la construction G08 autorisée. Les choix d'icônes de routine et d'étape utilisent désormais une recherche en français, des récents locaux et toutes les catégories; le symbole hérité reste visible. Les 16 avatars locaux sont affichés dans Famille. `OpenMoji` montre un émoji natif pendant le chargement de l'image et repart correctement sur une nouvelle valeur. TypeScript strict, 27 suites/172 tests Jest, export web et `git diff --check` passent. Sur l'origine locale de contrôle, le PIN `0000` associé à un autre profil de test est incorrect : aucun autre code n'a été essayé et aucun profil n'a été modifié. Le parcours visuel complet, le responsive final et les autres emplacements G08 restent ouverts; aucun résultat de tablette réelle n'est revendiqué.

### 2026-09-29 — G08 : calendrier Parent

Demande : « continue la todo ». Le même sélecteur C est partagé avec le formulaire de repère Parent, qui n'expose plus seulement huit icônes. Les deux icônes historiques absentes de la bibliothèque (`🎂`, `🩺`) y sont ajoutées. L'éditeur et le dialogue d'icônes sont frères : l'éditeur revient avec ses champs inchangés après sélection ou fermeture. Ce comportement est établi par le code, pas encore par un parcours UI déverrouillé. TypeScript strict, 27 suites/172 tests Jest, export web et `git diff --check` passent. Le responsive final reste à faire après les autres tâches de l'écran.

### 2026-09-29 — G08 : repli des images d'étape et de tenue

Demande : « continue la todo ». Une URI d'image d'étape importée pouvait laisser une zone vide sur `/child/run`; elle affiche maintenant l'icône de l'étape pendant le chargement et un message lisible en cas d'erreur. Les PNG de tenue gardent un émoji correspondant pendant le chargement et après une erreur. Le composant `Avatar` a été relu : ses trois formats restent pris en charge dans le code. Ces corrections ne constituent pas encore une observation sur les pages; import invalide, rendu des vêtements, ancien avatar et responsive final sont à rejouer sur une famille fictive isolée. Aucun ajout de photo dans le constructeur n'a été décidé.

TypeScript strict, 27 suites/172 tests Jest et export web réussissent. Le navigateur automatisé a refusé l'origine locale `127.0.0.1:8096`, puis l'adresse serveur `localhost:8096` (`ERR_BLOCKED_BY_CLIENT`); il n'y a donc pas de nouvelle preuve visuelle pour Routines ou Activités sur cette compilation. La limite est notée sans déclarer ces écrans vérifiés.

### 2026-09-29 — G08 : icônes cohérentes entre pages

Demande : « continue la todo ». Le code montre que la même icône de routine ou de repère passait d'`OpenMoji` à l'émoji système entre les cartes, `/child/run`, la liste Parent du calendrier et la semaine enfant. Ces trois derniers affichages utilisent maintenant le composant partagé avec repli immédiat, sans changer les valeurs enregistrées. Les activités gardent leurs vignettes natives fixes; aucun problème nouveau n'a été observé sur une capture. La cohérence visuelle réelle, le contenu long et le responsive final restent à contrôler sur un navigateur de test accessible.

Le premier enfant conserve l'avatar et la couleur par défaut pour préserver le parcours G07 court. Le texte de l'onboarding annonce leur modification ultérieure; les 16 illustrations sont maintenant proposées dans Famille. Cette décision est issue des parcours déjà acquis et de la lecture du code, pas d'une nouvelle observation visuelle. Les vignettes Activités, humeurs, badges et icônes d'actions restent à contrôler sur les écrans; aucune anomalie supplémentaire n'est déduite du seul inventaire.


À exécuter sur installation isolée iOS et Android, sans données familiales :

1. Premier enfant → création du PIN par l’utilisateur; verrou Parent, annulation puis retour système depuis Activités et une sous-page Parent.
2. Barre des trois destinations, retour et focus; VoiceOver/TalkBack, grand texte et réduction des animations, avec libellés/états des commandes.
3. Panneau Tenue E17 : ouverture, sélection des cases, application, fermeture et rendu des images dans les deux thèmes.
4. Permissions météo refusées et position indisponible : message clair et choix manuel de ville, sans valeur de substitution silencieuse.
5. G05 : favori sur une seule des deux copies, carte principale, lancement avec les deux enfants et retour; reprise d'une routine interrompue devant la carte.

Les exports natifs réussis établissent la compilation et l'inclusion des ressources, pas ces interactions. Aucun appareil/émulateur/SDK Android n'était disponible sur cet hôte au dernier contrôle. L’utilisateur a demandé le 2026-09-27 d’ignorer ces essais pour cette todo; ce protocole est conservé comme limite de couverture, sans tâche active ni résultat inventé. La validation visuelle finale G05 par l'utilisateur reste indépendante de ce protocole.
