# G02 — Lisibilité et accès au contenu

Date : 2026-09-20, suivi au 2026-09-25. Statut : **prototype A corrigé validé, construction intégrée, rendu final validé par l’utilisateur; essais natifs ouverts**.

## Point de reprise

Objectif : rendre le contenu utile visible plus tôt sur /activities, alléger /parent et appliquer les corrections météo acquises sur /routines. L’option A corrigée, avec grille directe sans activité vedette, est validée et intégrée; le rendu final a aussi été validé. G01 reste intégré avec ses réserves; E17 reste ouvert. Les comparatifs ci-dessous décrivent la phase de prototype historique. Les essais natifs relèvent de G04.

Acquis : identité, trois destinations, cadre G01, direction historique Activités « A + une touche de C » (GRAPHIC_TODO de PAGE-07); décisions météo B1/W6/N1+/F1+/F0/H1 et Modifier à droite. Les noms A/B/C ci-dessous désignent uniquement trois placements des outils, pas les anciennes directions globales. Les anciennes variantes rejetées de météo et de navigation restent archivées.

## Diagnostic et cinq résultats

| Résultat | Preuve / problème | Correction proposée | Critère après intégration |
|---|---|---|---|
| Trouver une idée au premier écran | Carte Défi silence de l’app à y=702–911 sur 390×844; menu à y≈768. Seulement le haut de la carte visible | Titre court, trois collections sur une ligne, compteur unique, outils regroupés | Une suggestion lisible et son action entièrement au-dessus du menu à 390×844 |
| Toucher les commandes facilement | Effacer/Filtrer 32 px, favoris 40 px dans audit initial | Cibles ≥44 px, noms, focus et état sélectionné | Contrôle web et natif, grands textes et contraste sur vrais composants |
| Lire les consignes avant les métadonnées | 13 badges dans ActivityDetailBody | Trois repères, matériel et étapes; autres données/variantes accessibles dans un accordéon | Aucune donnée ni action perdue, fermeture et focus cohérents |
| Accéder aux filtres sans longue navigation | 12 catégories dans FilterBar | Quatre groupes lisibles, critères existants conservés | Mapping complet des champs, compte exact et restauration des filtres |
| Alléger les pages communes | Parent titre long et répétitions; météo avec détails déjà rejetés | Parent court, outils neutres; météo sans statistiques/conseils, Modifier à droite | Même information métier et fonctions; E17 non modifié |

## Trois options comparables

| Option | Organisation / bénéfice | Risque | Mobile / tablette / bureau | Accessibilité |
|---|---|---|---|---|
| **A — Tout à portée (recommandée)** | Recherche puis Filtres + Surprise visibles avant la suggestion. Tout reste repérable sans ouverture supplémentaire | Deux lignes d’outils restent avant la carte | Empilées mobile/tablette; alignées sur large bureau. Grille 1/2/3 colonnes | Ordre de lecture = ordre visuel, cibles ≥44 px, noms toujours visibles |
| **B — Suggestion d’abord** | Suggestion avant les outils : accès le plus rapide à une idée immédiate | Recherche et filtres descendent; moins adapté à une demande précise | Même ordre aux trois formats, carte mise en avant puis outils | Ordre linéaire sans réordonnancement CSS; cibles ≥44 px |
| **C — Outils repliables** | Recherche visible, filtres/surprise sous « Affiner ou me surprendre » | Une action supplémentaire et aucun gain de hauteur notable une fois fermé par rapport à A dans ce prototype | Accordéon sur tous formats pour préserver la prévisibilité | État développé annoncé, résumé au clavier, focus visible; cibles ≥44 px |

Mesures du prototype à 390×844 : bouton Voir l’activité à y≈521 pour A, 368 pour B, 522 pour C; tous visibles au-dessus du menu. Ce sont des mesures de maquette avec contenu illustratif, pas des gains de performance ni une preuve d’intégration. Dans l’app actuelle, toute la carte est cliquable; comparer son sommet à celui du bouton dédié serait trompeur.

Recommandation A : bénéfice net sans masquer de fonction ni ajouter un accordéon d’outils. B reste pertinent si la suggestion prime sur toute recherche. C n’apporte pas assez de gain de place pour compenser son clic supplémentaire.

## Contrat de préservation

Recherche, filtres, surprise, favoris, historique, détail, variantes, participation et récompenses sont conservés. Le prototype utilise un petit jeu fictif et n’exécute aucun parcours métier. Recherche saisissable mais moteur non connecté; favoris simplifiés; quelques filtres illustratifs seulement. Les panneaux indiquent leur périmètre. Aucune donnée utilisateur ni PIN utilisé.

Mapping prévu des catégories FilterBar :
- Le moment : moment, time, weather (durée/préparation/nettoyage/saison/météo selon les champs actuels).
- Les participants : format, age, autonomy (nombre/âge/présence adulte, sans modifier la règle métier).
- Le parent et le matériel : materials, parent, mess (matériel/énergie/humeur/bruit/rangement).
- Envies et découvertes : suggested, type, development (suggestions/type/compétences/objectifs).

Avant intégration, inventorier chaque champ de ActivityFilters sous ces groupes : aucun champ retiré implicitement. Les formulations liées à la présence adulte doivent décrire les mêmes valeurs stockées. L’ordre du catalogue, le choix automatique de routine et les états E17 restent hors périmètre.

Routines/Parent sont des vues de contexte de la même proposition, pas des écrans métier reconstruits. Le dessin météo illustratif du prototype n’est pas une nouvelle décision d’asset : W6 papier découpé reste la référence. Les outils Parent gardent leurs cinq intentions et leurs accès.

