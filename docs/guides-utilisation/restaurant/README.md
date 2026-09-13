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

Le script de capture est à la racine du projet :
`scripts/capture-restaurant-guide.mjs`.

## Ce que couvre le guide

- La carte des plats : grille avec photos, filtres catégorie/disponibilité.
- Ajouter / modifier / désactiver un plat (image max 5 Mo, JPG/PNG/WebP).
- La liste des commandes : colonnes, statuts colorés, filtres
  (recherche, statut, type, période).
- Prendre une commande : type (sur place / à emporter / livraison), client
  optionnel, lignes de plats, moyen de paiement obligatoire.
- Suivre une commande : voir la facture, avancer le statut
  (En cours → En préparation → Servie → Payée), annuler.
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
| Annuler une commande | `RESTAURANT.SUPPRIMER` |
