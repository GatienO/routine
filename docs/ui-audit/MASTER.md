# Chantier G06 — lancement et routine en cours

État au 2026-09-27 : **todo globale validée et clôturée par l’utilisateur** (« valide tout et termine ») dans le périmètre web et code convenu. G01, G02 et G05 ont été intégrés, vérifiés sur web et validés visuellement; les parcours G03 ont été rejoués sur données fictives isolées. TypeScript, 158 tests et les exports de production web/Android/iOS ont réussi. Les essais sur appareil iOS/Android et avec lecteur d’écran réel ont été retirés du périmètre à la demande de l’utilisateur : ils restent non testés, et la validation finale ne les couvre pas. Détails et preuves : [bilan global](./GLOBAL-AUDIT.md) et [audit fonctionnel](./FUNCTIONAL-AUDIT.md).

Nouveau chantier demandé le 2026-09-27 : **G06 — lancement et routine en cours**, routes `/routines`, `/child/summary`, `/child/run` et reprise. [Diagnostic, autorisation et intégration](./lots/G06/REVIEW.md) : minuteur persistant, pause conservée, nom de routine visible et actions Parent accessibles. Construction autorisée par « j'autorise continue », contrôlée sur installation fictive web; validation visuelle finale encore ouverte. Les lots G01–G05 restent clos.

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
