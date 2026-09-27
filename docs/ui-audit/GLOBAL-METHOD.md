# Amélioration globale de Routine

Méthode active depuis le 2026-09-20, à la demande de l'utilisateur. Elle remplace la progression obligatoire page par page et élément par élément. Les anciennes décisions et propositions restent conservées.

## Objectif

Auditer ce qui existe puis améliorer globalement les pages Routines, Activités et Parent, en priorité la navigation. Corriger les problèmes observés et réutiliser les composants existants. Préserver les fonctions, les données locales, les routes historiques et les trois intentions principales.

## Version opérationnelle — complète mais rapide

Renforcement du 2026-09-20 : la montée en qualité vise la clarté, la fiabilité et la finition de l'app, sans ajouter des fonctions pour donner une impression de nouveauté. Le rythme est limité par les preuves nécessaires, pas par une revue de chaque pixel.

| Passage | Travail | Livrable / arrêt |
|---|---|---|
| 1. Couvrir | Inventaire routes, fonctions visibles/cachées, stores, documents et décisions | Chaque route rattachée à une surface; aucune fonction ancienne supprimée implicitement |
| 2. Observer | Tour réel des intentions et scénarios à risque; comparer aux décisions | Bilan unique, preuves datées, priorités et limites explicites |
| 3. Choisir | Préparer le prochain lot avec 3 à 5 résultats utilisateur maximum | Un prototype transversal; trois variantes seulement pour un choix structurant réellement ouvert |
| 4. Réaliser | Après autorisation du lot, corriger la cause dans les composants partagés | Petits changements réversibles, sans refonte technique opportuniste |
| 5. Vérifier | Parcours critiques, formats concernés, tests; comparaison avant/après | Critères atteints, réserves tracées, validation visuelle du lot |

**Règles de vitesse :** une seule liste de problèmes; une fiche par lot; une preuve réutilisable pour une cause commune; aucun nouveau débat sur un choix déjà explicite; aucune nouvelle capture inchangée sans motif. Les finitions P3 passent après les obstacles P0/P1. Si un lot exige plus de cinq décisions indépendantes, le diviser. Ne pas multiplier les documents par bouton.

Budget indicatif pour la préparation d'un lot : 10 minutes de reprise, 30–45 minutes d'observation ciblée, 15 minutes de synthèse avant prototypage. Ce sont des points de contrôle, pas une permission de déclarer vérifié ce qui ne l'est pas. À l'échéance, consigner les inconnues et poursuivre celles qui conditionnent la décision. Regrouper les questions indispensables en une fois.

## Couverture obligatoire sans combinatoire inutile

La matrice `GLOBAL-COVERAGE.md` rattache les 39 routes actuelles aux surfaces. La mettre à jour si une route apparaît/disparaît. Distinguer route, alias, état et fonction non reliée à une route. Le nombre de routes ne mesure pas la complexité réellement vue par la famille.

Vérifier également les fonctions sans page propre : profil local/tutoriel, thèmes, météo et permissions, tenue, enchaînement, partage/impression/export, import, corbeille/restauration/expiration, attribution d'étoiles/badges/récompenses, feedback et installation web. Chercher leurs appels réels : un fichier présent ne garantit pas une fonction accessible.

Jeux de données : installation vide; famille avec un enfant et une routine; plusieurs enfants et routines; titres longs/listes importantes; exécution interrompue; événement sans lien ou passé; météo absente/périmée; import invalide. Utiliser des données de test isolées pour les écritures. Ne pas terminer une routine réelle, attribuer des étoiles, supprimer des données ou changer un PIN pour les besoins de l'audit. Ne jamais contourner une protection pour compléter une case.

Matrice minimale : les trois destinations à 390 et 768 px dans les deux thèmes; 320 et 1440 px pour les limites de mise en page. Chaque panneau partagé reçoit une vérification clavier/focus/fermeture et un exemple de contenu long; les autres usages ont un contrôle ciblé des différences. Les états métier risqués sont rejoués sur la surface concernée, sans croiser artificiellement tous les états et toutes les tailles.

Contrôles techniques liés à l'usage : hydratation/persistance après relance, reprise après arrière-plan, liens directs/identifiants invalides, défilement des grandes listes, erreurs réseau et permission refusée, cohérence des dates/fuseaux, absence de double attribution et restauration des données. Mesurer les lenteurs réellement observées; une compilation de développement ne représente pas les performances de production. Ne pas introduire de backend, de télémétrie ou de dépendance lourde pour cet audit.

## Mesurer l'amélioration

Avant/après sur les mêmes données et dimensions :

- action essentielle repérable au premier écran mobile; relever sa position, pas seulement une impression;
- étapes et décisions nécessaires pour lancer/reprendre, trouver une idée ou ouvrir le bon outil; supprimer seulement les étapes sans utilité démontrée;
- contexte conservé après annulation, fermeture, retour et interruption;
- zéro débordement horizontal, contenu final accessible et cibles de 44 × 44 px minimum (48 recommandé enfant), en tenant compte d'un éventuel hitSlop réel;
- rôles, noms accessibles, état sélectionné, ordre du focus, fermeture Échap/retour natif et restitution du focus;
- contraste mesuré, textes lisibles, grand texte, clair/sombre et réduction des animations;
- données et fonctions historiques conservées; aucun gain esthétique obtenu par perte de fonction non décidée.

