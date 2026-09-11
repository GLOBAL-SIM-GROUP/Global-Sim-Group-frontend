# Prompt pour générer le guide d'utilisation — Module Résidence

Utilise ce prompt avec une IA capable d'exécuter du code (Playwright + LaTeX) pour reproduire ou mettre à jour le guide utilisateur du module Résidence.

---

## Contexte

L'application est le frontend **GLOBAL SIM GROUP**, une application React/TypeScript en français pour la gestion multiservice d'une résidence.

- Environnement local : `http://localhost:3000`
- Environnement de développement : `https://dev.sim.strife-cyber.org/`
- Production : `https://sim.strife-cyber.org/`
- Identifiants de test (à ne JAMAIS inclure dans les documents générés) : login `admin`, mot de passe fourni par l'utilisateur.

## Mission

Créer un guide d'utilisation du **module Résidence** dans `docs/guides-utilisation/`.

### Public cible

Un débutant complet. Utilise un langage très simple, comme si tu expliquais à un enfant de 5 ans. Des phrases courtes, des comparaisons concrètes, des visuels.

### Format

- Document source : **LaTeX** (`docs/guides-utilisation/residence.tex`).
- Compilation en **PDF** (`docs/guides-utilisation/residence.pdf`).
- Captures d'écran : **Playwright** dans `docs/guides-utilisation/screenshots/residence/`.

### Processus à illustrer

1. Se connecter.
2. Naviguer dans le menu Résidence.
3. Créer un **bâtiment**.
4. Créer un **logement** dans un bâtiment.
5. Créer un **contrat de location** avec création rapide d'un locataire.
6. Activer un contrat.
7. Gérer la caution.
8. Créer un **séjour court** (nuitée ou sieste) avec création rapide d'un client.
9. Enregistrer un paiement de séjour.
10. Créer une **charge**.
11. Payer une charge.
12. Créer un **abonnement**.
13. Résilier un abonnement.
14. Consulter les **échéances** de loyer.
15. Ajouter des photos d'état des lieux.
16. Consulter le **portail résident**.

### Contenu de chaque section

Pour chaque processus :

1. **Pourquoi on fait ça** (en une phrase simple).
2. **Où cliquer** (nom exact des boutons/menus, avec icône 🖱️).
3. **Quoi remplir** : champ par champ, avec un exemple réaliste.
4. **Champs optionnels** : marqués explicitement `(optionnel)`.
5. **Erreurs fréquentes** : messages possibles et comment les corriger (icône ⚠️).
6. **Comment vérifier que ça a marché** (icône ✅).

### Style

- Langue : français uniquement.
- Listes numérotées pour les étapes.
- Puces pour les détails.
- Émojis ou icônes : ⚠️ attention, ✅ vérification, 🖱️ clic.
- Phrases directes et courtes.
- Ne jamais inventer de nom de bouton/champ : vérifier dans l'application réelle.

### Contraintes importantes

1. **Ne pas recopier les identifiants** dans le guide.
2. **Capturer les vraies captures d'écran** de l'application via Playwright.
3. **Créer des données de test clairement identifiables** (par exemple `Guide-...`, `Test-...`).
4. **Si une erreur survient**, l'enregistrer et la lister à la fin du guide dans une annexe.
5. **Ne pas modifier le code source** de l'application sauf si c'est indispensable pour débloquer une capture.
6. **Compiler le PDF** et vérifier qu'il contient bien toutes les captures.
7. **Ne pas prétendre que le guide est complet** tant que le fichier `.tex` et le `.pdf` ne sont pas générés et vérifiés.

### Structure attendue du document

1. Page de garde avec titre et sous-titre.
2. Table des matières.
3. Introduction simple.
4. Sections dans l'ordre des processus listés ci-dessus.
5. FAQ / section « J'ai un problème ».
6. Annexe listant les erreurs rencontrées pendant la génération.

### Vérification finale

Avant de répondre, l'IA doit s'assurer que :

- [ ] Toutes les captures Playwright sont présentes dans `docs/guides-utilisation/screenshots/residence/`.
- [ ] Le fichier `docs/guides-utilisation/residence.tex` existe et compile.
- [ ] Le fichier `docs/guides-utilisation/residence.pdf` est généré.
- [ ] Le PDF contient bien toutes les captures et la table des matières.
- [ ] Les erreurs sont listées dans une annexe.
- [ ] Aucun identifiant/mot de passe n'apparaît dans le guide.
