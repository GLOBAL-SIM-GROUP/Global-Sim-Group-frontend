# Guide utilisateur — Portail résident

Guide d'utilisation du **portail résident** (`/residence/portail`) de la
plateforme GLOBAL SIM GROUP — l'espace en ligne du résident : suivi du loyer,
services, demandes et signalements.

## Contenu

| Fichier | Rôle |
|---------|------|
| `portail-resident.tex` | Source LaTeX du guide |
| `portail-resident.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/portail/` | Captures Playwright réelles du compte `resident` |

## Ce que couvre le guide

- Connexion et « Mon espace résident » (contrat en cours, prochaine
  échéance, rappel « Total impayés » du menu).
- Mes échéances de loyer : période, montant, payé, statut, reçu
  (consultation + téléchargement CSV/PDF).
- Mon historique : tous les paiements, filtres date/type, reçus.
- Ma caution : montant versé, statut, restitution.
- Mes états des lieux : photos d'entrée/sortie versées par le personnel.
- Séjours courts : demande avec dates → catalogue des logements
  disponibles → envoi, chronologie et annulation tant qu'en attente.
- Suivi Pressing : progression en 5 étapes, montants, reçu.
- Restaurant : passer une commande (plats, type sur place/à emporter/
  livraison, note), suivi et annulation — règlement au comptoir.
- Salle de fête : occupation du jour, demande de réservation (créneau,
  durée, type de manifestation), chronologie — règlement sur place.
- Boutique : suivi des demandes d'achat (panier composé dans l'espace
  client).
- Mes abonnements : quotas prépayés vendus par le personnel.
- Signalements : déclaration (sujet, service, lieu, description, photos)
  et suivi.
- Vue mobile (390 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-portail-resident.mjs
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `resident`), `PASSWORD`,
`OUT_DIR`.

> **Attention** : le script se connecte avec le compte résident et crée de
> vraies demandes dans la base de dev (séjour, commande restaurant,
> réservation salle de fête, signalement). Les données de test
> s'accumulent à chaque exécution.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

Ou directement :

```bash
pdflatex -interaction=nonstopmode -halt-on-error portail-resident.tex  # x3
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Accéder au portail | `PORTAIL.VOIR` |
| Demande de séjour (+ annulation) | `RESIDENCE.DEMANDER` |
| Commander au restaurant (+ annulation) | `RESTAURANT.COMMANDER` |
| Réserver la salle de fête (+ annulation) | `SALLE_FETE.DEMANDER` |
| Annuler une demande de dépôt pressing | `PRESSING.DECLARER` |
| Demandes boutique (+ annulation) | `MARCHANDISE.COMMANDER` |
| Voir ses signalements | `SIGNALEMENT.VOIR` |
| Déclarer un signalement | `SIGNALEMENT.CREER` |
| Données résident (contrat, logement) | `RESIDENT.VOIR` |
