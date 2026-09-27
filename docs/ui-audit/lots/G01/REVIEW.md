# G01 — Navigation, retours et PIN — prototype v1

Date : 2026-09-20. Statut actuel : **intégré, contrôlé sur web et validé visuellement par l'utilisateur le 2026-09-26; essais natifs ouverts**.

Reprise du 2026-09-26 : sur le dernier bundle web, Activités avec recherche « yoga » → PIN Parent → Annuler rend Activités, la recherche et le focus sur Parent. La vérification du retour natif et du parcours Sécurité → PIN → Parent reste ouverte sur appareil. La validation visuelle finale a été donnée ensuite par l'utilisateur.

Complément du 2026-09-26 : le menu attend désormais l’hydratation du PIN avant de décider si Parent est verrouillé. L’état « Parent, verrouillé » a été revu après rechargement web sur données fictives; le court état initial avant hydratation et le comportement natif restent à éprouver sur appareil.

Correction accessibilité du 2026-09-26 : les destinations du menu étaient annoncées comme cases à cocher sur web, car `aria-pressed` transformait les boutons de navigation en boutons à bascule. Les trois destinations sont désormais des boutons; la destination courante porte `aria-current="page"`. Le changement Routines → Activités → Routines et l'attribut courant ont été vérifiés dans l'app sur l'origine de test.

## Point de reprise

Routes concernées : /routines, /activities, /parent, /pin; sous-routes Parent pour le contrat de retour. Objectif : se repérer, changer d'intention et annuler l'accès Parent sans perdre son contexte. Phase : intégration terminée, contrôles web réalisés et rendu validé visuellement. Prochaine action : traiter les réserves natives ci-dessous.

Acquis : A1/R1 fond continu et ronds pastel; H3 commandes hautes sans bandeau; L1 logo vers Routines; T1 thème à icône; N2 barre bord à bord; P1 cadenas filaire, PIN dédié et retour vers l'écran précédent. Voir reviews/P01-E03, E06 et E07 dans page-01-routines. Les alternatives de bandeau stable, dock flottant et variantes de verrou non retenues restent dans ces fiches. Pas de nouveau choix structurant à rouvrir : un seul prototype consolide ces décisions.

## Diagnostic et cinq résultats

| Résultat | Existant constaté | Correction illustrée | Critère d'intégration |
|---|---|---|---|
| Se repérer partout | Dock flottant, actif rempli et icônes bold/fill | Barre attachée au bas, actif menthe + trait court, icônes Phosphor Regular | Trois destinations constantes, nom/état accessibles, safe area couverte |
| Alléger le cadre | Bandeau de marque 72 px | Logo et thème sur surfaces opaques, fond continu | Aucun chevauchement avec le contenu; commandes ≥44 px |
| Lire le PIN | Couleurs fixes, chiffres pâles, textes sans accents | Écran dédié clair/sombre, chiffres contrastés, texte court | Pavé ≥44 px, chiffres/effacement accessibles, erreur annoncée, saisie masquée |
| Annuler sans perdre sa place | Activités → PIN → Retour mène à Routines | Retour explicite vers l'origine et restauration de la recherche/collection/défilement | Retour, Échap et retour natif cohérents; destination autorisée validée séparément de l'origine |
| Garder le contenu accessible | Réserve du shell + marges de 120 px dans les pages | Une réserve du menu; contenu défilant jusqu'au dernier élément | Dernière action visible sans passer derrière la navigation |

## Responsive, accessibilité et compromis

Mobile : trois cibles réparties sur la largeur, menu de 76 px hors safe area, header de 68 px dans le prototype, pavé à touches de 64 px. Tablette/bureau : surface basse sur toute la largeur, commandes du menu plafonnées à 720 px; contenu plafonné à 1320 px. PIN centré dans un panneau à partir de 720 px. Les seuils/hauteurs illustrent l'application des choix existants; leur intégration doit tenir compte des insets natifs.

Texte et icônes restent lisibles dans les deux thèmes. Actif indiqué par texte, couleur et trait. Focus visible; chiffres, effacement et Échap au clavier. L'annulation remet le focus sur Parent. Le menu disparaît pendant le PIN. Aucun vrai PIN, donnée persistante ou accès Parent réel utilisé par le prototype.

Bénéfice : un cadre prévisible, une meilleure lecture du code et un retour qui respecte la tâche en cours. Compromis : la barre est moins distinctive que le dock; sur grand écran, son fond est très large, ses contrôles restent centrés. Le retour précis impose un contrat d'origine et de destination, plus rigoureux qu'un simple retour dans l'historique.

Recommandation : intégrer ce lot tel qu'illustré après validation, puis traiter la densité des contenus dans G02. La météo, les cartes, les filtres et les textes de contexte de ce prototype ne constituent pas de nouvelles décisions de refonte. Parent est un aperçu simulé issu du code, pas une capture de l'espace protégé.

## Prototype et preuves

