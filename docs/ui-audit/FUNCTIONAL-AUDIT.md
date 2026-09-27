# Audit des actions — 2026-09-21

Demande : tour complet de l’app, chaque lien/clic et correction de l’action attendue. Reprise « reprends » le 21 septembre. Construction G02 déjà autorisée. Audit en cours : cette liste distingue essais réels, corrections et contrôles restants.

## Environnement

App Expo 8081; jeu fictif à `http://127.0.0.1:8094` via `functional/serve-fixture.mjs`. Origine et stockage séparés, sans lecture/copie des données familiales. Profil Audit, routine à deux étapes, PIN de test connu. Un deuxième enfant a été créé par le formulaire. Essais web à 390 px; contrôles responsive finaux à compléter. Aucun appareil natif testé.

## Essais réels déjà effectués

| Parcours | Résultat observé |
|---|---|
| Recherche Activités « yoga », effacer | 2 résultats puis retour aux 98 idées |
| Ajouter un favori et ouvrir Favoris | Yoga rigolo présent dans la collection |
| Détail, repères et variantes | Étapes et informations secondaires accessibles |
| Fin d’activité, sélection puis confirmation | Toast +1 étoile; Famille confirme 1 étoile pour Audit |
| Récentes | Activité consultée retrouvée |
| Filtres, quatre rubriques, durée 5 min | 5 résultats, toutes les rubriques accessibles |
| Surprise : Bouger/Dehors | Proposition ouverte dans le détail |
| Parent verrouillé, code faux puis correct | Refus explicite, puis accès à Parent |
| Rechargement direct de Parent | Écran PIN après rechargement, pas d’accueil exposé |
| Ajouter enfant vide | Message de validation, aucun ajout |
| Ajouter enfant, avatar/couleur, puis renommer | Deuxième enfant visible et nom mis à jour |
| Constructeur vide | Message de validation, aucune routine créée |
| Catalogue → modèle → nom modifié → deux enfants → enregistrer | Formulaire prérempli avant sauvegarde; deux copies créées ensuite |
| Routine active → pause → filtre → réactiver | Liste et état cohérents |
| Actions routine → partage → copier code | Code récupéré via presse-papiers; bouton export JSON actionné, fichier à contrôler |

## Corrections intégrées

- Même garde Parent pour l’accueil et les sous-pages, attente de l’hydratation des données persistées; tests de politique ajoutés.
- Import : suppression du double décodage des paramètres (un `%` isolé pouvait lever une exception).
- Activités : fermeture synchronisée avec la disparition des paramètres de détail/surprise.
- États `aria-checked`, `aria-selected`/`aria-pressed`, `aria-expanded` et rôles de boutons : la version installée de React Native Web ne transmet pas `accessibilityState`. Cases et interrupteurs maintenant exposés dans les essais.
- Partage JSON, export PDF et impression rétablis depuis les actions d’une routine; intitulé d’import rendu fidèle à sa destination.
- Catalogue : rétablissement des onglets par thème, absents lors du premier essai.
- Conteneurs de panneaux : suppression des rôles de boutons imbriqués introduits lors de la correction sémantique.
- Calendrier parent : sélection Zustand stabilisée; la création de repère ne provoque plus une boucle de rendu.
- Confirmation : panneau monté seulement lorsqu’il est actif; la demande de suppression ou de récompense reste visible au-dessus des actions.
- Premier enfant : redirection vers la création du PIN, puis vers Parent.
- Calendrier enfant : accès direct aux routines et activités liées depuis les suggestions du jour.
- Exécution reprise après une longue interruption : une durée aberrante n’est plus affichée.
- Paramètres Activités : fermeture du détail, de Surprise et retour à Découvrir retirent le paramètre d’URL au lieu de laisser une valeur vide. Vérification UI de ce dernier point en attente.
- Guide de démarrage : accès rétabli dans les réglages Parent; contenu réaccentué et couleurs liées au thème. Ouverture, quatre étapes et fermeture vérifiées. Le premier affichage et la fin du guide mettent désormais à jour leurs états locaux distincts.

## Parcours supplémentaires observés sur données fictives isolées

| Parcours | Résultat observé |
|---|---|
| Export code puis import, entrée malformée | Import réussi; erreur lisible pour `%` isolé |
| Duplication, corbeille et restauration | Copie créée; routine de test restaurée et retrouvée dans la liste |
| Calendrier parent et enfant | Repère hebdomadaire créé pour deux enfants, lien routine conservé; modes Demain, Dodos, Semaine ouverts |
| Progrès et récompense | Étoiles et badge après activité/routine; refus si solde insuffisant; échange confirmé puis délai de 7 jours affiché |
| Exécution de routine et enchaînement | Ordre des étapes, présence, humeur, fin et lancement automatique de la seconde routine observés |
| Tenue et météo | Panneau 24 articles, sélection; ville manuelle Paris et horaires de coucher modifiés |
| Routes historiques | `/today`, `/explore`, `/parent/catalog` redirigent vers leurs destinations attendues |
| Alias Activités | Favoris, historique, Surprise et détail par identifiant aboutissent aux états attendus |

Le contrôle initial avait été interrompu le 25 septembre quand le navigateur intégré n’était plus disponible. La reprise suivante sur une origine vide distincte `localhost.:8081` a permis de terminer les essais web ci-dessous sans utiliser les données familiales de `localhost:8081`.

## Reprise web sur installation fictive isolée

