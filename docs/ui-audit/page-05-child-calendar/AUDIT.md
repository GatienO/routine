# Audit — PAGE-05 — Calendrier enfant

Date : 2026-09-14

## Rôle attendu

Le calendrier est un support de conversation entre l'adulte et l'enfant. Il aide à comprendre `maintenant`, `après`, `demain` et le nombre de `dodos`. Ce n'est ni un planning familial ni un espace autonome par enfant.

## État réel observé

- Une route enfant unique existe déjà : `/child/calendar`.
- Les modes `Aujourd'hui`, `Semaine`, `Dodos` et `Demain` sont présents.
- Les événements peuvent référencer une routine ou une activité sans dupliquer leur contenu.
- Le store local conserve les dates exactes, heures, enfants concernés et liens métier.
- Une configuration Parent existe dans `/parent/calendar`.

## Incohérences à corriger

- L'écran ressemble à un tableau de bord enfant autonome : humeur, météo, cloche, progression en pourcentage, routines et événements se concurrencent.
- Le sélecteur et le message d'accueil donnent l'impression d'une page personnelle par enfant.
- `Après` n'est pas un mode explicite alors qu'il s'agit du repère le plus concret après `Maintenant`.
- La progression de journée en pourcentage est abstraite et peut créer une sensation de retard.
- La vue semaine et l'ajout direct depuis l'écran enfant mélangent consultation accompagnée et configuration Parent.
- Les textes historiques comportent plusieurs accents manquants.
- Le style calendrier possède sa propre palette et ne suit pas encore Pastel utile clair/sombre.
- La configuration Parent est une page longue avec formulaire, liste et nombreux choix visibles simultanément.

## Direction de reconstruction

1. Ouvrir le calendrier comme expérience accompagnée depuis Routines, sans navigation technique.
2. Afficher d'abord une frise très courte : `Maintenant` puis `Après`.
3. Donner accès à `Demain`, `Dodos` et `Semaine` comme vues secondaires simples.
4. Réserver création, modification, récurrence et rattachement aux outils Parent.
5. Garder les dates et heures exactes dans le modèle, mais les traduire en repères concrets côté enfant.
6. Remplacer pourcentage et retard par des transitions calmes : matin, midi, après-midi, soir, nuit.
7. Réutiliser `ResponsiveOverlay` pour créer ou modifier un repère sans ajouter de nouvelles pages.

## Éléments à préserver

- `calendarStore` et sa persistance locale.
- Les liens par identifiants vers routines et activités.
- Les calculs de semaine et de dodos déjà testés.
- Les routes historiques, redirigées ou utilisées comme états route-backed.
