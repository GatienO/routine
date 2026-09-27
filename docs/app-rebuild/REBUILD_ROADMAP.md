# Roadmap de reconstruction — phase structurelle close

Dernière mise à jour : 2026-09-14

La reconstruction structurelle est terminée. Ce document fige la base fonctionnelle sur laquelle commence désormais la refonte graphique page par page.

## Décisions produit figées

- [x] Trois destinations seulement : Routines, Activités, Parent.
- [x] Aucun tableau de bord ou profil autonome par enfant.
- [x] Les enfants utilisent l’app uniquement pendant une expérience accompagnée.
- [x] Le calendrier aide l’enfant à se repérer dans le temps; ce n’est pas un planning familial.
- [x] La météo aide le parent à préparer la tenue puis devient ludique dans la routine.
- [x] Les tâches secondaires s’ouvrent en superposition responsive autant que possible.
- [x] L’identité repose sur Pastel utile, les modes clair/sombre et les ronds pastel.

## Lots structurels terminés

- [x] Shell commun, registre de navigation et anciennes routes redirigées.
- [x] Accueil Routines parental, regroupement multi-enfants et reprise d’une exécution persistée.
- [x] LaunchFlow unique : préparation, présence, humeur facultative et lancement.
- [x] Exécution immersive, pause protégée, double validation bloquée et fin de routine.
- [x] Étapes guidées météo et tenue, explications positives et repli sans météo.
- [x] Calendrier accompagné : Maintenant, Après, Demain, Semaine et Dodos.
- [x] Configuration Parent des repères, liens vers routines/activités et récurrence simple.
- [x] Activités consolidées sur une collection avec états Favoris/Récentes et détails superposés.
- [x] Espace Parent réorganisé en Famille, Routines, Calendrier, Progrès et Réglages.
- [x] Progression d’activité attribuée seulement après confirmation parentale.
- [x] Suppression des écrans morts et du sélecteur global d’enfant.
- [x] Persistance locale conservée sans backend ni nouveau store concurrent.

## Compatibilité et contrôles

- [x] `/today` redirige vers `/routines`.
- [x] `/explore` redirige vers `/activities`.
- [x] `/parent/catalog` ouvre le constructeur avec le catalogue.
- [x] Les routes historiques utiles restent accessibles par redirection ou wrapper.
- [x] Les dates de calendrier restent des dates locales stables aux changements d’heure.
- [x] Les chevauchements restent visibles et une journée vide conserve des repères calmes.
- [x] Les formats 320, 390 et 768 px ont été capturés et les débordements relevés ont été corrigés.
- [x] TypeScript strict, tests et `git diff --check` font partie du contrôle de sortie.

## Transfert vers la refonte graphique

Les éléments suivants ne sont plus des tâches de reconstruction structurelle. Ils deviennent les critères de chaque audit visuel : contraste, lecteur d’écran, texte agrandi, réduction des animations, clavier, focus, rendu iOS/Android, états vide/chargement/erreur et validation visuelle finale.

La file officielle est désormais [MASTER.md](../ui-audit/MASTER.md).
