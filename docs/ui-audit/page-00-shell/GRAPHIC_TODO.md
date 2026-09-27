# ARCHIVE — Ancienne passe Shell global + Routines — 2026-09-15

> Cette todo n’est plus courante. La reprise officielle se trouve dans `../page-01-routines/GRAPHIC_TODO.md` et repart sans décision héritée.

> Correction méthodologique : la direction globale A + C est validée, mais elle ne valide aucun élément détaillé. Le code actuellement intégré est un brouillon réversible à confronter aux décisions ci-dessous. Aucun point `[?]` ne peut devenir `[x]` sans décision explicite.

## Phase 0 — Objectif et périmètre

- [x] Objectif : aider le parent à identifier le prochain moment, préparer la tenue et lancer une routine accompagnée.
- [x] Socle commun : identité Pastel utile, trois destinations Routines / Activités / Parent, clair/sombre, surfaces superposées.
- [x] Exclusions : aucun usage enfant autonome, aucun profil d’enfant comme centre de l’app, aucun planning familial, aucun backend.
- [x] Contrats à préserver : stores locaux, routines actives, exécution en cours, météo, calendrier enfant, routes et garde PIN.

## Phase 1 — Captures et inventaire réel

- [x] Conserver les captures d’avant refonte disponibles dans `docs/ui-audit/final-2026-09-14/`.
- [x] Inventorier les fonctions visibles et conditionnelles dans le code réel.
- [ ] Reprendre des captures du brouillon actuel à 320, 390, 768, 1024 et 1440 px.
- [ ] Capturer clair et sombre, écran très haut et zoom/texte agrandi.
- [ ] Capturer météo disponible, chargement, absente, périmée et erreur.
- [ ] Capturer routine disponible, aucune routine, exécution en cours et plusieurs routines.
- [ ] Capturer calendrier vide, journée remplie, événement long et compte à rebours en dodos.
- [ ] Capturer la préparation de tenue et l’enchaînement de routines.
- [ ] Mesurer scroll horizontal, chevauchements, cibles tactiles et contenu masqué par la navigation.

## Phase 2 — Direction globale

- [x] A — Chemin de galets.
- [x] B — Carnet de repères.
- [x] C — Constellation douce.
- [x] Direction choisie : **A + C**, validée par l’utilisateur le 2026-09-14.
- [x] Limite globale : outils parentaux calmes, un seul motif ludique fort, aucun mouvement décoratif permanent.

## Phase 3/4 — Revue exhaustive point par point

### Socle commun visible et invisible

- [?] **P00-E01 — Icône-marque du header**
  - Existant réel : galet menthe arrondi de 44 × 44 px, `R` vert et trois petits points; seul élément à gauche d’un header de 72 px.
  - Diagnostic : le symbole est compact, reconnaissable et conforme à la demande d’enlever le texte. Les trois points commencent bien le langage des galets. En revanche, sa silhouette presque carrée est moins ronde que le reste de l’identité et l’état de focus n’est pas encore dessiné explicitement.
  - Problème utilisateur : la fonction « retour à l’accueil Routines » repose entièrement sur un petit symbole; elle doit rester identifiable, tactile et accessible sans recréer un gros header.
  - A — **Galet-signature actuel affiné** : conserver le carré très arrondi `R + trois points`, renforcer légèrement les points et ajouter focus/pression. C’est la variante la plus stable et la plus distinctive.
  - B — **Médaillon rond** : passer le fond en cercle parfait, garder le `R` et placer les trois points en petite trajectoire. Plus cohérent avec les ronds aimés, mais plus générique comme logo d’application.
  - C — **Monogramme libre** : supprimer le fond, garder seulement `R + trajectoire de points`. Plus léger, mais moins lisible sur la météo, le sombre et les fonds changeants.
  - Responsive : symbole visuel 44 px et cible 48 px à toutes les tailles; mêmes marges optiques de 320 à 1920 px, sans faire revenir le nom.
  - Accessibilité : rôle bouton, libellé `Revenir aux routines`, focus visible non fondé sur la couleur, état pressé bref, retour systématique vers `/routines`.
  - Recommandation : **A**, car elle préserve le signe déjà construit tout en corrigeant ses états invisibles.
  - Décision attendue : A, B ou C; aucune modification de code avant réponse.
