# Guide utilisateur — Espace client

Guide d'utilisation de l'**espace client** (`/espace-client`) de la
plateforme GLOBAL SIM GROUP — l'espace en ligne du client (non résident) :
commandes, demandes et suivis.

## Contenu

| Fichier | Rôle |
|---------|------|
| `espace-client.tex` | Source LaTeX du guide |
| `espace-client.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/espace-client/` | Captures Playwright réelles du compte `client` |

## Ce que couvre le guide

- Connexion et accueil (« Bienvenue », demandes en cours, suivi en direct,
  notifications, tuiles des services).
- Restaurant : carte avec photos et prix, filtres de catégorie, ajout au
  panier.
- Boutique : catalogue produits, recherche, ajout au panier.
- Mon panier : panier unifié restaurant + boutique (persistant dans le
  navigateur), envoi de la commande (sur place / à emporter / livraison avec
  adresse) et de la demande boutique, confirmation « Demande envoyée ».
- Mes demandes : vue consolidée des 6 types de demandes avec statuts, fiches
  détaillées (articles, frise d'étapes) et annulation tant qu'en attente.
- Pressing : suivi des dépôts, progression en 5 étapes, acompte et reste à
  payer, « à chiffrer au comptoir ».
- Résidence — séjours courts : demande nuitée/sieste avec dates, grille des
  logements disponibles, chiffrage par le personnel.
- Salle de fête : occupation du jour (seules les réservations confirmées
  bloquent un créneau), demande de réservation (date, heure, durée, type de
  manifestation, observations), chronologie.
- Mes abonnements : offres prépayées, solde de quota, validité, reste à
  payer, historique d'utilisation.
- Signalements : déclaration (sujet, service, lieu, description, photos
  5 Mo max) et suivi.
- Mon compte : lecture seule, contact réception pour modifications.
- Vue mobile (barre basse Accueil / Demandes / Commander / Panier), FAQ et
  récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-espace-client.mjs
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `client`), `PASSWORD`,
`OUT_DIR`.

> **Attention** : le script se connecte avec le compte client et crée de
> vraies demandes dans la base de dev (commande restaurant, demande
> boutique, séjour, réservation salle de fête, signalement). Les données de
> test s'accumulent à chaque exécution.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

Ou directement :

```bash
pdflatex -interaction=nonstopmode -halt-on-error espace-client.tex  # x3
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Accéder à l'espace client | `PORTAIL.VOIR` |
| Commander au restaurant (+ annulation) | `RESTAURANT.COMMANDER` |
| Demande boutique (+ annulation) | `MARCHANDISE.COMMANDER` |
| Demande de séjour (+ annulation) | `RESIDENCE.DEMANDER` |
| Réserver la salle de fête (+ annulation) | `SALLE_FETE.DEMANDER` |
| Annuler une commande pressing | `PRESSING.DECLARER` |
| Voir ses signalements | `SIGNALEMENT.VOIR` |
| Déclarer un signalement | `SIGNALEMENT.CREER` |
| Déclarer pour un tiers | `SIGNALEMENT.DECLARER_TIERS` |
