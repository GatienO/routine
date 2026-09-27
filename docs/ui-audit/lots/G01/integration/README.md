# G01 — preuves d’intégration web, 2026-09-20

Produit réel sur localhost:8081, distinct du prototype sur 8092. 26 captures PNG et mesures dans checks.json. Routines, Activités, Parent et PIN en clair/sombre à 390/768; contrôles complémentaires à 320/1440, plus bas de liste Activités. Les captures Parent suivent le déverrouillage effectué par l’utilisateur. Aucun code secret lu ou enregistré.

## Résultats

- Barre basse bord à bord, commandes centrées à 720 px maximum, actif menthe + trait, icônes Regular, cadenas filaire uniquement quand verrouillé.
- Fond continu partagé derrière les commandes hautes; surfaces opaques, logo vers Routines. Le thème du navigateur de routes est transparent pour supprimer son ancien fond gris.
- Réserve basse unique dans le shell, mesurée selon la hauteur effective du menu; marges de fin des trois pages ramenées de 120 à 32 px.
- PIN dédié, thèmes clair/sombre, clavier/effacement/Échap, contraste et focus visibles; écran défilant à 320 ×568. Aucun bouton du cadre ou du PIN mesuré sous 44 ×44; aucun débordement horizontal du document dans les 26 captures. Les petites cibles du contenu Activités restent suivies en G02.
- Activités → PIN → Annuler : recherche « calme » conservée, Favoris restaurés, défilement à 1688 px conservé, focus rendu à Parent. Dernière action « Afficher 12 idées de plus » visible au-dessus du menu.
- Lien PIN direct après rechargement → Annuler : repli vers /activities?view=favorites observé. Destination protégée et origine validées séparément; URL externe et chemins ambigus rejetés par tests.
- Parent déverrouillé : cadenas absent; accueil/settings observés, Import ouvert puis Retour à Parent réussi. En quittant Parent, menu de nouveau verrouillé observé.
- Saisie clavier d’un seul chiffre puis effacement et Échap observés. Aucun essai de deviner le code existant ni modification de code.

## Vérifications et limites

TypeScript réussi. Jest : 17 suites, 136 tests, dont 27 cas de contrat PIN. git diff --check réussi. Aucun message console de niveau erreur dans le dernier relevé de l’onglet.

Non vérifiés : iOS/Android, bouton Retour natif, lecteur d’écran, texte système agrandi, création/confirmation et erreur de PIN sur jeu isolé. Les délais de remise à zéro existants sont conservés; aucun nouveau verrouillage temporisé inventé. Le code attend désormais l’hydratation avant de choisir création/saisie.

Le retour Sécurité → PIN → Parent a été corrigé après observation de l’ancien comportement, avec retour Parent accepté uniquement pour une session déjà déverrouillée. Contrat testé; ce chemin doit encore être rejoué sur le dernier bundle avec session déverrouillée. Le serveur de développement ne répercutait pas toutes les modifications sans rechargement; les captures montrent les changements visuels rechargés, mais ne prouvent pas ce dernier scénario.

G03-02 (garde de l’accueil /parent différent des sous-routes) reste ouvert; aucun contournement essayé. Aucun import, suppression, attribution ou fin de routine réalisés. Le thème a été remis en clair et le format du navigateur réinitialisé.

Le prototype a été validé; ces contrôles ne valent pas validation visuelle finale par l’utilisateur.
