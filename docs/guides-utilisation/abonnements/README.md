# Guide utilisateur — Module Abonnements

Guide d'utilisation du module **Abonnements** (quotas prépayés pressing et
restauration) de la plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `abonnements.tex` | Source LaTeX du guide |
| `abonnements.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/abonnements/` | Captures Playwright réelles de l'application |

## Ce que couvre le guide

- Le concept : **quota prépayé** (pas un prélèvement mensuel) et les états
  calculés (Active, À venir, Épuisée, Expirée, Résiliée, Annulée).
- Les **offres** : catalogue vendable (code unique, couverture par activité,
  quota/unité, prix, durée), filtres, création, modification, suppression ou
  désactivation si déjà vendue.
- Les **souscriptions** : liste (jauge de solde, reste à payer), filtres dont
  « Reliquats à décider », vente (prix négocié, début différé, paiement
  optionnel/partiel → facture + reste à payer).
- La **fiche souscription** : encaissement complémentaire, ajustement de quota
  signé avec motif, résiliation.
- Les **reliquats** : report sur une souscription compatible du même client ou
  perte, pour les expirées avec solde.
- L'**utilisation au comptoir** : panneau « Couverture abonnement » dans les
  formulaires pressing/restaurant, plein tarif, excédent confirmé en 2 fois.
- Vue mobile, FAQ et récapitulatif des permissions `ABONNEMENT.*`.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-abonnements-guide.mjs    # offres, liste, vente, confirmation
node scripts/capture-abonnements-suite.mjs    # fiche, dialogues, couverture, mobile
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : les scripts vendent de vraies souscriptions au client de
> démonstration et en résilient une — des données de test s'accumulent dans la
> base de dev (factures `GSG-FAC-*` incluses).

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

Ou directement :

```bash
pdflatex -interaction=nonstopmode -halt-on-error abonnements.tex  # x3
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir offres, souscriptions, fiches | `ABONNEMENT.VOIR` |
| Créer / modifier une offre | `ABONNEMENT.CREER` / `ABONNEMENT.MODIFIER` |
| Supprimer une offre | `ABONNEMENT.SUPPRIMER` |
| Vendre + encaisser un complément | `ABONNEMENT.VENDRE` |
| Ajuster le quota / résilier | `ABONNEMENT.AJUSTER` |
| File reliquats + décision report/perte | `ABONNEMENT.DECIDER_RELIQUAT` |

## Notes de maintenance

- 2026-09-25 : création du guide (20 pages). Correction préalable d'un bug
  frontend : `vendreSouscription` déballe désormais l'enveloppe
  `{souscription, numero, id_paiement}` renvoyée par le POST — la
  confirmation affichait des champs vides et « Voir la souscription » menait
  à « Souscription introuvable ».
- Le module remplace l'ancien système « services récurrents » du module
  Résidence (supprimé) : le guide Résidence renvoie désormais vers ce module.
