# Prototype A + C — Chemin constellation

Ce prototype est séparé du code de l’application. Il consolide le choix A + C avant intégration.

## Principes visibles

- marque complète conservée sur mobile;
- thème réduit à un bouton circulaire sur petit écran;
- pictogrammes et étapes matérialisés par des galets;
- ligne pointillée utilisée seulement pour relier une séquence;
- outils Calendrier et Météo réunis en petite constellation;
- navigation active signalée par un cercle, sans grand aplat;
- cartes parentales neutres et couleurs réservées aux intentions;
- modes clair et sombre conçus ensemble.

## Captures

- `shell-routines-ac-light-320x800.png`
- `shell-routines-ac-dark-320x800.png`
- `shell-routines-ac-light-390x844.png`
- `shell-routines-ac-dark-390x844.png`
- `shell-routines-ac-light-768x1024.png`
- `shell-routines-ac-dark-768x1024.png`
- `shell-routines-ac-light-1440x1000.png`
- `shell-routines-ac-dark-1440x1000.png`
- `shell-routines-ac-empty-390x844.png`
- `shell-routines-ac-resume-390x844.png`
- `shell-routines-ac-long-390x844.png`
- `shell-routines-ac-long-320x800.png`

Les captures mesurées respectent `scrollWidth <= clientWidth` aux largeurs 320, 390, 768 et 1440 px. À partir de la tablette, la routine reste prioritaire à gauche; le calendrier du jour est placé en haut à droite et la météo avec les vêtements juste dessous.

Régénération locale : `node capture.mjs` depuis ce dossier.
