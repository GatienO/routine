# Direction de design — PAGE-01 Routines

Decision du 2026-09-03 : **Deux temps, compact et centre sur l'enfant**.

## Promesse de la page

En moins de trois secondes, un enfant doit comprendre :

1. quelle routine il peut faire maintenant ;
2. comment la commencer ;
3. ou trouver une autre routine.

## Identite conservee

- palette pastel chaude existante : creme, vert sauge, lavande et peche ;
- cartes rondes et tactiles ;
- OpenMoji et avatar de l'enfant ;
- vocabulaire encourageant, phrases courtes et tutoiement ;
- meteo, progression et recompenses comme contexte motivant ;
- donnees et preferences locales, sans backend.

L'interface ne doit pas devenir un tableau de bord adulte miniature. Les ombres restent legeres, les couleurs conservent leur sens et une seule signature ludique est utilisee : le **petit chemin des etapes** de la routine recommandee.

## Hierarchie retenue

### Niveau 1 — agir maintenant

1. identite enfant compacte avec changement de profil ;
2. carte `Ta routine maintenant` avec nom, duree, 2 ou 3 etapes du chemin et bouton `Commencer` ;
3. lien principal secondaire `Choisir une autre routine` ;
4. entree explicite `Composer une session` pour conserver la multi-selection existante.

### Niveau 2 — contexte utile

1. progression de la semaine sous forme de resume sur mobile ;
2. meteo compacte et conseil vestimentaire ;
3. recompenses accessibles depuis l'identite enfant.

### Niveau 3 — explorer

L'explorateur, ferme par defaut, contient :

- recherche pleine largeur ;
- bouton de filtres avec compteur actif ;
- panneau de filtres en tiroir mobile et en ligne sur grand ecran ;
- liste compacte des routines ;
- pagination si plus de dix resultats ;
- etat vide avec action de reinitialisation des filtres.

La creation et la modification ne figurent pas comme actions normales de l'enfant. Elles passent par l'espace Parent. Dans l'etat sans routine, l'action devient `Demander a un parent`, puis utilise la protection PIN existante.

## Comportement responsive

| Largeur | Composition |
| --- | --- |
| 320–599 px | Une colonne, marges 16 px, routine recommandee en premier, resume hebdomadaire compact, recherche et filtres empiles. |
| 600–979 px | Une colonne large, grille hebdomadaire complete, controles de recherche sur deux zones flexibles. |
| 980–1199 px | Colonne principale routines + colonne secondaire contexte, sans dupliquer le contenu. |
| 1200 px et plus | Conteneur maximal 1100 px ; aucune extension artificielle des cartes. |

Regles mesurables :

- aucune largeur visible inferieure a 288 px a 320 px de viewport ;
- aucun `scrollWidth` superieur au `clientWidth` ;
- aucune action fixe ne recouvre le contenu ;
- toute cible interactive mesure au moins 44 x 44 px, cible enfant principale 56 px minimum ;
- titres de routine sur deux lignes maximum, sans couper un mot ;
- le bouton `Commencer` est visible dans le premier viewport a 320 x 800, hors clavier ouvert ;
- le contenu reste exploitable a 200 % de zoom Web.

## Interaction et mouvement

- selection simple : `Commencer` ouvre l'humeur, puis le resume ;
- composition : les cartes deviennent selectionnables et un dock apparait uniquement apres la premiere selection ;
- le dock reserve sa hauteur dans le scroll et ne concurrence pas la navigation ;
- Echap annule un dialogue ou un tiroir, sans valider ni naviguer ;
- le focus entre dans toute surface temporaire et revient au declencheur ;
- une seule reaction animee par action, entre 140 et 220 ms ;
- seule la transition vers le lancement peut atteindre 400 ms ;
- reduction des animations : transitions immediates ou inferieures a 80 ms.

## Etats obligatoires du prototype

- routine recommandee disponible ;
- explorateur ouvert et ferme ;
- composition vide puis avec une et plusieurs selections ;
- recherche sans resultat ;
- aucun enfant ;
- aucune routine ;
- meteo en chargement et indisponible ;
- conseil vestimentaire replie et developpe ;
- dialogue enfant ;
- dialogue humeur ;
- textes longs et dix routines ou plus.

## Porte de construction

Ce document fixe la direction, mais ne vaut pas validation du prototype visuel. Le code applicatif ne doit commencer qu'apres presentation des captures du prototype consolide et validation explicite : `prototype valide — construction autorisee`.
