> Inventaire historique de reconstruction, pas état actuel. Plusieurs constats ci-dessous (quatre entrées, anciens écrans) sont dépassés. Cartographie actuelle : ../ui-audit/GLOBAL-COVERAGE.md; constats actuels : ../ui-audit/GLOBAL-AUDIT.md. Les anciennes fonctions restent à préserver ou à décider explicitement.

# Inventaire actuel de l'application

## Méthode et périmètre

L'inventaire combine le tour de l'application réellement servie sur `http://localhost:8081/` et l'inspection des routes Expo Router. Il ne s'agit pas d'une reconstruction. Les pages protégées par PIN ont été inventoriées depuis leur code sans contourner la protection.

Légende cible :

- **Destination** : reste une entrée persistante de premier niveau.
- **Immersif** : reste une vraie route plein écran parce que l'utilisateur doit rester concentré.
- **Superposition** : devient une feuille, un dialogue ou un panneau au-dessus de la destination courante.
- **État** : devient un onglet, un mode ou une étape dans la même surface.
- **Redirection** : l'URL reste compatible mais ne possède plus sa propre interface.

## Constat global

- 39 fichiers de route hors layouts pour seulement 3 intentions produit.
- 4 entrées de navigation basse : Accueil, Routines, Activités, Parent.
- Accueil duplique les aperçus et raccourcis des trois autres destinations.
- Plusieurs parcours utilisent une route pour un simple filtre, détail, sélection ou état intermédiaire.
- Les pages Parent sont organisées comme un menu de pages techniques plutôt que comme un espace de travail.
- La page Parent de l'onglet est hors de `app/parent/_layout.tsx` : elle n'hérite donc pas de la protection PIN appliquée aux sous-routes.
- La navigation basse n'est masquée que sur `/pin`, y compris pendant des expériences enfant immersives.
- `/routines` importe directement le composant d'une autre route (`app/child/index.tsx`) au lieu d'utiliser un écran métier dans `src/`.
- Les écrans les plus centraux sont monolithiques : lanceur enfant 1 762 lignes, exécution 1 103 lignes, accueil 1 189 lignes, création de routine 1 390 lignes.
- Des écrans historiques semblent ne plus être appelés : `ParentDashboardScreen`, `RoutinesScreen`, `TodayScreen`, `ExploreScreen`.

## Navigation principale

| Route actuelle | Fonction observée | Diagnostic | Cible proposée |
|---|---|---|---|
| `/` | Accueil avec enfant, météo, activité surprise, récompenses, semaine et raccourcis Parent | Agrège et duplique les trois intentions | **Redirection** vers `/routines`; redistribuer seulement les informations utiles |
| `/routines` | Choix enfant, météo, progression, recherche, filtres, cartes et lancement | Bonne intention, trop d'éléments concurrents | **Destination** principale Routines |
| `/activities` | Recherche, surprise, favoris, filtres et longue liste d'activités | Bonne intention, densité élevée | **Destination** principale Activités |
| `/parent` | Gestion des enfants et accès aux outils Parent | Bonne intention, mais accès et organisation incohérents | **Destination** d'outils Parent, organisée en sections internes; sécurité ciblée sur les actions sensibles |
| `/today` | Alias historique | Aucun contenu propre nécessaire | **Redirection** conservée vers `/routines` |
| `/explore` | Alias historique | Aucun contenu propre nécessaire | **Redirection** conservée vers `/activities` |

## Espace Activités

| Route actuelle | Fonction observée | Diagnostic | Cible proposée |
|---|---|---|---|
| `/activities/surprise` | Choix Ambiance, Format, Lieu puis tirage | Tâche courte, perd le contexte de découverte | **Superposition** sur Activités |
| `/activities/favorites` | Liste ou état vide des favoris | Même collection avec un filtre différent | **État** `Favoris` dans Activités |
| `/activities/history` | Historique des activités ouvertes | Même collection avec un tri différent | **État** `Récentes` dans Activités |
| `/activities/activity/[id]` | Détail complet, matériel, objectifs, étapes et variantes | Un overlay de détail existe déjà dans le code | **Superposition route-backed** sur Activités |
| `/activities/activity-form` | Page d'information renvoyant vers les filtres | Résidu fonctionnel sans formulaire | **Redirection** vers `/activities?panel=filters` |
| `/activities/result` | Page d'information renvoyant vers la liste | Résidu d'un ancien parcours | **Redirection** vers `/activities` ou vers le détail concerné |

## Espace enfant et lancement de routine