- [ ] **P00-E02 — Bouton clair/sombre**
  - À revoir : soleil/lune, compréhension sans texte, état courant, contraste.
  - Invisible : préférence système, persistance, premier chargement, lecteur d’écran.
- [ ] **P00-E03 — Barre de navigation basse**
  - À revoir : trois destinations, icônes, libellés, sélection active, largeur et flottement.
  - Invisible : garde PIN vers Parent, ancienne route, retour, clavier, safe area, page longue.
- [ ] **P00-E04 — Cadre, fond et zones sûres**
  - À revoir : largeur maximale, marges, fond rempli sur écran haut, rythme vertical.
  - Invisible : rotation, clavier virtuel, encoche, zoom 200 %, barre basse sans recouvrement final.
- [ ] **P00-E05 — Ronds et galets partagés**
  - À revoir : quantité, tailles, couleurs sémantiques, position et utilité.
  - Invisible : masquage lecteur d’écran, contraste, mouvement réduit, absence de gêne avec texte long.
- [ ] **P00-E06 — Typographie, couleurs, rayons et ombres**
  - À revoir : échelle, densité, pastels fonctionnels, cohérence clair/sombre.
  - Invisible : contraste, daltonisme, police indisponible, traduction plus longue.

### Page Routines — contenu principal

- [ ] **P01-E01 — Ordre et hiérarchie de la page**
  - À revoir : météo pleine largeur, routine prioritaire, calendrier secondaire, autres routines.
  - Invisible : ordre de lecture, ordre clavier et réorganisation mobile/tablette/desktop.
- [ ] **P01-E02 — Bandeau météo du jour**
  - À revoir : température, condition, résumé utile, ressenti, vent et pluie.
  - Invisible : chargement, absence de ville, géolocalisation refusée, réseau, données périmées, actualisation au retour de l’app, jour/nuit.
- [ ] **P01-E03 — Tenue proposée dans la météo**
  - À revoir : vêtements visibles, sens des pictogrammes, place du bouton `Adapter`.
  - Invisible : configuration parentale, plusieurs couches, pluie/chaleur/froid, aucune recommandation et ouverture/fermeture du panneau.
- [ ] **P01-E04 — Choix de la routine mise en avant**
  - À revoir : règle de priorité, favori, moment de la journée et cohérence avec le calendrier.
  - Invisible : routine inactive, doublons pour plusieurs enfants, aucune correspondance et ordre persistant.
- [ ] **P01-E05 — Carte de routine principale**
  - À revoir : moment, icône, nom, enfants, nombre d’étapes, durée et aperçu des trois étapes.
  - Invisible : noms très longs, un à plusieurs enfants, étape sans durée, plus de trois étapes et contenu incomplet.
- [ ] **P01-E06 — Action `Lancer avec…`**
  - À revoir : libellé, dominance, placement et retour immédiat.
  - Invisible : choix de l’enfant, lancement groupé, double appui, routine invalide et route d’exécution.
- [ ] **P01-E07 — Reprise d’une routine en cours**
  - À revoir : priorité du bandeau, nom, progression et action `Continuer`.
  - Invisible : exécution interrompue, routine supprimée/désactivée, chaîne en cours et reprise après relance.
- [ ] **P01-E08 — Petit calendrier enfant**
  - À revoir : Maintenant / Après, matin-midi-soir, événement futur et accès à la journée entière.
  - Invisible : aucun événement, textes longs, plusieurs événements, routine liée, âge de l’enfant, date locale, `Dans N dodos`.
- [ ] **P01-E09 — Liste `Autres routines`**
  - À revoir : quantité montrée, icône, enfant, étapes, durée et bouton de lancement.
  - Invisible : liste longue, favoris, routines partagées entre enfants, routines inactives et chargement local.
- [ ] **P01-E10 — Actions `Gérer`, `Créer` et `Enchaîner`**
  - À revoir : hiérarchie secondaire, vocabulaire et emplacement.
  - Invisible : garde PIN, retour sur Routines, moins de deux routines, droits parentaux et routes historiques.
- [ ] **P01-E11 — Superposition d’enchaînement**
  - À revoir : choix, ordre, résumé et action de lancement.
  - Invisible : minimum deux routines, sélection longue, fermeture Échap, focus rendu, double envoi et reprise.

