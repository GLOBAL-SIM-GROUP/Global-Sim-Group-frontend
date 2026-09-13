# Guide d'utilisation — Module Administration

Guide utilisateur en français du module **Administration** de la plateforme
GLOBAL SIM GROUP : gestion des comptes utilisateurs, des rôles et de leurs
permissions, journal d'audit et sauvegardes de la base de données.

## Contenu du dossier

| Fichier | Rôle |
|---------|------|
| `administration.tex` | Source LaTeX du guide |
| `administration.pdf` | PDF compilé (guide final) |
| `build-guide.ps1` | Compilation : 3 passages `pdflatex` |
| `screenshots/administration/` | 13 captures d'écran réelles (Playwright) |
| `screenshots/capture-errors.txt` | Journal des erreurs console lors des captures |

## Compilation

Depuis ce dossier :

```powershell
.\build-guide.ps1
```

Nécessite une distribution LaTeX avec `pdflatex` (MiKTeX utilisé pour la
version livrée) et les packages `fontawesome5`, `tikz`, `longtable`, `float`.

## Captures d'écran

Toutes les captures sont **authentiques** : elles ont été prises par
Playwright sur l'application réelle en développement
(`http://localhost:3000`), connectée avec le compte `admin`.

Script de capture (à la racine du projet) :

```bash
node scripts/capture-admin-guide.mjs      # captures principales
node scripts/capture-admin-fig4.mjs       # re-capture de la modale « Modifier »
```

Variables d'environnement : `BASE_URL` (défaut `http://localhost:3000`),
`LOGIN` (défaut `admin`), `PASSWORD` (défaut `motdepasse`), `OUT_DIR`.

### Inventaire des captures

| Fichier | Contenu |
|---------|---------|
| `01-utilisateurs.png` | Liste des comptes : colonnes, badges Actif, icônes d'action, pagination |
| `02-filtre-role.png` | Filtre « Rôle » déplié (tous les rôles) |
| `03-nouvel-utilisateur.png` | Fenêtre « Ajouter un utilisateur » remplie |
| `04-modifier-utilisateur.png` | Fenêtre « Modifier l'utilisateur » (compte caissier) |
| `05-reinitialiser-mdp.png` | Fenêtre « Réinitialiser le mot de passe » |
| `06-roles.png` | Liste des rôles (libellé + code, permissions, utilisateurs) |
| `07-nouveau-role.png` | Fenêtre « Ajouter un rôle » remplie |
| `08-permissions.png` | Matrice complète des permissions (rôle Administrateur) |
| `09-journal.png` | Journal d'audit : colonnes, badges d'action, boutons d'export |
| `10-filtre-module.png` | Filtre « Module » déplié |
| `11-sauvegardes.png` | Planification automatique + historique des sauvegardes |
| `12-mobile-utilisateurs.png` | Liste des utilisateurs en 320 px |
| `13-mobile-sauvegardes.png` | Page Sauvegardes en 320 px |

### Données créées pendant les captures

**Aucune** : les fenêtres « Ajouter un utilisateur », « Ajouter un rôle » et
« Réinitialiser le mot de passe » ont été remplies pour la capture puis
**annulées** — aucun compte, rôle ou mot de passe de test n'a été enregistré.
C'est volontaire : ce module touche à la sécurité de l'application.

### Comportements réels capturés

- **Modale « Modifier l'utilisateur »** : la première capture montrait le
  login saisi dans la modale « Ajouter » précédemment annulée — le
  formulaire conserve son état tant que la page n'est pas rechargée. La
  capture livrée (`capture-admin-fig4.mjs`) a été reprise après rechargement
  et montre les vraies données du compte `caissier`.
- **Champ « Employé associé »** : la liste ne propose que les employés sans
  compte (`sansCompte: true`). En édition le champ repart vide — l'API ne
  renvoie pas `id_employe` (commentaire du code source).
- **Filtre « Module » du journal** : les valeurs sont les codes techniques
  backend en minuscules (`admin`, `market`, `finances`…).
- **Planification des sauvegardes** : chaque changement (fréquence, heure,
  case « Activer ») est enregistré immédiatement, sans bouton « Enregistrer ».
- **Erreurs console** : uniquement du bruit Vite (proxy WebSocket
  `ECONNABORTED` lors du rechargement du contexte mobile) — voir
  `screenshots/capture-errors.txt`. Aucune erreur applicative.

## Permissions couvertes par le guide

| Permission | Effet documenté |
|------------|-----------------|
| `ADMIN.VOIR` | Accès aux 4 pages du module |
| `ADMIN.CREER` | « Ajouter un utilisateur », « Ajouter un rôle » |
| `ADMIN.MODIFIER` | Modifier un compte, réinitialiser un mot de passe, activer/désactiver, enregistrer les permissions d'un rôle, configurer et lancer les sauvegardes |
| `ADMIN.SUPPRIMER` | Supprimer un rôle sans utilisateur |

## Structure du guide

1. Avant de commencer — présentation et avertissement sur la sensibilité du module
2. Ouvrir le module — menu latéral, 4 sous-pages
3. La liste des utilisateurs — colonnes, recherche, filtres rôle/statut, pagination
4. Ajouter un utilisateur — login unique, mot de passe ≥ 6, employé sans compte, client au vol, rôle, activité (obligatoire pour les caissiers)
5. Modifier / réinitialiser / activer — les 3 icônes d'action, non-cumul des permissions, application immédiate du mot de passe
6. Les rôles — liste, ajout (code MAJUSCULE_SNAKE), suppression réservée aux rôles à 0 utilisateur
7. Attribuer les permissions — matrice par module, « Tout cocher / décocher », propagation sous 60 s
8. Le journal d'audit — colonnes qui/quoi/quand, 5 filtres, exports Excel/PDF qui respectent la vue filtrée
9. Les sauvegardes — planification auto enregistrée au vol, sauvegarde manuelle, historique et statuts
10. Vue mobile 320 px
11. FAQ (9 problèmes) et récapitulatif des permissions
