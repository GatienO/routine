# Audit global — état des lots

**G08 — icônes, avatars et images : clôture technique web le 2026-09-30.** Le constructeur limité aux 18 premières icônes propose désormais 324 pictogrammes avec recherche, récents et catégories complètes; Famille propose 16 illustrations et 24 avatars animaux. Le contrôle isolé vérifie création, modification et réouverture de routine, étape, avatar et repère, avec captures à 320/390/768/1440 px, thème sombre, panne du CDN et clavier. Une correction supplémentaire conserve l'identifiant d'une routine ouverte directement après le PIN. [Preuves et limites](./lots/G08/REVIEW.md). La validation graphique explicite de l'utilisateur et les essais sur appareil ne sont pas déduits de ces contrôles.

**G07 terminé et retiré de la todo active** le 2026-09-27 : bienvenue et nom de famille → code Parent → premier enfant → accueil `/routines`. Prototype validé, construction autorisée puis parcours complet vérifié sur installation web isolée, avec retours, rechargements, 320/390/768 px et thème sombre. [Fiche et preuves conservées](./lots/G07/REVIEW.md). Aucun lot actif ouvert ici.

Extension visuelle demandée après G06 : le fond pastel à ronds de l’accueil est appliqué au cadre commun de toutes les routes. Contrôle transversal local du 2026-10-01 : neuf surfaces représentatives ont été capturées à 390 px en clair et sombre, dont `/child/summary`; les quatre destinations les plus exposées ont aussi été vues à 768 px. Une redirection prématurée du résumé enfant a été corrigée en attendant l'hydratation des données. [Captures et limites](./global-evidence-2026-10-01/README.md). Ce contrôle ne vaut pas essai de chaque route et reste local, sans push.

État au 2026-09-27 : **todo globale validée et clôturée par l’utilisateur** (« valide tout et termine ») dans le périmètre web et code convenu. G01, G02 et G05 ont été intégrés, vérifiés sur web et validés visuellement; les parcours G03 ont été rejoués sur données fictives isolées. TypeScript, 158 tests et les exports de production web/Android/iOS ont réussi. Les essais sur appareil iOS/Android et avec lecteur d’écran réel ont été retirés du périmètre à la demande de l’utilisateur : ils restent non testés, et la validation finale ne les couvre pas. Détails et preuves : [bilan global](./GLOBAL-AUDIT.md) et [audit fonctionnel](./FUNCTIONAL-AUDIT.md).

**G06 terminé et retiré de la todo active** le 2026-09-27 : routes `/routines`, `/child/summary`, `/child/run` et reprise. [Diagnostic, construction et contrôles](./lots/G06/REVIEW.md) : minuteur et pause persistants, nom de routine visible, actions Parent accessibles, exécution fictive rejouée sur web isolé. Les lots G01–G05 restent clos.

- [Méthode complète et rapide](./GLOBAL-METHOD.md).
- [Bilan, journal, limites et todo](./GLOBAL-AUDIT.md).
- [Couverture de toutes les routes et fonctions](./GLOBAL-COVERAGE.md).
- [Captures et mesures](./global-evidence-2026-09-20/README.md).

## Ordre

1. G01 — Navigation, retours, PIN, cadre commun.
2. G02 — Hiérarchie, densité et cohérence des pages principales.
3. G03 — Parcours, états et fonctions potentiellement devenues inaccessibles.
4. G04 — Vérification finale; ses critères s'appliquent dès chaque lot.

Ne pas attendre G04 pour corriger un problème d'accessibilité bloquant. G02 : [option A corrigée — grille directe](./lots/G02/REVIEW.md), validée et autorisée. Les parcours métier sont testés sur une famille fictive à une origine séparée.

## Continuité

Conserver identité, trois destinations et décisions PAGE-01 E01–E16, avec leurs corrections ultérieures. E17/V3 a été autorisé pour une application locale le 2026-09-21 et intégré; ses cinq illustrations provisoires ont été remplacées et contrôlées dans l'app web le 2026-09-26. Son rendu final a été validé explicitement par l'utilisateur le 2026-09-26; les essais natifs ont été écartés du périmètre à sa demande, sans être déclarés réussis. Les écarts du produit aux décisions sont dans le bilan global. Les anciens choix graphiques Activités restent des brouillons.

L'ancienne file complète est conservée dans [MASTER-HISTORY-2026-09-20.md](./MASTER-HISTORY-2026-09-20.md). Les dossiers page-XX servent de références ciblées, plus d'ordre de travail obligatoire.

Dernière correction G02 : A avec grille directe, sans carte vedette; captures et décisions dans la fiche G02. La validation du prototype, l’autorisation de construction et la validation visuelle finale du produit sont acquises.
