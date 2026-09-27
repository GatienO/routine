# Baseline technique avant reconstruction

Date : 2026-09-13

## Vérifications initiales

- TypeScript strict : réussi avec `npx tsc --noEmit`.
- Tests : 12 suites et 71 tests réussis avant le premier lot du shell.
- Travail local uniquement : aucune publication ni mise en ligne.
- Le dépôt contenait déjà de nombreux changements non validés dans Git ; ils sont conservés.
- Le navigateur web ne remonte aucune erreur d'exécution sur le shell. Des avertissements préexistants restent à traiter pour les anciennes propriétés d'ombre, `pointerEvents` et une interaction Reanimated.

## Contrat de navigation

Destinations persistantes :

- `/routines`
- `/activities`
- `/parent`

Compatibilité maintenue :

- `/` et `/today` redirigent vers `/routines` ;
- `/explore` redirige vers `/activities` ;
- `/parent/catalog` redirige vers `/parent/add-routine?catalog=1`.

La navigation globale est masquée sur `/pin`, toutes les routes `/child` et les formulaires Parent qui doivent devenir des superpositions.

## Propriétaires des données locales

| Clé AsyncStorage | Propriétaire | Rôle actuel |
| --- | --- | --- |
| `app-store` | `appStore` | PIN, contexte historique enfant, ville, géolocalisation, préférence de thème |
| `children-store` | `childrenStore` | enfants et profils locaux |
| `routine-store` | `routineStore` | routines et exécutions |
| `calendar-store` | `calendarStore` | repères et événements calendrier |
| `mood-store` | `moodStore` | humeur récente par enfant |
| `reward-store` | `rewardStore` | étoiles, séries et badges virtuels |
| `real-reward-store` | `realRewardStore` | récompenses définies par le parent et retraits |
| `weather-time-config-store` | `weatherTimeConfigStore` | plages horaires météo |
| `local-profile-store` | `localProfileStore` | profil local du parent |
| `mini-activites-storage` | `activityStore` | favoris et historique Activités |
| `routine_weekly_progress` | `WeeklyProgress` | progression hebdomadaire locale |
| `parent_tips_collapsed` | `ParentingTips` | état replié des conseils |
| `weather-cache:*` | service météo | cache par ville, géolocalisation ou défaut |

## Décisions de consolidation différées

- `mood_log` n’est pas utilisé par le code actuel ; ne rien supprimer avant vérification des anciennes données réellement stockées sur appareil.
- `reward-store` et `real-reward-store` ont deux responsabilités distinctes : progression virtuelle d’un côté, récompenses parentales de l’autre. Ils ne doivent pas être fusionnés sans modèle de migration.
- `selectedChildId` reste temporairement dans `app-store` pour compatibilité, mais ne doit plus piloter le shell global. Sa suppression appartient à `LOG-03` après migration des consommateurs.
