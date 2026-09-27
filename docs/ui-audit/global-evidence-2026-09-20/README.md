# Preuves du tour réel — 2026-09-20

Application Expo servie localement sur localhost:8081 depuis le code de travail courant. Captures du produit réel, pas de prototypes. Profil existant; espace Parent protégé, sans saisie ni contournement du PIN. Données locales présentes dans les captures : conserver ces preuves dans le projet, ne pas les publier comme illustrations de démonstration.

- routines/activities-390.png : 390 × 844, clair.
- routines/activities-320.png : 320 × 900, clair.
- routines/activities-768.png : 768 × 1024, clair.
- routines/activities-1440.png : 1440 × 900, clair.
- routines/activities-dark-390.png : 390 × 844, sombre.
- pin-390.png et pin-dark-390.png : écran PIN dans les deux thèmes, même rendu clair observé.
- outfit, calendar, launch, filters, activity-detail, favorites-empty-390.png : surfaces secondaires et état vide, 390 × 844.
- measurements.json : dimensions DOM de document et boutons role=button, après attente d'un contrôle visible de l'écran. Ce relevé ne mesure ni les cibles natives ni tous les éléments interactifs.

Scénario de retour reproduit : Activités → menu Parent → PIN → Retour → Routines. Attendu à discuter dans G01 : revenir au contexte d'origine.

La navigation a été restaurée sur l'accès Parent, thème clair et viewport standard. L'ouverture de la fiche Défi silence l'ajoute automatiquement aux activités récentes. Aucune routine terminée, donnée supprimée ou récompense attribuée.

Limites : pas de captures Parent déverrouillé, premier démarrage vide ou natif. Pas de validation de contraste chiffrée, lecteur d'écran, performance de production ni parcours complet de persistance. Le bilan GLOBAL-AUDIT.md fait foi pour le statut de chaque constat.
