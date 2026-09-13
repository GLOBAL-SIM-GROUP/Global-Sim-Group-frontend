# Guide utilisateur — Module Clients

Guide d'utilisation du module **Clients** (locataires et clients de passage,
fiches, pièces d'identité, contacts d'urgence) de la plateforme
GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `clients.tex` | Source LaTeX du guide |
| `clients.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/clients/` | Captures Playwright réelles de l'application |

Le script de capture est à la racine du projet :

- `scripts/capture-clients-guide.mjs` — liste, filtres, création locataire et
  client de passage, fiche, pièce d'identité, contact, mobile.

## Ce que couvre le guide

- La liste « Locataires et clients » : colonnes (code, client, téléphone,
  type, ville, enregistré), badges de type (Locataire / De passage / Autre),
  pagination (12 par page).
- Retrouver un client : recherche texte (nom, prénom, téléphone) et filtre
  par type — les deux sont écrits dans l'URL.
- Ajouter un locataire : formulaire complet (photo, identité, coordonnées)
  avec sections optionnelles « Pièce d'identité » et « Contact d'urgence »
  enregistrées dès la création.
- Ajouter un client de passage : formulaire minimal (nom, prénom
  optionnel, téléphone) pour les commandes pressing / restaurant /
  boutique.
- La fiche client : informations personnelles, coordonnées, modification.
- Les pièces d'identité : ajout (type, numéro, photos recto/verso en JPEG,
  PNG, WebP ou PDF, dates), consultation des photos.
- Les contacts d'urgence : ajout (nom, lien, téléphones, adresse, e-mail).
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-clients-guide.mjs
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`, `OUT_DIR`.

> **Attention** : le script crée de vraies données « Guide-… » dans la base
> de dev : un locataire « Guide-Koffi Marius Jean », un client de passage
> « Guide-Passage Awa », une pièce CNI avec photo recto (PNG de test) et un
> contact d'urgence. Un relancement peut renvoyer un 409 (numéro de pièce
> déjà utilisé) : le client est alors créé sans la pièce initiale — les
> pièces et contacts peuvent toujours être ajoutés depuis la fiche.

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir la liste et les fiches | `CLIENT.VOIR` |
| Boutons « Ajouter un locataire » / « Ajouter un client » | `CLIENT.CREER` |
| « Modifier », « Ajouter une pièce », « Ajouter un contact » | `CLIENT.MODIFIER` |
