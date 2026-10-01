# Matrice de couverture — 2026-09-20

Fond commun (2026-10-01) : neuf surfaces représentatives ont été rejouées en clair/sombre à 390 px, et Routines, Activités, Parent et `/child/summary` à 768 px en clair, sur une famille fictive isolée. Un chargement prématuré de `/child/summary` a été corrigé. [Captures et méthode](./global-evidence-2026-10-01/README.md). Les autres routes ne sont pas déclarées individuellement vérifiées par cet échantillon.

G08 (2026-09-30) : le contrôle final a été rejoué sur export web local dans un profil Edge temporaire. Création/édition/réouverture de routine, étape, avatar et repère vérifiées; constructeur, sélecteur, Famille et calendrier Parent capturés à 320/390/768/1440 px en clair, avec contrôles sombres ciblés et défilement du sélecteur. Calendrier enfant, Activités et exécution fictive vus à 320 px. Repli OpenMoji vérifié avec CDN bloqué; fermeture Échap et retour du focus vérifiés. La [fiche G08](./lots/G08/REVIEW.md) garde les preuves et les limites, notamment l'absence de test sur la tablette physique et du grand texte système.

G08 (2026-09-29) : sélecteurs routine/étape/repère et avatars Famille constatés sur le site publié à largeur 1175 px; recherche et catégorie ajoutée vérifiées sans sauvegarde. Calendrier enfant semaine, Activités et thème sombre vus en lecture seule. Tests web du choix au-delà des 40 premières icônes et du repli d'image importée réussis. Les corrections responsive 320 px sont intégrées dans le code mais non capturées sur cette largeur; aucune vérification native n'est revendiquée.

G08 ajoute un [inventaire ciblé des visuels](./lots/G08/REVIEW.md) sur les trois intentions : choix de pictogrammes dans le constructeur et le calendrier, avatars enfant, vignettes Activités, images de météo et récompenses, et composant partagé `OpenMoji`. Les constats sont issus du code; aucune vérification sur la tablette de l'utilisateur n'est revendiquée.

Lot G07 terminé : le premier démarrage relie `/onboarding/family`, `/pin`, `/onboarding/child`, `/onboarding/complete` et `/routines`. Le parcours complet au clic, les retours, les reprises après rechargement et le rendu 320/390/768 px ont été vérifiés sur navigateur isolé. Voir [G07/REVIEW.md](./lots/G07/REVIEW.md).

42 fichiers de route hors layouts, 4 layouts, 3 destinations principales après l'ajout des trois routes G07. Cette matrice garantit un rattachement, pas une validation de toutes les fonctions.

Mise à jour du 25 septembre : la colonne « Couverture actuelle » ci-dessous conserve l’état d’inventaire initial du 20 septembre. Les parcours fonctionnels effectivement rejoués depuis sont consignés dans [FUNCTIONAL-AUDIT.md](FUNCTIONAL-AUDIT.md), notamment les alias historiques, Activités, Parent/PIN, Famille, routines, calendrier, récompenses et météo.

Suite du 25 septembre : URL Activités, guide, responsive web et navigation clavier rejoués; rendu final G02 explicitement validé par l’utilisateur. Les colonnes historiques ci-dessous ne sont pas une liste de réserves encore actives. Les essais sur appareil restent ouverts dans [GLOBAL-AUDIT.md](GLOBAL-AUDIT.md).

Suite du 27 septembre : G05, routine favorite groupée pour plusieurs enfants, a été vérifié sur installation fictive web et validé visuellement par l’utilisateur. La todo globale a ensuite été validée et clôturée explicitement par l’utilisateur. Les interactions natives et avec lecteur d’écran réel ont été retirées du périmètre de clôture à sa demande; elles restent non testées. La colonne historique ci-dessous n’est pas une nouvelle todo. Voir [GLOBAL-AUDIT.md](GLOBAL-AUDIT.md).

Nouveau périmètre du 27 septembre : G06 examine le lancement, `/child/summary`, `/child/run`, la reprise et le minuteur. Son [diagnostic](./lots/G06/REVIEW.md) est partiel : lancement et rechargement observés sur famille fictive; pause, enchaînement, thèmes, tablette et cas longs restent à contrôler pour ce lot. Les colonnes de l’inventaire initial ne sont pas réécrites comme si ces parcours étaient désormais vérifiés.
Après autorisation G06, minuteur, pause et reprise ont été rejoués sur origine fictive web, ainsi que l’affichage 320/390/768 px, thème sombre et titre long à 320/390 px, et les commandes Parent au clavier. L’enchaînement d’une routine minutée avec une routine sans durée a été vérifié jusqu’à la célébration finale. La validation visuelle finale de l’utilisateur reste ouverte. Détails dans [G06/REVIEW.md](./lots/G06/REVIEW.md).
Clôture G06 : un second essai web isolé après les correctifs `/child/run` confirme l'étape et le minuteur visibles, la pause conservée après rechargement, sa reprise et l'absence de débordement à 320/390/768 px. Le test de rendu web passe. G06 ne figure plus dans la todo active; la fiche conserve les preuves et l'historique.