## Visuels et contrôles

- [Prototype interactif](http://127.0.0.1:8093/) : choix A/B/C, trois destinations, clair/sombre, titre long/sans résultat, filtres/détail/surprise.
- comparaison-mobile.png : trois variantes côte à côte; comparaison-tablette.png : les mêmes à largeur tablette.
- captures/ : 32 rendus; checks.json : dimensions et cibles. 3 variantes clair/sombre à 390/768, 320/1440 en clair, Routines/Parent 390/768 clair/sombre, filtres/détail 390 clair/sombre, états vide/long 320.
- Aucun débordement horizontal du document ni contrôle rendu sous 44×44 dans ces mesures. Pas une certification de l’app réelle ou des appareils natifs.
- Panneau : focus initial Fermer, Maj+Tab atteint la dernière action, Échap ferme et rend le focus à Filtres. Fond rendu inerte pendant l’ouverture.
- Avant : avant-activities-390.png et baseline.json mesurés dans l’app réelle sans changement de filtre ni ouverture d’activité.

## Todo

- [x] Relire décisions, code et preuves existantes; journaliser la reprise.
- [x] Préparer trois variantes du choix encore ouvert et les corrections communes.
- [x] Capturer mobile/tablette, limites et états; contrôler tailles/focus/fermeture.
- [x] Choix explicite : A — Tout à portée, réponse utilisateur « a ».
- [x] Prototype corrigé validé puis « construction G02 autorisée » reçu explicitement.
- [x] Intégrer les corrections dans les composants existants, sans nouvelle dépendance ni duplication des stores.
- [x] Rejouer les vrais filtres, favoris, historique et détail sur données fictives isolées; résultats dans [l’audit fonctionnel](../../FUNCTIONAL-AUDIT.md).
- [x] Contrôler les états vides et la grille directe sur le produit aux largeurs 320/390/768/1440; 1/2/3 colonnes et aucun débordement observé.
- [x] Contrôler le clavier sur les panneaux Activités, les cibles web et les thèmes clair/sombre à 390/768; TypeScript et Jest réussis.
- [x] Validation visuelle finale du produit par l’utilisateur : « je valide continue la suite » après présentation du rendu intégré.
- [ ] Contrôles sur appareil natif, grand texte et lecteur d’écran.

## Journal

2026-09-20 : réponse utilisateur « a » : option A — Tout à portée choisie explicitement. B et C non retenues, conservées avec leurs compromis; aucun motif supplémentaire fourni par l’utilisateur. Le choix de variante est acquis, l’autorisation explicite de construction reste attendue conformément à la méthode.

2026-09-20 : demande « continue la todo ». G01 non fermé implicitement. Préparation G02 autorisée comme suite documentaire/prototypage; aucune autorisation de code produit déduite. Variantes a/b/c v1 conservées sans décision ni rejet utilisateur à ce stade. A recommandée par l’agent, pas choisie par l’utilisateur.

Vérifications techniques de cette préparation : syntaxe JavaScript du prototype valide; TypeScript réussi; 17 suites Jest / 136 tests réussis. Aucun test nouveau ajouté pour une maquette séparée du produit.

## Correction utilisateur — grille directe

2026-09-20 : « retire l’activité unique […] affiche directement en cases alignées », capture annotée fournie. L’option A conserve recherche, filtres et surprise avant les résultats; le bloc vedette est supprimé. Défi silence rejoint les autres activités dans une grille homogène, sans supprimer l’activité du catalogue. Une colonne sur petit écran, deux à partir de 720 px, trois à partir de 1100 px; cartes étirées et actions alignées par rangée. Cette correction remplace la suggestion isolée décrite plus haut. Version précédente et comparatifs conservés dans archive-v1/; motif : refus d’une activité isolée mise en avant. Aucun code produit modifié; autorisation de construction G02 toujours attendue.

### Validation du prototype corrigé

2026-09-20 : « ok valide » valide explicitement le prototype A corrigé avec grille directe, sans activité vedette. Ce choix graphique est acquis et ne doit pas être redemandé. L’autorisation explicite de construction reste à recueillir selon AGENTS.md et GLOBAL-METHOD.md.

### Construction autorisée

2026-09-20 : « construction G02 autorisée ». Intégration de A corrigé, grille directe sans vedette et corrections communes engagée. Aucune nouvelle confirmation G02 nécessaire.

2026-09-25 : intégration produit réalisée. Recherche, filtres, favoris, historique, Surprise et détail ont été rejoués sur jeu fictif isolé; TypeScript et 146 tests réussis. Les mesures et captures finales du produit, les contrôles natifs et la validation visuelle finale restent ouverts. Le navigateur intégré était indisponible lors de cette reprise; aucune nouvelle observation UI n’est déduite de la seule compilation.

Reprise suivante : navigateur intégré disponible; produit contrôlé sur installation fictive `localhost.:8081`. Activités 1/2/3 colonnes, aucun débordement sur 320/390/768/1440 pour les trois destinations, clair/sombre à 390/768, retour du focus par Échap et URL nettoyées. Deux cibles Parent sous 44 px corrigées. Aucun essai sur appareil ni validation finale implicite. Voir [audit fonctionnel](../../FUNCTIONAL-AUDIT.md).

Validation utilisateur suivante : « je valide continue la suite », en réponse à la demande explicite de confirmer le rendu final de G02 dans l’app. G02 est validé visuellement; cela ne clôt pas les essais natifs G04 ni la réserve G01 distincte.
