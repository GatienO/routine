# Vérification des Routes

## Navigation principale

- [x] `/routines` : onglet Routines, réutilise la vue enfant
- [x] `/activities` : onglet Activités
- [x] `/parent` : onglet Parent
- [x] `/today` : redirection vers `/routines`
- [x] `/explore` : redirection vers `/activities`
- [x] `/` : entrée de l'application
- [x] `/pin` : protection parent

## Routines et enfant

- [x] `/child` : source de l'expérience routines
- [x] `/child/home` : redirection historique
- [x] `/child/summary` : résumé avant lancement
- [x] `/child/run` : exécution étape par étape
- [x] `/child/pause` : pause
- [x] `/child/celebration` : fin de routine
- [x] `/child/rewards` : récompenses enfant
- [x] `/child/calendar` : calendrier enfant
- [x] `/child/mood` : humeur
- [x] `/child/participants` : participants
- [x] `/child/presence` : présence
- [x] `/child/wellness` : bien-être

## Activités

- [x] `/activities` : catalogue d'activités
- [x] `/activities/surprise` : suggestion surprise
- [x] `/activities/favorites` : favoris
- [x] `/activities/history` : historique
- [x] `/activities/activity-form` : route historique de filtres
- [x] `/activities/result` : route historique de résultat
- [x] `/activities/activity/[id]` : détail d'activité

## Parent

- [x] `/parent` : espace parent
- [x] `/parent/add-routine` : création de routine
- [x] `/parent/add-routine?catalog=1` : création avec catalogue ouvert
- [x] `/parent/catalog` : redirection vers la création avec catalogue
- [x] `/parent/edit-routine?id=...` : édition
- [x] `/parent/add-child` : création enfant
- [x] `/parent/children` : enfants
- [x] `/parent/routines` : gestion routines
- [x] `/parent/import` : import
- [x] `/parent/rewards` : récompenses
- [x] `/parent/stats` : statistiques
- [x] `/parent/calendar` : calendrier parent
- [x] `/parent/weather` : météo
- [x] `/parent/trash` : corbeille

## Checklist UX

- [x] La navigation principale contient 3 entrées.
- [x] Les pages enfant et calendrier gardent la navigation basse.
- [x] Le catalogue de routines s'ouvre en superposition depuis la création.
- [x] Choisir une routine du catalogue remplit le formulaire de création.
- [x] Les activités ont leurs écrans, favoris, historique et filtres.
- [x] Les anciennes routes ne cassent pas les liens existants.

## Commandes

```bash
npx tsc --noEmit
npm test -- --runInBand
```
