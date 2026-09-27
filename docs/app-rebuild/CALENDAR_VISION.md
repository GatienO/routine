# Vision produit — Calendrier enfant

Date : 2026-09-12

Statut : décisions intégrées dans la base structurelle; finition visuelle à traiter page par page.

## Intention

Le calendrier est une interface conçue d'abord pour l'enfant. Elle l'aide à comprendre le temps avec des repères concrets plutôt qu'une grille d'agenda adulte. Le parent alimente les événements et parcourt l'interface avec lui.

Il doit permettre de répondre simplement à ces questions :

1. Qu'est-ce qui se passe maintenant ?
2. Qu'est-ce qui vient après ?
3. Qu'est-ce qui se passe demain ?
4. Dans combien de dodos arrive l'événement que j'attends ?
5. Où se placent mes routines dans ma journée et ma semaine ?

## Place dans l'application

Le calendrier est un système transversal :

- **Routines → Calendrier enfant** : accès rapide à Maintenant, Après, Demain, Semaine et Dodos.
- **Parent → Calendrier** : configuration des repères et événements destinés à l'enfant.
- **Vue accompagnée** : interface principale simple, ouverte et parcourue avec le parent.
- **Routines planifiées** : apparaissent automatiquement dans la journée de l'enfant.
- **Activités liées** : restent des suggestions ouvrables depuis un événement.
- **Progression** : peut montrer ce qui est accompli, sans transformer le calendrier en tableau de performance.

Il ne devient pas un quatrième onglet principal. Le parent choisit ponctuellement l'enfant concerné à l'ouverture, sans créer une page d'accueil différente pour chacun.

## Présentation accompagnée à l'enfant

Cette présentation n'est pas une zone de navigation autonome. Le parent tient ou contrôle l'appareil et s'en sert pour expliquer une transition, un événement ou le déroulement de la journée.

### Maintenant

- Une carte dominante montre le moment courant.
- Un repère visuel se déplace dans la journée.
- L'action possible est explicite : `Commencer`, `Voir` ou aucune action.
- Les horaires précis restent secondaires pour les plus jeunes.

### Après

- Montrer une ou deux étapes futures, jamais toute la journée en même temps.
- Utiliser une relation visuelle simple entre Maintenant et Après.
- Prévenir les transitions sans créer un compte à rebours stressant.

### Demain

- Donner un aperçu court : école ou maison, événement important, routine différente.
- Éviter une seconde timeline complète.
- Utiliser les mêmes pictogrammes que la vue Aujourd'hui.

### Dodos

- Traduire une date attendue en nombre de nuits.
- Toujours afficher aussi le jour ou la date pour accompagner l'apprentissage.
- Réserver ce mode aux événements significatifs : anniversaire, vacances, visite, fête, sortie.
- Éviter les formulations alarmantes et les gros décomptes animés.

### Cette semaine

- Représenter les jours par une bande stable, avec aujourd'hui clairement identifié.
- Montrer peu de pictogrammes par jour et ouvrir le détail à la demande.
- Distinguer les contextes connus : école, maison, activité, rendez-vous, événement spécial.

## Modèle Parent

Le parent manipule les données précises :

- titre et pictogramme ;
- enfant ou enfants concernés ;
- date, heure de début et éventuellement de fin ;
- journée entière ;
- catégorie ;
- répétition simple ;
- routine suggérée ou automatiquement lançable ;
- activité liée ;
- visibilité dans la présentation accompagnée ;
- importance pour le mode Dodos.

Une seule saisie Parent alimente le calendrier enfant et sa vue accompagnée. Aucun événement n'est copié pour produire Aujourd'hui, Demain ou Semaine.

## Principes pédagogiques

- Aller du concret vers l'abstrait : séquence, partie de journée, jour, semaine, puis date.
- Associer toujours couleur, pictogramme et texte; ne jamais coder une information par la couleur seule.
- Conserver la position des parties de journée : matin, midi, après-midi, soir, nuit.
- Répéter les mêmes symboles dans Routines et Calendrier.
- Montrer l'incertitude honnêtement : `Après le goûter` est parfois plus utile qu'une fausse heure exacte.
- Ne pas punir visuellement un retard ou un événement manqué.
- Permettre au parent de masquer les informations anxiogènes ou trop lointaines.

## Trois propositions d'expérience

- **A — Frise du jour** : une ligne verticale avec Maintenant et les événements à venir. Très claire pour la séquence; moins adaptée à la semaine.
- **B — Chemin des moments** : grandes cartes Matin, Midi, Après-midi, Soir traversées comme un parcours. Ludique et accessible aux non-lecteurs; prend plus de place.
- **C — Bande de semaine** : sept jours visibles avec pictogrammes, puis détail du jour sélectionné. Excellente vue d'ensemble; plus abstraite pour les plus jeunes.

Recommandation : **B pour Aujourd'hui, C pour Cette semaine, A condensée dans le détail d'une partie de journée**.

## Première version utile

La V1 ne doit pas chercher à devenir un agenda familial complet.

- Aujourd'hui avec Maintenant et Après.
- Demain en aperçu.
- Bande de semaine.
- Dodos pour les événements marqués importants.
- Événements Parent simples.
- Association facultative à une routine ou une activité.
- Données entièrement locales et persistées avec le store actuel.

Hors V1 : synchronisation Google/Apple, partage distant, backend, calendrier scolaire automatique complexe et notifications avancées.

## États à concevoir

- aucun événement ;
- seulement les routines habituelles ;
- plusieurs événements au même moment ;
- événement sur toute la journée ;
- activité annulée ou déplacée ;
- événement dépassé ;
- demain vide ;
- aucun événement à compter en dodos ;
- enfant sans routine ;
- plusieurs enfants avec des calendriers distincts ;
- texte long ou pictogramme manquant ;
- changement de jour pendant que l'écran est ouvert.

## Données et architecture

Le modèle actuel fournit déjà `CalendarEvent`, `CountdownEvent` et `DayTimelineItem`, ainsi qu'un store persistant. La reconstruction doit les faire évoluer sans dupliquer les routines.

Règle proposée :

```text
CalendarEvent = ce que le parent planifie
Routine = le contenu réutilisable
CalendarOccurrence = l'apparition calculée d'un événement ou d'une routine un jour donné
GuidedTimeView = la projection simplifiée que le parent montre à l'enfant
```

Les occurrences récurrentes doivent être calculées à partir de la configuration et non enregistrées comme une longue liste de copies.

## Mesures de réussite

- Le parent retrouve Maintenant et Après immédiatement pour les expliquer à l'enfant.
- Pendant l'échange accompagné, l'enfant différencie aujourd'hui de demain.
- Pendant l'échange accompagné, il comprend ce que signifie Dodos et retrouve aussi le jour associé.
- Le parent crée un événement simple en moins d'une minute.
- Une routine liée se lance depuis le bon contexte.
- Fermer une fiche rend le même jour et la même position de scroll.
- Aucun événement n'est perdu après redémarrage ou changement d'heure.

## Décisions validées

- [x] CAL-D01 — Nom enfant : `Mon calendrier`.
- [x] CAL-D02 — Maintenant/Après, bande de semaine et détails condensés réunis.
- [x] CAL-D03 — Dodos réservé aux événements spéciaux, anniversaires et vacances.
- [x] CAL-D04 — Précision horaire adaptée automatiquement au niveau de lecture.
- [x] CAL-D05 — Accès contextuel visible depuis Routines, sans nouvel onglet global.
- [x] CAL-D06 — Aucun retard punitif, score ou pourcentage dans la vue enfant.
