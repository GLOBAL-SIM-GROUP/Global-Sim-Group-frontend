# Guide utilisateur — Module Finances

Guide d'utilisation du module **Finances** (tableau de bord financier,
encaissements, dépenses, impayés, caisses, moyens de paiement, revenus par
employé) de la plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `finances.tex` | Source LaTeX du guide |
| `finances.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/finances/` | Captures Playwright réelles de l'application |

Les scripts de capture sont à la racine du projet :

- `scripts/capture-finances-guide.mjs` — capture principale (9 pages).
- `scripts/capture-finances-complement.mjs` — re-capture ciblée (filtre
  type des encaissements + sélecteur de caisses « Ma caisse »).

## Ce que couvre le guide

- **Tableau de bord financier** : 4 indicateurs (recettes, dépenses,
  solde, bénéfice estimatif), filtres période/activité, résumé par
  activité, fenêtre « Détails par activité », exports PDF/Excel.
- **Encaissements** : historique des mouvements, filtres type + dates +
  caisse.
- **Dépenses** : liste, filtres, ajout/modification/suppression
  (permissions `DEPENSE.*`), alerte caisse fermée.
- **Impayés** : créances par type (loyer, charge, séjour, facture), liens
  directs vers les fiches.
- **Moyens de paiement** et **catégories de dépenses** : catalogues
  (ajouter, activer/désactiver, supprimer).
- **Caisses** : liste, création, modification.
- **Ma caisse** : écran du caissier, ouvrir/fermer, indicateurs du jour.
- **Revenus par employé** : agrégation par utilisateur, filtres caisse +
  période.
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-finances-guide.mjs
node scripts/capture-finances-complement.mjs   # compléments 07 + 20
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : le script crée une vraie dépense « Guide — Achat de
> fournitures » (5 000 FCFA) dans la base de dev si la caisse est ouverte.
> Les autres modales (moyen, catégorie, caisse) sont capturées puis
> annulées sans valider.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir les pages du module | `FINANCES.VOIR` |
| Ouvrir/fermer sa caisse, raccourcis caissier, ajouter un moyen de paiement | `FINANCES.CREER` |
| Créer/modifier les caisses, activer/désactiver les moyens | `FINANCES.MODIFIER` |
| Ajouter une dépense / catégorie | `DEPENSE.CREER` |
| Modifier une dépense | `DEPENSE.MODIFIER` |
| Supprimer une dépense / catégorie | `DEPENSE.SUPPRIMER` |
