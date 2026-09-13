# Guide d'utilisation — Module Signalements

Guide utilisateur en français du module **Signalements** de la plateforme
GLOBAL SIM GROUP : déclaration de problèmes avec photos, prise en charge et
résolution/rejet.

## Contenu du dossier

| Fichier | Rôle |
|---------|------|
| `signalements.tex` | Source LaTeX du guide |
| `signalements.pdf` | PDF compilé (guide final) |
| `build-guide.ps1` | Compilation : 3 passages `pdflatex` |
| `screenshots/signalements/` | 11 captures d'écran réelles (Playwright) |
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

Scripts de capture (à la racine du projet) :

```bash
node scripts/capture-signalements-guide.mjs       # captures principales + cycle complet
node scripts/capture-signalements-complement.mjs  # état « En cours » + fiche résolue
```

Variables d'environnement : `BASE_URL` (défaut `http://localhost:3000`),
`LOGIN` (défaut `admin`), `PASSWORD` (défaut `motdepasse`), `OUT_DIR`.

### Inventaire des captures

| Fichier | Contenu |
|---------|---------|
| `01-liste.png` | Liste : colonnes, badges Ouvert/En cours/Résolu, filtres, pagination |
| `02-filtre-statut.png` | Filtre « Statut » déplié (4 états) |
| `03-filtre-module.png` | Filtre « Module concerné » (type de cible = Module) |
| `04-nouveau.png` | Fenêtre « Nouveau signalement » remplie avec photo sélectionnée |
| `05-fiche.png` | Fiche « Ouvert » : détails, vignette photo, carte Actions |
| `06-photo-viewer.png` | Visionneuse d'une photo jointe |
| `07-en-cours.png` | Fiche « En cours » : bouton « Prendre en charge » disparu |
| `08-resoudre-note.png` | Formulaire de note de résolution (obligatoire) |
| `09-resolu.png` | Fiche « Résolu » : date, note, carte Actions disparue |
| `10-mobile-liste.png` | Liste en 320 px |
| `11-mobile-fiche.png` | Fiche en 320 px |

### Données créées pendant les captures

Deux vrais signalements (en base de dev) :

- **« Guide — Ascenseur du bloc B en panne »** (cible Résidence, avec le
  logo GSG comme photo jointe) : suivi du cycle complet **Ouvert →
  Résolu** avec la note « Technicien intervenu : fusible remplacé,
  ascenseur remis en service. »
- **« Guide — Fuite d'eau au couloir du bloc C »** (cible Résidence, sans
  photo) : laissé volontairement à **« En cours »** pour illustrer l'état
  intermédiaire dans la capture de liste.

### Comportements réels capturés

- **Latence d'invalidation** : après « Prendre en charge » ou « Résoudre »,
  la fiche se recharge via TanStack Query en arrière-plan — le badge peut
  mettre 1 à 2 s à changer (capturé honnêtement : le premier run montrait
  encore « Ouvert » juste après l'action ; le complément attend le
  changement de badge).
- **Photo « Chargement… »** : les vignettes chargent leur blob via un
  endpoint dédié (`GET /signalements/photos/:id/fichier`) — elles mettent
  un court instant à s'afficher.
- **Bouton « Prendre en charge »** : visible uniquement sur « Ouvert » ;
  il disparaît une fois le signalement « En cours » (capture 07).
- **Résoudre/Rejeter** : la note est obligatoire (bouton « Confirmer »
  grisé tant que le champ est vide) ; un signalement clos n'a plus de
  carte « Actions ».
- **Erreurs console** : aucune erreur applicative (`capture-errors.txt`
  vide ; `capture-complement-errors.txt` idem).

## Permissions couvertes par le guide

| Permission | Effet documenté |
|------------|-----------------|
| `SIGNALEMENT.VOIR` | Accès à la liste et aux fiches |
| `SIGNALEMENT.CREER` | Bouton « Nouveau signalement » |
| `SIGNALEMENT.MODIFIER` | Carte « Actions » : Prendre en charge, Résoudre, Rejeter |
| `SIGNALEMENT.DECLARER_TIERS` | Verbe spécial : déclarer sur n'importe quel module (sinon limité aux modules `<MODULE>.VOIR` du compte) |

## Structure du guide

1. Avant de commencer — métaphore du cahier de doléances + cycle des
   statuts (schéma coloré)
2. Ouvrir le module — entrée directe du menu latéral
3. La liste — colonnes, badges, ligne cliquable, 4 filtres combinables,
   pagination 10/page
4. Déclarer un problème — titre/description/module obligatoires, périmètre
   de déclaration, photos JPG/PNG/WebP ≤ 5 Mo avec refus nommé
5. La fiche — en-tête, détails, vignettes photos et visionneuse
6. Traiter — Prendre en charge, Résoudre/Rejeter avec note obligatoire,
   clôture définitive, conflit 409
7. Vue mobile 320 px
8. FAQ (8 problèmes) et récapitulatif des permissions
