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

Le script de capture est à la racine du projet :
`scripts/capture-pressing-guide.mjs`.

## Ce que couvre le guide

- Ouvrir le module et lire la liste des commandes (colonnes, statuts colorés).
- Filtrer : recherche texte, statut, client, période.
- Créer une commande : recherche/création de client, articles, date de
  retrait, acompte + moyen de paiement.
- La fiche commande : informations, articles, avancement du statut
  (Déposé → En traitement → Prêt → Retiré).
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