| Route | Surface | Nature | Source | Couverture actuelle |
|---|---|---|---|---|
| /activities | Activités | Écran / état | [app/(tabs)/activities.tsx](../../app/(tabs)/activities.tsx) | Code + écran observé; parcours partiel |
| /explore | Activités | Alias / redirection | [app/(tabs)/explore.tsx](../../app/(tabs)/explore.tsx) | Routage lu; parcours UI non testé |
| / | Routines / accueil | Alias / redirection | [app/(tabs)/index.tsx](../../app/(tabs)/index.tsx) | Routage lu; parcours UI non testé |
| /parent | Parent | Écran / état | [app/(tabs)/parent.tsx](../../app/(tabs)/parent.tsx) | Accueil/settings observés après déverrouillage utilisateur, clair/sombre 390/768; retour depuis Import vérifié en G01; parcours métier non exhaustifs |
| /routines | Routines / accueil | Écran / état | [app/(tabs)/routines.tsx](../../app/(tabs)/routines.tsx) | Code + écran observé; parcours partiel |
| /today | Routines / accueil | Alias / redirection | [app/(tabs)/today.tsx](../../app/(tabs)/today.tsx) | Routage lu; parcours UI non testé |
| /activities/activity-form | Activités | Alias / redirection | [app/activities/activity-form.tsx](../../app/activities/activity-form.tsx) | Routage lu; parcours UI non testé |
| /activities/activity/[id] | Activités | Alias / redirection | [app/activities/activity/[id].tsx](../../app/activities/activity/[id].tsx) | Routage lu; parcours UI non testé |
| /activities/favorites | Activités | Alias / redirection | [app/activities/favorites.tsx](../../app/activities/favorites.tsx) | Routage lu; parcours UI non testé |
| /activities/history | Activités | Alias / redirection | [app/activities/history.tsx](../../app/activities/history.tsx) | Routage lu; parcours UI non testé |
| /activities/result | Activités | Alias / redirection | [app/activities/result.tsx](../../app/activities/result.tsx) | Routage lu; parcours UI non testé |
| /activities/surprise | Activités | Alias / redirection | [app/activities/surprise.tsx](../../app/activities/surprise.tsx) | Routage lu; parcours UI non testé |
| /child/calendar/day | Calendrier enfant | Écran / état | [app/child/calendar/day.tsx](../../app/child/calendar/day.tsx) | Routage lu; parcours UI non testé |
| /child/calendar | Calendrier enfant | Écran / état | [app/child/calendar/index.tsx](../../app/child/calendar/index.tsx) | Code + écran observé; parcours partiel |
| /child/calendar/week | Calendrier enfant | Écran / état | [app/child/calendar/week.tsx](../../app/child/calendar/week.tsx) | Routage lu; parcours UI non testé |
| /child/celebration | Exécution | Écran / état | [app/child/celebration.tsx](../../app/child/celebration.tsx) | Routage lu; parcours UI non testé |
| /child/home | Routines / accueil | Alias / redirection | [app/child/home.tsx](../../app/child/home.tsx) | Routage lu; parcours UI non testé |
| /child | Routines / accueil | Alias / redirection | [app/child/index.tsx](../../app/child/index.tsx) | Routage lu; parcours UI non testé |
| /child/mood | Préparation | Alias / redirection | [app/child/mood.tsx](../../app/child/mood.tsx) | Routage lu; parcours UI non testé |
| /child/participants | Préparation | Alias / redirection | [app/child/participants.tsx](../../app/child/participants.tsx) | Routage lu; parcours UI non testé |
| /child/pause | Exécution | Écran / état | [app/child/pause.tsx](../../app/child/pause.tsx) | Routage lu; parcours UI non testé |
| /child/presence | Préparation | Alias / redirection | [app/child/presence.tsx](../../app/child/presence.tsx) | Routage lu; parcours UI non testé |
| /child/rewards | Progrès (alias) | Alias / redirection | [app/child/rewards.tsx](../../app/child/rewards.tsx) | Routage lu; parcours UI non testé |
| /child/run | Exécution | Écran / état | [app/child/run.tsx](../../app/child/run.tsx) | Routage lu; parcours UI non testé |
| /child/summary | Préparation | Écran / état | [app/child/summary.tsx](../../app/child/summary.tsx) | Code + écran observé; parcours partiel |
| /child/wellness | Exécution | Écran / état | [app/child/wellness.tsx](../../app/child/wellness.tsx) | Routage lu; parcours UI non testé |
| /parent/add-child | Parent | Écran / état | [app/parent/add-child.tsx](../../app/parent/add-child.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/add-routine | Parent | Écran / état | [app/parent/add-routine.tsx](../../app/parent/add-routine.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/calendar | Parent | Écran / état | [app/parent/calendar/index.tsx](../../app/parent/calendar/index.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/catalog | Parent | Alias / redirection | [app/parent/catalog.tsx](../../app/parent/catalog.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/children | Parent | Écran / état | [app/parent/children.tsx](../../app/parent/children.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/edit-routine | Parent | Écran / état | [app/parent/edit-routine.tsx](../../app/parent/edit-routine.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/import | Parent | Écran / état | [app/parent/import.tsx](../../app/parent/import.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/rewards | Parent | Écran / état | [app/parent/rewards.tsx](../../app/parent/rewards.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/routines | Parent | Écran / état | [app/parent/routines.tsx](../../app/parent/routines.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/stats | Parent | Écran / état | [app/parent/stats.tsx](../../app/parent/stats.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/trash | Parent | Écran / état | [app/parent/trash.tsx](../../app/parent/trash.tsx) | Routage lu; parcours UI protégé, non testé |
| /parent/weather | Parent | Écran / état | [app/parent/weather.tsx](../../app/parent/weather.tsx) | Routage lu; parcours UI protégé, non testé |
| /pin | PIN | Écran / état | [app/pin.tsx](../../app/pin.tsx) | Code + écran observé; parcours partiel |
| /onboarding/family | Premier démarrage | Écran / état | [app/onboarding/family.tsx](../../app/onboarding/family.tsx) | Clics, retour, reprise et rendu 320/390/768 px vérifiés sur profil isolé |
| /onboarding/child | Premier démarrage | Écran / état | [app/onboarding/child.tsx](../../app/onboarding/child.tsx) | Création unique, retour, reprise, clair/sombre et rendu 320/390/768 px vérifiés |
| /onboarding/complete | Premier démarrage | Écran / état | [app/onboarding/complete.tsx](../../app/onboarding/complete.tsx) | Reprise, ouverture de l’accueil et rendu 320/390/768 px vérifiés |

## Fonctions transversales à ne pas oublier

| Surface / fonction | Source principale | Vérifié maintenant | Contrôle restant |
|---|---|---|---|
| Profil local, hydratation, tutoriel | LocalProfileGate, localProfileStore, AppTutorialModal | Lecture code; tutoriel sans appel repéré | Installation isolée, erreurs de stockage, accès à l'aide |
| Thèmes, header/menu, feedback, installation web | AppBrandHeader, AppBottomNavigation, AppFeedbackProvider, WebInstallHint | Thèmes/menu Routines et Activités; PIN | Clavier, toast/modal simultanés, installation native/web |
| Routine principale, reprise, regroupement, enchaînement | routines-home-screen, routineStore | Écran et préparation observés | Plusieurs enfants, chaîne, reprise après fermeture |
| Étapes, minuterie, pause, bien-être, fin | app/child/run, pause, wellness, celebration | Routage et points métier repérés | Parcours entier sur données de test; étoiles sans doublon |
| Météo, tenue, permission et fraîcheur | WeatherCard, OutfitPreparationOverlay, weatherStore, weatherTimeConfigStore | État chargé et panneau | Panne, permission refusée, données périmées, sélection manuelle |
| Activités et complétion | activities-home-screen, ActivityDetailOverlay, activity-store | Découverte, filtres, détail, Favoris vide | Recherche/Surprise/retour complet; participation et étoiles sur test |
| Famille/avatar/préférences | family-screen, childrenStore | Inventorié/code | Ajout/édition/annulation et relations aux routines |
| Création/édition/catalogues/ordre/duplication | routine-builder-screen, parent-routines-screen | Lecture code du préremplissage/sauvegarde | Parcours UI protégé; saisie non perdue et erreurs locales |
| Calendrier parent et enfant | parent-calendar-screen, AccompaniedCalendarExperience, calendarStore | Vue Maintenant et fermeture | Demain/Dodos/Semaine, répétitions, dates limites, liens supprimés |
| Progrès/étoiles/badges/récompenses | progress-screen, rewardStore, realRewardStore | Inventorié/code | Dépense, délais, multi-enfants et absence de double attribution |
| Partage, impression, export, fusion | sharing, exportRoutine, RoutineShareModal, CompactRoutineRows, mergeIds du constructeur | Code ancien présent; accès actuels non repérés | Décider/rétablir les accès, tester export→import et fidélité des données |
| Import/corbeille/restauration/expiration | DataToolsScreen, routineStore | Inventorié/code | Payload invalide, aperçu, doublons, restauration et expiration sur test |
| Sécurité et liens profonds | pin, ParentLayout, RootShell, navigation | PIN et annulation observés | Politique d'accès direct, relance/hydratation, modification de PIN par l'utilisateur |
| Persistance et performance | 10 stores src/stores + activity-store | Structure inventoriée | Migrations, réseau lent/hors ligne, listes longues, relance, budget de performance mesuré |

Les tests unitaires existants ne remplacent aucun parcours UI de cette table. Toute fonction non testée reste explicitement ouverte; aucune suppression de fonction ancienne n'est autorisée par cet inventaire.