| Parcours | Résultat observé |
|---|---|
| Détail Activités et Surprise : ouverture puis fermeture | URL avec paramètre à l’ouverture, retour à `/activities` sans paramètre vide à la fermeture |
| Favori fictif, rechargement puis Favoris | Favori conservé; retour à Découvrir nettoie `view` dans l’URL |
| Recherche sans résultat puis effacement | État vide explicite et retour aux 98 idées |
| Guide Parent, quatre étapes et Terminer | Guide accessible depuis Réglages, progression et fermeture observées |
| Premier enfant fictif | Écran de création du PIN ouvert; correction du retour parasite `screen/params`, puis destination `/parent` vérifiée après rechargement |
| Annuler la création du PIN | Retour à Routines; menu Parent verrouillé et clic ramenant au PIN avec retour `/routines` |
| Détail et filtres au clavier | Focus initial dans le panneau; Échap ferme et rend le focus à la commande d’origine |
| Responsive web | Routines et Activités sans débordement à 320/390/768/1440; Parent sans débordement à ces largeurs avant création du premier enfant |
| Grille Activités | Une colonne à 320/390, deux à 768, trois à 1440 |
| Thème sombre | Trois destinations sans débordement à 390/768; aucune erreur console durant ces essais |

Parent révélait deux commandes « Idées et conseils » de 38 et 42 px : elles mesurent maintenant au moins 44 px, contrôlé après rechargement. La carte compacte place « Suivant » sous le texte pour laisser lire davantage le conseil. Les titres des cartes Activités sont annoncés comme niveau 2, sous le titre de page niveau 1; l’état vide Routines a un titre de niveau 1.

## Contrôles restants

Essais natifs sur appareil (permissions, retour système, lecteur d’écran, grand texte), validation visuelle finale par l’utilisateur et scénarios PIN nécessitant la saisie d’un nouveau code. Un export natif ne remplace pas ces interactions. Les suppressions définitives et permissions système n’ont pas été effectuées dans le navigateur.

Le 25 septembre : TypeScript strict réussi (`node --max-old-space-size=1024 node_modules/typescript/bin/tsc --noEmit`); Jest : 19 suites et 146 tests réussis. Ces tests ne remplacent pas les contrôles UI restants.

Après les corrections de la reprise web : TypeScript strict réussi; 19 suites et 147 tests réussis; `git diff --check` sans erreur. Les exports de production web, Android et iOS avaient réussi avant ces dernières retouches; aucun appareil natif n’a été utilisé.

Après validation visuelle G02 et raccordement des états du guide : TypeScript strict réussi, 19 suites et 148 tests réussis, `git diff --check` sans erreur. Les interactions sur appareil restent non testées.

Revue G04 de l’écran Météo : les cartes de lieu et de résumé passent sur une colonne lorsque l’espace de contenu est inférieur à 600 px, évitant leur minimum de largeur sur écran 320 px. « Choisir une ville » après refus de localisation a une cible de 44 px. TypeScript strict et 148 tests réussis; comportement de permission et rendu natif non vérifiés sur appareil.

Le 26 septembre, correction du cas « permission accordée, position indisponible » : erreur explicite et choix d’une ville, sans météo parisienne silencieuse. Le géocodage inverse peut échouer sans invalider les coordonnées obtenues; le lieu devient « Ma position ». Trois tests ciblés couvrent le refus, l’échec de position et l’absence de nom de lieu; TypeScript strict et 151 tests réussis. Les permissions réelles et l’affichage natif restent non vérifiés.

Suite du 26 septembre : une ville invalide n’est plus sauvegardée avant la réponse météo; une actualisation ignorée ou en échec n’affiche plus un succès. Le store retourne un résultat explicite, couvert par deux tests supplémentaires. TypeScript strict et 153 tests réussis. Le formulaire Météo et les permissions système n’ont pas été rejoués sur appareil.

Dernière reprise du 26 septembre : recherche « yoga » conservée et focus Parent restauré après annulation du PIN sur le dernier bundle web. Exports de production web, Android et iOS réussis sur le code actuel. Les commandes de taille du navigateur n’ont pas appliqué de nouvelle largeur mesurable; aucune nouvelle preuve responsive n’est revendiquée. Les interactions iOS/Android sur appareil restent non vérifiées.

Suite G04 : l’écran Météo nomme explicitement pour l’accessibilité le champ de ville, la localisation automatique, chaque interrupteur de sieste par jour et chaque commande horaire par type et jour; le choix d’enfant expose son état sélectionné. TypeScript et 153 tests réussis. Vérification lecteur d’écran sur appareil toujours nécessaire.

Dernière correction G04 : deux mises à jour météo chevauchées ne peuvent plus inverser le lieu affiché; une réponse dépassée est ignorée. Test de réponse inversée ajouté; TypeScript et 154 tests réussis. Le comportement réseau sur appareil reste à contrôler.

Après cette correction, les exports de production web, Android et iOS du code actuel ont réussi. Aucun de ces exports ne valide le comportement natif sur appareil.

Suite accessibilité : le menu attend l’hydratation du PIN avant d’annoncer Parent déverrouillé; l’état verrouillé est affiché après rechargement web du jeu fictif. Le hook de mouvement réduit commence sans animation et gère l’échec de lecture de la préférence système. TypeScript et 154 tests réussis. Les interactions avec le lecteur d’écran et le réglage système restent à vérifier sur appareil.
