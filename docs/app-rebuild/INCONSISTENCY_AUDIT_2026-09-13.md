# Audit de cohérence après reprise

Date : 2026-09-13

## Résultat global

La navigation principale est désormais correcte, mais les contenus internes proviennent encore de plusieurs générations de conception. Le problème principal n'est plus le nombre d'onglets : ce sont les anciens écrans qui continuent à présenter l'application comme un espace personnel d'enfant ou comme une collection de menus techniques.

## Priorité 0 — structure produit

### Routines

- `/routines` monte encore directement l'ancien lanceur de `app/child/index.tsx`.
- L'écran commence par une météo très expressive, puis « Bonjour Emma », les étoiles et la semaine : il ressemble encore à une page personnelle d'enfant.
- Le choix d'enfant global influence plusieurs écrans alors que les enfants doivent être choisis comme participants d'une action.
- Recherche, filtres, tri, favoris, étapes, météo, calendrier, récompenses et lancement cohabitent sur la même surface.
- L'action « lancer » arrive trop tard et son état désactivé reste fixé au-dessus du contenu.

Décision : reconstruire `/routines` comme outil parental court — recommandation, routines disponibles, choix des participants au lancement — puis ouvrir le mode accompagné en plein écran.

### Parent

- L'ancien accueil Parent plaçait une grande carte Emma avant les outils et employait « Mon enfant » au singulier.
- Les fonctions étaient séparées en une longue liste mélangeant calendrier, récompenses, statistiques et réglages.

Correction lancée : nouvel accueil Parent organisé en cinq intentions — Famille, Routines, Calendrier, Progrès, Réglages — avec les réglages secondaires repliés sur place.

### Calendrier accompagné

- La fonction est bien distincte d'un planning familial et possède déjà les repères Aujourd'hui, Semaine, Dodos et Demain.
- À 390 px, les sept jours sont trop serrés : les libellés `LUNMARMER...` se touchent.
- La vue additionne météo, humeur, notifications, routines et événements. La hiérarchie « maintenant / après / demain » n'est pas encore dominante.
- L'identité d'un enfant est trop présente ; elle doit être un contexte accompagné, pas une page personnelle persistante.

Décision : conserver les données et reconstruire la représentation enfant autour de Maintenant, Après, Demain et Dodos.

## Priorité 1 — cohérence visuelle

- Le nouveau shell et le nouvel accueil Parent suivent Pastel utile, mais les écrans historiques utilisent encore d'anciens dégradés plus saturés.
- Le mode sombre fonctionne sur le shell, le nouvel accueil Parent et l'accueil du profil local ; il reste à migrer écran par écran.
- Certaines surfaces utilisent de fortes ombres partout alors que l'identité limite la profondeur aux cartes soulevées et superpositions.
- Les coins, espacements et poids typographiques varient fortement entre Routines, Activités, Calendrier et Parent.

## Priorité 1 — Activités

- Une carte affiche presque toutes les métadonnées disponibles : note, âge, autonomie, joueurs, énergie, lieu, matériel, préparation et type.
- Plusieurs libellés restent sans accents ou mélangent les vocabulaires : `Activites`, `Creatif`, `Exterieur`, `SOLO`.
- Le même détail semble exposer plusieurs cibles accessibles « Ouvrir », ce qui doit être simplifié.
- Surprise et Favoris sont bien présents mais ne sont pas encore traités comme des états d'une collection unique.

Décision : conserver recherche, filtres, surprise, favoris et historique ; réduire chaque carte aux informations nécessaires pour choisir.

## Priorité 2 — texte et accessibilité

- De nombreux textes français ont perdu leurs accents.
- Certains libellés techniques ou ambigus subsistent : `Pret a 23h25`, `~24 min 30`, `Custom`, `Auto. forte`.
- Le document ne déborde plus horizontalement à 320, 390 et 768 px, mais certains carrousels internes restent trop comprimés.
- Les anciens avertissements web concernent les propriétés d'ombre, `pointerEvents` et une animation Reanimated.

## Ordre de correction confirmé

1. Finaliser le shell Parent et sa cohérence clair/sombre.
2. Reconstruire Routines comme outil parental, puis isoler le lancement accompagné.
3. Retirer la dépendance au choix global d'un enfant au profit de participants explicites.
4. Introduire la superposition responsive commune.
5. Simplifier Calendrier enfant.
6. Simplifier les cartes Activités et corriger le vocabulaire.
7. Migrer progressivement toutes les surfaces vers les tokens clair/sombre.
