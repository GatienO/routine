# Démarrage Développeur

## Pré-requis

- Node.js compatible avec Expo 55
- npm
- Expo CLI via `npx expo`

## Installation

```bash
npm install
```

## Lancer l'app

```bash
npx expo start --web
```

URL locale habituelle :

```text
http://localhost:8081
```

## Routes utiles

```text
/routines
/activities
/parent
/parent/add-routine
/parent/add-routine?catalog=1
/parent/import
/child/calendar
```

## Vérifications

```bash
npx tsc --noEmit
npm test -- --runInBand
```

## Notes d'architecture

- Expo Router gère les routes dans `app/`.
- La navigation basse globale est dans `src/components/ui/AppBottomNavigation.tsx`.
- Les écrans de tabs sont dans `app/(tabs)/`.
- Les activités sont isolées dans `src/features/activities/`.
- Les routines utilisent les stores existants dans `src/stores/`.
- Les données restent locales avec AsyncStorage.

## Règles pratiques

- Ne pas ajouter de backend.
- Ne pas dupliquer les stores.
- Préserver les routes historiques avec redirection si nécessaire.
- Tester TypeScript avant de livrer.
- Garder les écrans mobiles lisibles et courts.