### États, retours et cas oubliés

- [ ] **P01-E12 — État sans routine**
  - À revoir : message, illustration, action de création et place conservée pour météo/calendrier.
  - Invisible : routines toutes désactivées, store vide après import ou suppression, garde PIN.
- [ ] **P01-E13 — Chargement et hydratation locale**
  - À revoir : stabilité du layout, attente compréhensible et absence de clignotement.
  - Invisible : AsyncStorage lent/invalide, premier démarrage et récupération partielle.
- [ ] **P01-E14 — Erreurs et feedback**
  - À revoir : erreur près de sa cause, solution proposée, succès discret.
  - Invisible : météo, navigation, lancement impossible, import incomplet et action répétée.
- [ ] **P01-E15 — Contenus extrêmes**
  - À revoir : noms, étapes, villes, météo, événements et participants très longs.
  - Invisible : accents/emoji UTF-8, pluriels, traduction et très grand texte.
- [ ] **P01-E16 — Responsive et anti-superposition**
  - À revoir : 320/390 vertical, routine gauche + calendrier pleine hauteur droite dès tablette, grille desktop.
  - Invisible : 350/430/1024/1920, paysage, hauteur courte, zoom 200 %, navigation fixe et absence de scroll horizontal.
- [ ] **P01-E17 — Accessibilité et clavier**
  - À revoir : cibles 44 px, noms accessibles, rôles, contraste et information jamais portée uniquement par la couleur.
  - Invisible : ordre de tabulation, focus visible, Échap, focus dans/depuis les panneaux et lecteur d’écran.
- [ ] **P01-E18 — Mouvement et feedback tactile**
  - À revoir : pression, transition de panneau, progression et éventuelle réaction des galets.
  - Invisible : réduction des animations, aucun mouvement permanent, action urgente non retardée.
- [ ] **P01-E19 — Performance, confidentialité et données**
  - À revoir : rendu initial, ressources météo et pictogrammes.
  - Invisible : aucune donnée enfant dans la mesure, stockage local, aucune dépendance/backend ajouté, rafraîchissement raisonnable.
- [ ] **P01-E20 — Entrées, sorties et continuité**
  - À revoir : arrivée depuis le logo/nav, départ vers exécution, calendrier et Parent.
  - Invisible : `/today -> /routines`, retour Android/web, liens profonds, route invalide et état conservé.

## Règle de traitement des éléments

Pour chaque ligne P00/P01, dans l’ordre : diagnostic factuel du code réel → problème utilisateur → deux ou trois propositions → responsive/accessibilité → décision explicite → inscription de la décision. Aucun prototype supplémentaire ni changement de code pendant cette phase.

## Phase 5 — Prototype consolidé

- [ ] Réviser le prototype actuel avec uniquement les décisions détaillées validées.
- [ ] Couvrir tous les états visibles et invisibles retenus.
- [ ] Capturer clair/sombre et 320/390/768/1024/1440.
- [ ] Comparer avec les surfaces globales déjà validées.

## Phase 6 — Porte avant construction

- [?] Obtenir exactement : `prototype validé — construction autorisée`.

## Phase 7/8 — Todo technique après validation

- [ ] Recréer la todo technique depuis les seules décisions validées.
- [ ] Rejouer la baseline TypeScript et Jest.
- [ ] Corriger le brouillon intégré sans dériver des décisions.
- [ ] Contrôler chaque tâche immédiatement après intégration.

## Phase 9/10 — Contrôle réel et fermeture

- [ ] TypeScript, Jest, navigation, clavier, focus, zoom, contraste et mouvement réduit.
- [ ] Captures après aux mêmes formats et états que les captures avant.
- [ ] Mesurer `scrollWidth <= clientWidth`, cibles et alignements.
- [?] Obtenir la validation visuelle finale du code réel.
- [ ] Fermer Shell + Routines seulement après cette validation.
- [ ] Passer ensuite à la page suivante de la file maître.

## Écart méthodologique enregistré

Une intégration locale a été réalisée après validation de la seule direction globale, avant la revue explicite P00/P01. Elle n’est pas considérée comme approuvée. Elle sert uniquement de brouillon observable et sera corrigée ou remplacée selon les décisions point par point.
