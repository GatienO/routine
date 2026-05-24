# AGENTS.md - Guide pour Agents IA

Ce fichier décrit comment un agent IA doit travailler dans ce dépôt.

## Contexte Produit

Routine est une app Expo / React Native / TypeScript pour enfants et parents.

Objectif UX : une app simple, organisée en 3 intentions principales :

- **Routines** : choisir et lancer les routines.
- **Activités** : trouver une idée d'activité.
- **Parent** : gérer la configuration.

Ne pas revenir à une navigation longue ou technique.

## Stack

- Expo 55
- React Native 0.83
- TypeScript strict
- Expo Router
- Zustand
- AsyncStorage
- Reanimated
- Phosphor icons

Pas de backend.

## Routes importantes

```text
/routines
/activities
/parent
/parent/add-routine
/parent/add-routine?catalog=1
/parent/import
/child
/child/calendar
```

Routes historiques à préserver :

```text
/today -> /routines
/explore -> /activities
/parent/catalog -> /parent/add-routine?catalog=1
```

## Architecture

Garder les features séparées :

```text
src/features/activities
src/stores
src/components
src/constants
```

Les routes Expo Router restent dans `app/`.

Ne pas déplacer de logique métier dans `app/` si elle peut rester dans `src/`.

## Règles de modification

- Préserver TypeScript strict.
- Préserver Zustand et AsyncStorage.
- Ne pas ajouter de dépendance lourde sans raison forte.
- Ne pas ajouter de backend.
- Ne pas dupliquer les stores.
- Garder les anciennes routes accessibles ou redirigées.
- Préférer les composants existants.
- Vérifier l'UX mobile avant de conclure.
- Garder les textes courts et orientés action.

## UX

Pour les enfants :

- grosses cartes lisibles
- actions simples
- peu de texte
- icônes et étapes visibles
- feedback immédiat

Pour les parents :

- gestion claire
- actions regroupées par intention
- pas de menus interminables
- création de routine guidée

## Catalogue de routines

Le catalogue ne doit pas créer directement une routine.

Flux attendu :

1. Ouvrir `/parent/add-routine`.
2. Cliquer `Catalogue`.
3. Afficher la superposition avec tabs par thème.
4. Choisir une carte routine.
5. Remplir le formulaire.
6. Laisser le parent modifier puis enregistrer.

## Activités

L'espace Activités vient de MiniActivites et vit dans `src/features/activities`.

Conserver :

- recherche
- filtres
- surprise
- favoris
- historique
- détail d'activité

## Encodage

Tous les fichiers doivent rester en UTF-8.

Attention à ne pas produire de texte corrompu par un mauvais décodage. Si des caractères accentués ou des emojis apparaissent cassés, corriger l'encodage avant de continuer.

## Vérifications

Avant de terminer une modification :

```bash
npx tsc --noEmit
npm test -- --runInBand
```

Si une vérification ne peut pas être lancée, l'indiquer clairement.

## Git

Ne pas supprimer ou réinitialiser des changements utilisateur.

Avant un commit :

```bash
git status --short
git diff --check
```

Faire un message de commit clair, par exemple :

```text
docs: update app guides after navigation refactor
```