| Route actuelle | Fonction observée | Diagnostic | Cible proposée |
|---|---|---|---|
| `/child` | Implémentation actuelle du lanceur de routines | Installe à tort un espace enfant permanent | **Redirection** vers `/routines` après extraction du lancement accompagné dans `src/` |
| `/child/home` | Alias de l'espace enfant | Un espace enfant permanent ne correspond pas à l'usage | **Redirection** vers `/routines` |
| `/child/summary` | Résumé et préparation de la routine sélectionnée | Étape du lancement, pas destination | **État** d'un `LaunchFlow` superposé |
| `/child/presence` | Présence/participants avant lancement | Étape courte du même parcours | **État** du `LaunchFlow` |
| `/child/participants` | Ancien alias vers le résumé | N'apporte aucun écran distinct | **Redirection** vers l'étape compatible du `LaunchFlow` |
| `/child/mood` | Humeur de l'enfant | La sélection d'humeur existe déjà en modal ailleurs | **État** du `LaunchFlow` ou feuille contextuelle |
| `/child/run` | Exécution pas à pas de la routine | Expérience focalisée légitime | **Immersif** plein écran, sans navigation basse |
| `/child/pause` | Pause pendant l'exécution | État interne à l'exécution | **Superposition** dans `/child/run` |
| `/child/wellness` | Pause/bien-être guidé | Peut nécessiter toute l'attention | **Immersif** lié à l'exécution, sans navigation basse |
| `/child/celebration` | Réussite et fin de routine | Conclusion narrative | **Immersif court** puis retour Routines |
| `/child/rewards` | Étoiles, badges, récompenses et filtres | Information contextuelle depuis Routines | **Superposition route-backed** depuis Routines |
| `/child/calendar` | Calendrier avec vue et timeline | Fonction majeure de repérage temporel encore incomplète | **Calendrier enfant route-backed**, visuel et parcouru avec le parent |
| `/child/calendar/day` | Même calendrier forcé en mode jour | Le mode ne justifie pas une page | **État** `Jour` du calendrier |
| `/child/calendar/week` | Même calendrier forcé en mode semaine | Le mode ne justifie pas une page | **État** `Semaine` du calendrier |

## Espace Parent

| Route actuelle | Fonction observée | Diagnostic | Cible proposée |
|---|---|---|---|
| `/parent/children` | Gestion des profils enfants | Fonction cœur du Parent | **Section** `Famille` |
| `/parent/add-child` | Création/édition de profil | Formulaire contextuel | **Superposition** unique créer/modifier |
| `/parent/routines` | Recherche, organisation, fusion et création | Fonction cœur du Parent | **Section** `Routines` |
| `/parent/add-routine` | Constructeur guidé avec étapes et catalogue | Parcours riche mais contextuel | **Feuille plein écran route-backed** |
| `/parent/edit-routine` | Variante très proche du constructeur | Duplication importante du formulaire | **Même constructeur**, mode édition |
| `/parent/catalog` | Alias historique du catalogue | Le catalogue est déjà une superposition du constructeur | **Redirection** conservée vers `/parent/add-routine?catalog=1` |
| `/parent/calendar` | Configuration d'événements et liens routine/activité | Préparation du calendrier enfant | **Section** `Calendrier`; édition en feuille |
| `/parent/stats` | Progression, séries et activité récente | Fonction de suivi | **Section** `Progrès`, onglet `Suivi` |
| `/parent/rewards` | Gestion des récompenses réelles | Fonction de suivi/récompense | **Section** `Progrès`, onglet `Récompenses` |
| `/parent/weather` | Lieu, géolocalisation et horaires météo | Réglage, pas destination | **Superposition** dans `Réglages` |
| `/parent/import` | Import texte, lien ou JSON avec aperçu | Outil occasionnel | **Superposition plein écran** dans `Réglages` |
| `/parent/trash` | Restauration de routines supprimées | Outil occasionnel | **Superposition** dans `Réglages` |
| `/pin` | Saisie du code Parent | Frontière de sécurité, pas rubrique | **Gate global** conservé; retour précis au contexte demandé |

## Ce qui existe déjà et doit être réutilisé

- `ActivityDetailOverlay` pour le détail d'activité.
- `FilterBar` et ses filtres en modal.
- `MoodPicker` pour l'humeur.
- catalogues de routines et d'étapes déjà superposés dans le constructeur.
- `CalendarLinkPicker` pour associer routines et activités.
- superpositions de création et validation dans les récompenses Parent.
- pickers partagés pour catégorie, icône et couleur.
- file globale de feedback de l'application.
- stores Zustand et persistance AsyncStorage existants.

## Dette logique à vérifier pendant la reconstruction

- Clarifier `rewardStore` (progression virtuelle) et `realRewardStore` (récompenses concrètes) par des noms et façades métier explicites, sans fusion aveugle.
- Vérifier la double gestion de l'humeur : store Zustand et écriture directe dans AsyncStorage sous `mood_log`.
- Supprimer la sélection globale d'un enfant courant; associer explicitement les participants aux routines, événements et suivis.
- Extraire les règles de lancement de routine de `app/child/index.tsx` vers une feature testable.
- Réunir création et édition de routine autour d'un schéma et d'un composant communs.
- Définir une source unique pour les états de calendrier `jour/semaine`.
- Séparer le modèle Parent, fondé sur dates et horaires, de la représentation enfant, fondée sur Maintenant / Après / Demain / Dodos.
- Définir les règles d'apparition automatique des routines dans la journée sans dupliquer les événements stockés.

## Limites de cet inventaire

- Les pages protégées ont été lues dans le code mais non ouvertes après saisie d'un PIN.
- Les états erreur, chargement, permissions refusées et données extrêmes restent à capturer page par page.
- Aucun écran n'est déclaré « validé » par ce document : il prépare la file de travail globale.
