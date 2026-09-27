# Prototype Activités — A + C

Prototype local séparé du code réel. Il consolide « La question du moment » avec une touche de « Constellation d’idées ».

## Ce qui est représenté

- shell commun, thème clair/sombre et navigation basse persistante ;
- outils compacts, trois onglets sur une ligne et compteur unique ;
- surprise en trois questions et filtres regroupés en quatre intentions ;
- galet de suggestion, cartes à trois repères maximum et grille 1/2/3 colonnes ;
- favoris, récentes, aucun résultat et contenu long ;
- détail, confirmation des participants et attribution explicite de l’étoile ;
- cibles de 44 px, rôles, fermeture par Échap et restitution du focus ;
- aucun mouvement décoratif et respect de `prefers-reduced-motion`.

Ouvrir `activities-ac.html`. Les états sont disponibles par `?theme=dark`, `?view=favorites|recent`, `?state=empty|long` et `?overlay=filters|surprise|detail|completion`.

Régénération locale : `node capture.mjs` depuis ce dossier.