Statuts autorisés : À examiner → Constaté (code/écran) → Décidé → Autorisé → Intégré → Vérifié → Validé. Ajouter Bloqué ou Différé avec motif, dépendance et prochain contrôle. « Inventorié » ne signifie pas « testé ». Un composant conforme au code mais non essayé sur téléphone reste non vérifié nativement.

## Fiche unique d'un lot

1. Objectif et routes; 3 à 5 résultats attendus.
2. Constats avec preuve, impact, certitude, priorité et effort relatif S/M/L.
3. Décisions existantes appliquées; nouveaux choix et fonctions à préserver.
4. Prototype et comparaison; options uniquement si nécessaires; compromis.
5. Décision datée et périmètre exact de l'autorisation.
6. Tâches et critères observables; tests/parcours; captures avant/après; réserves.

Ordre de priorité : blocage ou données, puis action essentielle fréquente, puis cohérence partagée, puis finition. À priorité égale, privilégier une correction commune à plusieurs pages avec effort réduit. Ne pas utiliser un score artificiel pour masquer une incertitude.

## Sources et reprise

Lire METHOD.md, MASTER.md, puis GLOBAL-METHOD.md et GLOBAL-AUDIT.md (todo, journal et inventaire regroupés). Consulter ensuite les décisions historiques concernant le lot et docs/app-rebuild/VISUAL_IDENTITY.md. Les anciennes todos ne pilotent plus l'ordre du chantier.

À chaque reprise, restituer : objectif, phase, lot actif et routes, décisions acquises, rejets pertinents, constats et incertitudes, reste à faire, prochaine action et autorisation nécessaire. Journaliser toute demande, correction, rejet et validation avant de changer de lot. Ne jamais déduire une validation du silence.

## 1. Audit global de l'existant

Examiner les trois pages principales avant de proposer leurs corrections. Cartographier actions, composants partagés et parcours secondaires. Lire le code actuel, puis capturer l'application réelle en mobile/tablette, clair/sombre; contrôler 320, 390, 768 et 1440 px. Un ancien prototype ne constitue pas une preuve du produit actuel.

Rejouer : navigation aller/retour, Parent avec/sans PIN et annulation, catalogue vers formulaire modifiable avant enregistrement, lancement/reprise de routine, recherche/filtres/surprise/favoris/historique/détail d'activité et retour du calendrier enfant.

Vérifier premier démarrage, vide, chargement, erreur, textes longs, panneaux, clavier, focus, grand texte et mouvement réduit. Distinguer vérification web responsive et native; signaler ce qui n'est pas testé.

Chaque constat comporte un identifiant, les routes, une preuve (code ou capture), l'impact, la certitude, la priorité, le lot, le statut et un critère de réussite. Distinguer constat de code, observation visuelle et hypothèse. Priorités : P0 blocage/perte de données; P1 navigation/action essentielle; P2 cohérence/lisibilité; P3 finition.

Livrer un bilan global priorisé : ce qui fonctionne, ce qui gêne et ce qui reste à vérifier. L'audit et sa documentation n'exigent aucun choix graphique.

## 2. Corriger par lots transversaux

1. **G01 — Navigation et cadre commun** : menu, destination active, retours, PIN, en-tête, safe areas et espace réservé au menu.
2. **G02 — Cohérence des pages principales** : hiérarchie, marges, titres, boutons, cartes, icônes, clair/sombre et textes courts.
3. **G03 — Parcours essentiels et états** : lancer/reprendre, trouver une activité, gérer/créer via catalogue, panneaux et outils parentaux.
4. **G04 — Vérification globale** : responsive, accessibilité et non-régression des parcours touchés.

Commencer par G01 sauf découverte d'un blocage P0. Définir chaque correction commune une seule fois, puis la vérifier sur toutes les pages concernées. Ne plus attendre de terminer les 38 éléments de Routines pour examiner les autres pages. Les détails locaux non nécessaires au lot restent ouverts sans bloquer le chantier.

## 3. Décider au niveau du lot

Une fiche par lot regroupe diagnostic, améliorations, composants concernés, critères de réussite et décisions antérieures à préserver. Ne pas produire artificiellement trois variantes pour chaque marge ou icône qui applique une décision déjà explicite : montrer la correction dans le prototype du lot.

Pour un nouveau choix structurant, présenter trois options comparables : principe, contenu, responsive, accessibilité, états, bénéfice, risque et recommandation. Les trois options écrites et leurs trois visuels mobile/tablette figurent dans la même réponse, avec un PNG de secours visible. Ajouter le bureau si sa composition diffère. Aucun choix graphique n'est soumis sans texte et visuel.

Consolider les corrections dans un prototype montrant leur effet sur les pages concernées. Attendre explicitement **« prototype validé — construction autorisée »**, pour le lot nommé, avant de modifier le produit. La demande d'adaptation de méthode autorise les documents; elle ne valide aucune nouvelle apparence. Les choix et rejets anciens restent en vigueur jusqu'à correction explicite.

## 4. Construire et vérifier

Après autorisation : todo technique vérifiable, intégration dans les composants existants, puis contrôles sur toutes les pages touchées. Préserver TypeScript strict, Zustand, AsyncStorage, fonctions Activités, flux catalogue et redirections. Ne pas écraser les changements utilisateur.

Exécuter `npx tsc --noEmit`, `npm test -- --runInBand` et `git diff --check`. Comparer avant/après dans l'application réelle. Vérifier absence de contenu masqué, cibles tactiles d'au moins 44 px, contraste, focus, retours et états. Consigner les limites. Fermer le lot après réussite des critères et validation visuelle explicite; les tests automatisés ne suffisent pas à valider l'UX.
