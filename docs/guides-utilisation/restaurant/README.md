# Guide utilisateur — Module Restaurant

Guide d'utilisation du module **Restaurant** (carte des plats, commandes,
statistiques) de la plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `restaurant.tex` | Source LaTeX du guide |
| `restaurant.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/restaurant/` | Captures Playwright réelles de l'application |

Les scripts de capture sont à la racine du projet :
`scripts/capture-restaurant-guide.mjs` (principal) et
`scripts/capture-restaurant-portail.mjs` (complément 2026-09-21 : demande
portail « En attente », refus avec motif, validation → En cours,
encaissement → Payée).

## Ce que couvre le guide

- La carte des plats : grille avec photos, filtres catégorie/disponibilité.
- Ajouter / modifier / désactiver un plat (image max 5 Mo, JPG/PNG/WebP).
- La liste des commandes : colonnes, statuts colorés, filtres
  (recherche, statut, type, période).
- Prendre une commande : type (sur place / à emporter / livraison), client
  optionnel, lignes de plats, moyen de paiement obligatoire.
- Suivre une commande : voir la facture, avancer le statut
  (En cours → En préparation → Servie), encaisser (→ Payée), annuler.
- Les demandes du portail résident : badge « En attente » (violet),
  pastille de compteur dans le menu, valider (→ En cours) ou refuser
  avec motif (→ Annulée), puis encaissement du règlement.
- Les statistiques : chiffre d'affaires et top des plats vendus.
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-restaurant-guide.mjs
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : le script crée un vrai plat « Guide-Attiéké poisson » et
> une vraie commande dans la base de dev à chaque exécution.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir le module (3 pages) | `RESTAURANT.VOIR` |
| Ajouter un plat, nouvelle commande | `RESTAURANT.CREER` |
| Modifier plat, avancer le statut | `RESTAURANT.MODIFIER` |
| Valider / refuser une demande portail | `RESTAURANT.VALIDER` |
| Encaisser une commande (→ Payée) | `FINANCES.ENCAISSER` |
| Annuler une commande | `RESTAURANT.SUPPRIMER` |
| Commander depuis le portail (client) | `RESTAURANT.COMMANDER` |
