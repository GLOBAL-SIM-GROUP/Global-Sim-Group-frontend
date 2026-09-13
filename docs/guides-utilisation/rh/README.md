# Guide utilisateur — Module RH (Ressources humaines)

Guide d'utilisation du module **RH** (employés, bulletins de salaire,
comptes utilisateurs) de la plateforme GLOBAL SIM GROUP.

## Contenu

| Fichier | Rôle |
|---------|------|
| `rh.tex` | Source LaTeX du guide |
| `rh.pdf` | PDF compilé, prêt à distribuer |
| `build-guide.ps1` | Compile le PDF (3 passages `pdflatex`) |
| `screenshots/rh/` | Captures Playwright réelles de l'application |

Les scripts de capture sont à la racine du projet :

- `scripts/capture-rh-guide.mjs` — capture principale (employés,
  bulletins, comptes, vues mobile).
- `scripts/capture-rh-complement.mjs` — re-capture ciblée de la page
  « Comptes utilisateurs » (la 1re capture était prise avant le
  chargement des permissions).

## Ce que couvre le guide

- **Employés** : liste, recherche, filtres service/statut, pagination,
  création (fonction limitée aux codes backend), fiche, modification,
  activation/désactivation.
- **Bulletins de salaire** : liste, filtres employé/période/statut,
  création (salaire pré-rempli), éléments de salaire (prime, avance,
  retenue, heures sup., autre), recalcul, validation, paiement,
  annulation, impression PDF. Cycle : Calculée → Validée → Payée.
- **Comptes utilisateurs** : création d'un compte pour un employé sans
  compte (login auto `prenom.nom`, mot de passe ≥ 6, rôle, scope
  activité pour les caissiers).
- Vue mobile (320 px), FAQ et récapitulatif des permissions.

> Note : les pages `/rh/pointage*` existent dans le code mais sont
> retirées de l'UI (redirection vers `/rh/employes`) ; elles ne sont ni
> capturées ni documentées dans le guide.

## Regénérer les captures

Prérequis : serveur dev lancé (`npm run dev`) avec le backend réel.

```bash
node scripts/capture-rh-guide.mjs
node scripts/capture-rh-complement.mjs   # compléments 20 + 21 (comptes)
```

Variables d'environnement optionnelles : `BASE_URL` (défaut
`http://localhost:3000`), `LOGIN` (défaut `admin`), `PASSWORD`,
`OUT_DIR`.

> **Attention — données réelles créées en base de dev** : le script crée
> une vraie employée « Guide-Ngo Bell, Sandrine » (fonction
> `AGENT_ENTRETIEN`, service Magasin, CDI, 75 000 FCFA) et un vrai
> bulletin pour la période en cours (prime « Prime d'assiduité » de
> 10 000 FCFA ajoutée, bulletin **validé**). La fenêtre de paiement est
> capturée puis **fermée sans payer** ; le formulaire de compte est
> rempli puis **abandonné sans enregistrer**. Les données `Guide-*`
> s'accumulent à chaque exécution (comme pour les autres guides).

## Compiler le PDF

Depuis ce dossier, dans PowerShell :

```powershell
.\build-guide.ps1
```

## Permissions documentées

| Action | Permission(s) |
|--------|---------------|
| Voir les pages du module (employés, bulletins, comptes) | `RH.VOIR` |
| Ajouter un employé, créer/valider/annuler un bulletin | `RH.CREER` |
| Modifier un employé, activer/désactiver | `RH.MODIFIER` |
| Payer un bulletin | `RH.CREER` + `FINANCES.VOIR` |
| Charger rôles et activités (formulaire de compte) | `ADMIN.VOIR` |
| Enregistrer un compte utilisateur | `ADMIN.CREER` |

## Incidents de capture connus

- 1re exécution : la création de l'employée a échoué (`fonction`
  « Gouvernante » rejetée — énumération stricte backend, erreur 400
  consignée dans `screenshots/rh/capture-errors.txt`). Corrigé avec
  `AGENT_ENTRETIEN`.
- La page Comptes affichait « Vous n'avez pas accès » sur la 1re
  capture (permissions pas encore chargées) : re-capturée par le script
  complément.
