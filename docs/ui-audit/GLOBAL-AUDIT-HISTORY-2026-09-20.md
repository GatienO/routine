# Audit global — suivi actif

## Point de reprise — 2026-09-20

Objectif : améliorer l'existant globalement. Routes : `/routines`, `/activities`, `/parent`. Phase : pré-audit documentaire et de code commencé; observation visuelle actuelle à réaliser. Lot prioritaire : G01 navigation. Fondations : trois intentions et identité existante conservées. Décisions antérieures N2 (barre bord à bord) et P1 (cadenas filaire) conservées; leur intégration n'est pas présumée.

Aucun nouveau choix graphique validé ni rejeté dans le chantier global. P01-E01 à E16 et corrections ultérieures restent enregistrés. E17/V3 reste ouvert et suspendu, sans bloquer les autres pages. Ses rejets restent dans page-01-routines/DECISION_LOG.md. Aucune construction autorisée.

Prochaine action : capturer les trois pages réelles et rejouer menu/retours/PIN pour compléter ce bilan. États à couvrir : premier démarrage, contenu, vide, reprise, PIN annulé, panneaux et clavier. Porte avant code produit : prototype du lot explicitement validé et construction autorisée.

## Journal

### 2026-09-20 — Changement de méthode demandé

- Demande : audit de l'existant puis amélioration globale des pages principales; le menu de navigation est cité comme problème.
- Adaptation : audit global puis lots transversaux; abandon de l'obligation de terminer chaque élément de Routines avant les autres pages.
- Conserver : décisions explicites, historique des rejets, identité, fonctions, données locales et preuves visuelles.
- Alléger : validation au niveau du lot; pas de trois variantes par micro-correction d'une décision existante.
- Aucune apparence nouvelle validée. Le signalement du menu ouvre son audit sans annuler automatiquement N2/P1.
- Références : GLOBAL-METHOD.md, METHOD.md et journal de PAGE-01. Statut suivant : compléter l'audit réel puis présenter G01.

## Inventaire initial

Constats ouverts; priorités provisoires. Lecture de code uniquement, aucune nouvelle capture ni vérification native effectuée dans cette adaptation.

| ID / lot | Constat et preuve | Impact et certitude | Priorité | Critère de réussite |
|---|---|---|---|---|
| G01-01 | `src/components/ui/AppBottomNavigation.tsx` : marges horizontales, rayon, ombre, maxWidth 720; écart à N2 bord à bord | Écart de code confirmé; gêne à observer | P1 | Menu conforme à la décision retenue sur les trois pages, clair/sombre et safe area |
| G01-02 | Même fichier : cadenas fill et icône active bold; écart à P1/Regular | Incohérence confirmée dans le code | P2 | Icônes cohérentes et protection identifiable et accessible |
| G01-03 | `app/_layout.tsx` réserve bottomOffset; écrans Routines, Activités et Parent ajoutent paddingBottom:120 | Cumul confirmé; espace excessif à mesurer | P2 | Dernier contenu accessible et espace inférieur justifié à chaque largeur |
| G01-04 | `src/constants/navigation.ts` masque le menu sur /child, /pin et certains formulaires; le menu utilise replace | Contrat à tester; aucune panne établie | À qualifier | Aller/retour et annulation sans impasse ni perte de saisie inattendue |
| G02-01 | AppBrandHeader, AppTopNavigation et AppScaffold proposent des cadres différents; AppTopNavigation utilise des couleurs fixes | Usages actifs et effet sombre à vérifier | À qualifier | En-têtes et contrastes cohérents sur les routes accessibles |

À conserver : trois destinations centralisées, navigation rendue au layout racine, séparation des features et routes. Leur présence dans le code ne prouve pas la réussite des parcours.

À examiner : lancement/reprise/météo/calendrier dans Routines; recherche, filtres, surprise, favoris, historique et détail dans Activités; Famille, Routines, Calendrier, Progrès et Réglages dans Parent. Vérifier aussi catalogue, exécution, calendrier enfant, anciennes routes, accessibilité et états non nominaux.

## Todo globale

- [x] Relire la méthode et la continuité existantes.
- [x] Adapter la méthode et conserver l'historique.
- [x] Consigner les premiers constats de code.
- [ ] Capturer les trois pages réelles, mobile/tablette, clair/sombre.
- [ ] Contrôler 320/390/768/1440, textes longs et accessibilité.
- [ ] Rejouer les parcours essentiels et routes historiques.
- [ ] Finaliser le bilan global priorisé avec preuves et limites.
- [ ] G01 : fiche, corrections et éventuels choix structurants, prototype du lot.
- [ ] G01 : autorisation, intégration, tests et validation visuelle.
- [ ] G02 : cohérence des trois pages, même cycle par lot.
- [ ] G03 : parcours et états, même cycle par lot.
- [ ] G04 : vérification globale et réserves restantes.
