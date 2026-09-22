# Guide utilisateur — Module Marchandise

Guide d'utilisation du module **Marchandise** (Market : catalogue produits,
stock, ventes, code-barres, statistiques) de la plateforme
GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `marchandise.tex` | Source LaTeX du guide |
| `marchandise.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/marchandise/` | Captures Playwright réelles de l'application |

Les scripts de capture sont à la racine du projet :

- `scripts/capture-marchandise-guide.mjs` — catalogue, création produit,
  catégories, mouvements, alerte stock, réception par scan, ventes,
  statistiques, mobile.
- `scripts/capture-marchandise-complement.mjs` — dialogues sur la carte
  « Guide-Eau » + vraie vente via scan du code-barres + facture + stats
  (re-capture ciblée).
- `scripts/capture-marchandise-portail.mjs` +
  `scripts/capture-marchandise-portail-suite.mjs` — vente portail
  « En attente de validation », refus avec motif, validation (stock
  décrémenté) → En cours, encaissement → Payée (2026-09-21).

## Ce que couvre le guide

- Le catalogue produits : cartes (image, référence, catégorie, prix
  achat/vente, stock coloré, seuil, fournisseur), filtres (recherche,
  catégorie, fournisseur, alerte, épuisés), pagination (10 par page).
- Ajouter/modifier un produit : référence, nom, catégorie, fournisseur,
  prix, stock initial (création uniquement), seuil d'alerte, code-barres,
  actif, image.
- Le code-barres d'un produit : étiquette imprimable ou « Générer un
  code-barres ».
- Les catégories : liste + ajout (pas de modification ni suppression — le
  backend ne l'expose pas).
- Les mouvements de stock : historique (Entrée / Sortie / Ajustement avec
  stock résultant), filtres, ajout manuel, alerte stock, réception par
  scan (douchette code-barres, re-scan = +1).
- Les ventes : liste, statuts (Payée / En cours / En attente de validation /
  Annulée, badge « Portail »), nouvelle vente (client optionnel, scan ou
  sélection de produit, remise, moyen de paiement obligatoire → statut
  Payée immédiat), facture, reçu imprimable, annulation admin.
- Les demandes de la boutique du portail : valider (confirmation — le stock
  est décrémenté) ou refuser avec motif, encaisser la vente « En cours »
  (→ Payée).
- Les statistiques : CA, marge, ventes par statut, top produits, alerte.
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-marchandise-guide.mjs
node scripts/capture-marchandise-complement.mjs   # vente via scan + facture
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : les scripts créent de vraies données « Guide-… » dans la
> base de dev : le produit « Guide-Eau minérale 1L » (réf. GSG-REF-002,
> code-barres 3700000000001), un mouvement d'entrée +12 (enregistré sur
> GAZ-01 au premier run — le sélecteur type-ahead ne trouve pas
> « Guide-Eau » car le libellé d'item commence par la référence) et une
> vente réelle de 2 bouteilles (facture n°8, Payée). Le serveur peut
> régénérer la référence saisie.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir les 5 pages | `MARCHANDISE.VOIR` |
| Ajouter produit / catégorie / mouvement, réception par scan, nouvelle vente | `MARCHANDISE.CREER` |
| Modifier un produit | `MARCHANDISE.MODIFIER` |
| Valider / refuser une demande portail | `MARCHANDISE.VALIDER` |
| Encaisser une vente « En cours » | `FINANCES.ENCAISSER` |
| Annuler une vente | `MARCHANDISE.SUPPRIMER` (admin) |
| Commander depuis la boutique (client) | `MARCHANDISE.COMMANDER` |
