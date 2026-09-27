> **Chantier actif au 2026-09-20 : audit et amélioration globale.** Lire [GLOBAL-METHOD.md](./GLOBAL-METHOD.md) et [GLOBAL-AUDIT.md](./GLOBAL-AUDIT.md). Priorité : navigation des trois pages principales. Pré-audit de code commencé; audit visuel à compléter. E17/V3 suspendu, non validé. Aucune construction autorisée. La file ci-dessous est historique et ne bloque plus l'examen des autres pages.

# File de refonte graphique page par page

État courant au 2026-09-20 : **V3 — images seules**. Aucune case ni nom visible quand non sélectionné; petit pin coché et contour vert pâle uniquement sur l'image sélectionnée. Grille compacte adaptative conservée. Référence : DECISIONS-TENUE.md, tenue-images-selection.html et PNG P01-E17-v5-*.png. Exemple à valider; V1/V2 et leurs descriptions ci-dessous sont historiques, aucune construction autorisée.


Dernière mise à jour : 2026-09-17

La structure, les routes et les logiques sont stabilisées. Une ligne représente une surface visuelle réelle, pas chaque ancienne URL technique.

## Protocole persistant

Pour appliquer le processus à une autre application : [méthodologie réutilisable et prompts de lancement](./METHODOLOGIE-REUTILISABLE.md). Pour examiner la décision courante : [fiche Tenue avec exemple V2 sans cartes à valider](./page-01-routines/DECISIONS-TENUE.md).

La règle de travail commune est documentée dans [`METHOD.md`](./METHOD.md). Ce document doit être relu avant toute reprise. Chaque page conserve en plus un `DECISION_LOG.md` chronologique : la mémoire de conversation n'est jamais la source de vérité.

Une réponse de validation doit toujours rester compréhensible si le visuel interactif ne s'affiche pas : explications écrites complètes et capture PNG de secours sont obligatoires dans la même réponse.

## Ordre de travail

Le [brainstorming global du 2026-09-19](./BRAINSTORMING.md) prépare les questions d'usage et les travaux par surface. Il ne remplace pas la file ni les décisions ci-dessous.

Pour chaque point de chaque surface ci-dessous, appliquer la checklist [Méthode obligatoire pour chaque point](./BRAINSTORMING.md#méthode-obligatoire-pour-chaque-point) : diagnostic, amélioration expliquée, options et visuels comparables, bénéfices/compromis, décision consignée, puis vérification après construction autorisée.

- [?] **PAGE-01 — Routines** — direction globale A et éléments E01 à E16 validés; E17 : grille de tous les vêtements dès l'ouverture et présélection météo décidées le 2026-09-19; visuel et détails restants à consolider.
- [ ] **Préparation et exécution accompagnées** — LaunchFlow, étape, pause, bien-être, célébration.
- [ ] **Calendrier enfant** — Maintenant, Après, Demain, Semaine, Dodos et détails liés.
- [ ] **Activités** — travaux antérieurs conservés comme brouillon; nouvelle passe seulement après fermeture de PAGE-01.
- [ ] **Parent / accueil** — accès clair aux cinq outils.
- [ ] **Parent / Famille** — liste et formulaire superposé.
- [ ] **Parent / Routines** — gestion, constructeur et catalogue superposé.
- [ ] **Parent / Calendrier** — liste des repères et éditeur superposé.
- [ ] **Parent / Progrès** — statistiques, badges et récompenses parentales.
- [ ] **Parent / Réglages** — météo, sécurité, import et corbeille.

## Statut d’entrée

- [x] Architecture à trois destinations validée.
- [x] Anciennes pages redondantes regroupées ou redirigées.
- [x] Logiques principales raccordées et testables localement.
- [x] Base responsive vérifiée à 320, 390 et 768 px.
- [x] Identité de référence documentée dans `VISUAL_IDENTITY.md`.
- [x] La refonte graphique page par page peut commencer.

## Critères à appliquer à chaque surface

- Pastels simples et fonctionnels; jamais une page entièrement décorative.
- Ronds pastel en arrière-plan comme signature, sans gêner la lecture.
- Outils parentaux calmes; moments accompagnés plus vivants et ludiques.
- Une action principale évidente, textes courts et cibles tactiles d’au moins 44 px.
- Modes clair et sombre conçus ensemble.
- Superposition responsive pour les tâches secondaires.
- Vérification 320/390/768/1440, texte long, vide, erreur, clavier, focus et mouvement réduit.
- Validation visuelle de l’utilisateur avant de marquer la surface terminée.

Les anciennes checklists sont des archives de conception; elles ne pilotent plus la refonte.

## Portes obligatoires par page

1. Trois propositions globales, chacune accompagnée d’un écrit comparable et d’un visuel responsive.
2. Validation explicite d’une direction.
3. Inventaire exhaustif visible, conditionnel, caché et oublié.
4. Traitement et validation de chaque identifiant `PXX-EXX`, un par un.
5. Prototype composé uniquement des décisions détaillées validées.
6. Validation explicite `prototype validé — construction autorisée`.
7. Intégration et contrôle du code réel.
8. Validation visuelle finale, puis seulement passage à la page suivante.

Une validation de direction globale ne valide jamais les éléments détaillés. Un prototype anticipé reste un brouillon et ne permet pas de franchir la porte de construction.

### Règle de présentation des directions

- Recommencer une page à zéro réinitialise sa composition et ses décisions locales, jamais l’identité globale déjà validée.
- Avant présentation, chaque visuel doit passer la checklist de `docs/app-rebuild/VISUAL_IDENTITY.md`; un écart non expliqué rend la proposition incomplète.
- A, B et C doivent montrer le même contenu et les mêmes fonctions afin que seule l’organisation change.
- Chaque direction fournit ensemble : hiérarchie, parcours, responsive, signature, bénéfice, risque et visuel.
- Le visuel doit montrer au minimum le mobile et la tablette; le bureau est ajouté lorsque sa composition diffère réellement.
- Une direction sans visuel, ou un visuel sans explication écrite, est incomplet et ne peut pas être soumis à validation.
- Chaque visuel interactif doit être accompagné d'une capture PNG de secours directement visible dans la réponse.
- Les explications écrites ne peuvent jamais être remplacées par un code de choix seul (`W4`, `A1`, etc.).
