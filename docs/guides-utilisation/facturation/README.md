# Guide utilisateur — Module Facturation

Guide d'utilisation du module **Facturation** (facturation ponctuelle,
catalogue de prestations, encaissements, impression PDF/ticket) de la
plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `facturation.tex` | Source LaTeX du guide |
| `facturation.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/facturation/` | Captures Playwright réelles de l'application |

Le script de capture est à la racine du projet :
`scripts/capture-facturation-guide.mjs`.

## Ce que couvre le guide

- La liste des factures : colonnes (numéro, date, client, source, montant,
  payé, reste, statut), recherche, filtres statut + source, pagination.
- Créer une facture ponctuelle : choix d'une prestation (montant
  auto-rempli), recherche/création de client, montant payé, remise,
  moyen de paiement.
- La fiche facture : informations, lignes, impression PDF (A4) et ticket
  de caisse (58/80 mm).
- L'encaissement du solde : « Enregistrer un paiement » sur une facture
  Partielle/Impayée jusqu'au statut Payée.
- Le catalogue des prestations : ajouter, modifier, activer/désactiver.
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-facturation-guide.mjs
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : le script crée une vraie facture ponctuelle (première
> prestation active du catalogue, paiement partiel puis encaissement du
> solde — statut final « Payée ») dans la base de dev à chaque exécution.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir les pages du module | accès Facturation |
| Nouvelle facture / encaisser / ajouter une prestation | `FACTURATION.CREER` + `FINANCES.VOIR` |
| Modifier / activer / désactiver une prestation | `FACTURATION.MODIFIER` |
