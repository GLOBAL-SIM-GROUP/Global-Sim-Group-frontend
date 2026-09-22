# Guide utilisateur — Module Pressing

Guide d'utilisation du module **Pressing** (commandes de blanchisserie) de la
plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `pressing.tex` | Source LaTeX du guide |
| `pressing.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/pressing/` | Captures Playwright réelles de l'application |

Les scripts de capture sont à la racine du projet :
`scripts/capture-pressing-guide.mjs` (principal),
`scripts/capture-pressing-kilo.mjs` (complément 2026-09-16 : tarification
au kilo, page « Tarif au kilo », recapture du formulaire sans acompte) et
`scripts/capture-pressing-portail.mjs` +
`scripts/capture-pressing-portail-valider.mjs` (complément 2026-09-21 :
catalogue, demandes portail « En attente de validation », chiffrage réel
d'une demande → Déposé) et
`scripts/capture-pressing-catalogue-form.mjs` (complément 2026-09-22 :
champs Type/Prestation adossés au catalogue, bascule « Saisir
manuellement », ajout inline au catalogue, fiche sans ligne Acompte).

## Ce que couvre le guide

- Ouvrir le module et lire la liste des commandes (colonnes, statuts colorés).
- Filtrer : recherche texte, statut, client, période.
- Créer une commande : recherche/création de client, choix de la
  tarification (à la pièce ou au kilo — définitif), articles, date de
  retrait.
- La fiche commande : informations, badge de tarification, articles,
  avancement du statut (Déposé → En traitement → Prêt → Retiré).
- La tarification au kilo : page « Tarif au kilo » (tarif courant,
  définition d'un nouveau tarif — append-only), commande au poids
  (colonne « POIDS (KG) », aperçu au tarif courant).
- Les demandes du portail résident : badge « En attente de validation »
  (violet), pastille de compteur dans le menu, chiffrage (→ Déposé,
  acompte optionnel encaissé) ou refus définitif (→ Annulé).
- Le catalogue : types de vêtement et prestations (ajout, renommage,
  désactivation sans toucher l'historique). Les champs Type/Prestation
  du dépôt proposent les entrées actives, avec bascule « Saisir
  manuellement » et ajout/réactivation express au catalogue
  (`PRESSING.GERER_CATALOGUE`).
- Imprimer le reçu de dépôt (ticket 58 mm / 80 mm).
- Le retrait : encaisser le solde et clore la commande.
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-pressing-guide.mjs
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : le script crée une vraie commande « Guide-Pressing » dans
> la base de dev (et un client si aucun n'est trouvé). Les données de test
> s'accumulent à chaque exécution.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

Ou directement :

```bash
pdflatex -interaction=nonstopmode -halt-on-error pressing.tex  # x3
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir les commandes | lecture Pressing |
| Nouvelle commande | `PRESSING.CREER` |
| Modifier / changer le statut | `PRESSING.MODIFIER` |
| Retirer (encaisser le solde) | `PRESSING.CREER` + `FINANCES.VOIR` |
| Valider / chiffrer une demande portail | `PRESSING.CREER` |
| Refuser une demande portail | `PRESSING.ANNULER` |
| Page « Tarif au kilo » | `PRESSING.GERER_TARIFS` |
| Mutations du catalogue | `PRESSING.GERER_CATALOGUE` |
| Déclarer un dépôt (portail, compte client) | `PRESSING.DECLARER` |