- Source : prototype.template.html; résultat autonome : prototype.html; icônes extraites du paquet Phosphor Regular installé par build.mjs.
- Aperçu local : http://127.0.0.1:8092/ (serve.mjs).
- Barre de revue hors produit : formats, aperçus PIN et Parent. Code fictif 1234 pour la seule démonstration de déverrouillage; ne pas saisir de vrai code.
- Les états Création/Confirmation sont des aperçus visuels, pas une implémentation de gestion des identifiants. Les fonctions de contenu affichent une indication de périmètre.
- 20 rendus contrôlés : Routines, Activités, Parent et PIN à 390/768 en clair/sombre; Routines/PIN à 320/1440 en clair. Captures dans captures/; mesures DOM dans checks.json.
- Aucun débordement horizontal du document ni bouton visible sous 44 ×44 après correction du prototype. Cela ne vaut pas contrôle natif ou de toutes les troncatures internes.
- Annulation depuis Activités : recherche « calme » conservée, retour à Activités observé. Déverrouillage fictif : Parent visible et verrou retiré. Erreur et clavier à vérifier selon le journal de contrôle ci-dessous.
- Contrastes calculés sur les paires du cadre : texte clair/surface 11,98; secondaire clair/fond 4,59; actif clair/surface 5,20; texte sombre/surface 13,32; secondaire sombre/surface 7,80; actif sombre/surface 9,76. Ce relevé ne certifie pas tout le contenu métier.

## Todo d’intégration après autorisation

- [x] Intégrer H3/N2/P1 dans AppBrandHeader/AppBottomNavigation; insets, libellés et vrai état de verrouillage.
- [x] Définir et tester origine + destination du PIN : query/collection, URL directe avec repli sûr, refus d'URL externe, restauration du contexte web.
- [x] Reprendre PIN : useAppTheme, accents, noms/rôles, saisie/effacement, annonces d’erreur; conserver création/confirmation et délais de remise à zéro existants. Attendre l’hydratation avant de choisir le mode.
- [x] Unifier la réserve inférieure du shell et des trois pages; dernier élément et clavier vérifiés sur web.
- [x] Observer Parent déverrouillé et le retour depuis Import; garder le problème G03-02 visible.
- [x] TypeScript/Jest, captures et contrôles responsive web : voir [preuves d’intégration](./integration/README.md).
- [ ] Compléter natif, grand texte, lecteur d’écran et parcours PIN isolés (dont retour Sécurité → PIN → Parent sur dernier bundle).
- [x] Recueillir la validation visuelle finale du produit intégré, distincte de l’autorisation déjà reçue (2026-09-26).

## Décision reçue

Validation explicite reçue : **« G01 — prototype validé — construction autorisée »**. L’autorisation est acquise pour ce lot et ne doit pas être redemandée lors d’une reprise. La validation visuelle finale du produit intégré a été reçue le 2026-09-26; les essais natifs restent distincts.

## Journal

- 2026-09-20 : « reprends la todo » pendant l’intégration autorisée. Reprise G01 aux contrôles réels : menu/cadre/PIN intégrés; retour recherche, collection, défilement et focus observés. Parent désormais affiché dans le navigateur utilisateur, à vérifier sans redemander l’autorisation G01. G02 et E17 restent en attente.
- 2026-09-20 : validation explicite reçue : « G01 — prototype validé — construction autorisée ». Autorisation limitée à G01, selon le prototype v1; intégration et vérifications engagées. G02/G03 restent hors construction.
- 2026-09-20 : nouvelle demande « reprends la todo » après présentation du prototype v1. Point de reprise : G01 prêt, validation explicite toujours attendue; aucune correction ni autorisation déduite de la reprise. Prochaine action : recueillir la validation ou les corrections de G01 avant intégration.
- 2026-09-20 : « commence le travail alors » puis « reprends la todo » : poursuite du prototype et de ses contrôles; aucune décision graphique nouvelle ni autorisation d'intégration.
- 2026-09-20 : prototype v1 préparé depuis H3/N2/P1; cibles trop étroites des flèches de contexte Parent corrigées avant présentation; captures finales remplacent uniquement les captures de contrôle internes, pas des propositions soumises ou rejetées.

### Contrôles complémentaires

Clavier : quatre chiffres fictifs incorrects produisent « Code incorrect. Réessayez. »; Échap revient à Activités et le focus revient sur Parent. Capture pin-error-390.png. Les autres états Création/Confirmation restent des aperçus visuels seulement. Aucun contrôle de sécurité réel n'est simulé comme preuve produit.

Vérifications historiques après préparation du prototype : TypeScript réussi; 16 suites Jest / 109 tests réussis. À ce stade, aucun fichier produit n’avait été modifié.

### Intégration autorisée et contrôles finaux

G01 intégré dans les composants existants; écran PIN déplacé vers src/features/parent/screens/pin-screen.tsx, route app/pin.tsx conservée. 26 captures produit, contrôles de retour et de défilement, Parent déverrouillé observé. TypeScript et 17 suites / 136 tests réussis; git diff --check réussi. Détail et limites dans integration/README.md. Prochaine préparation : G02. Aucun autre lot construit.
