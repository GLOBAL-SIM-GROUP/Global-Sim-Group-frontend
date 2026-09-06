# Impression des tickets & reçus

Ce document explique comment fonctionne l'impression côté frontend, pourquoi
l'impression thermique (58/80 mm) pose problème, et quelles sont les solutions.

## 1. Comment fonctionne l'impression actuelle

Le cœur de l'impression est dans [`src/lib/print-pdf.ts`](../src/lib/print-pdf.ts).
Toutes les fonctions reposent sur la même technique : **charger le document dans
un `<iframe>` caché, puis appeler `print()` sur la fenêtre de cet iframe**.

> `window.print()` imprime la page HTML courante (l'app), pas un fichier
> arbitraire. Pour imprimer un PDF/HTML/ticket, on le charge donc dans un
> iframe dédié et on imprime *sa* fenêtre.

### Les fonctions

| Fonction | Entrée | Usage |
|---|---|---|
| `imprimerPdfBlob(blob)` | PDF (blob) | Reçus/factures PDF, contrats, bulletins, rapports, exports |
| `imprimerPdfOctets(octets)` | PDF (octets) | Export audit |
| `imprimerImageBlob(blob)` | Image (blob) | Étiquettes code-barres |
| `imprimerHtml(html, 58\|80)` | HTML | **Ticket de caisse thermique** |

### Le flux du ticket thermique

1. Le backend renvoie du **HTML** (pas un PDF) via
   `GET /api/v1/facturation/factures/{id}/ticket?largeur=58|80`.
2. `printFactureTicket()` (`src/core/api/facturation.ts`) récupère ce HTML puis
   appelle `imprimerHtml()`.
3. `imprimerHtml()` :
   - extrait le `<style>` et le `<body>` du HTML,
   - construit un document HTML complet contraint à `largeurMm` de large,
   - le charge dans un iframe caché (`src = blob URL`),
   - attend le chargement + les polices, mesure la hauteur réelle du contenu,
   - injecte `@page { size: <largeur>mm <hauteur>mm; margin: 0 }`,
   - appelle `contentWindow.print()`.
4. Le nettoyage de l'iframe se fait au retour du focus sur la fenêtre principale
   (fermeture de la boîte d'impression) ou via un filet de sécurité de 60 s.

## 2. Le problème : la taille du papier (Lettre US)

Symptôme : la boîte d'impression propose **Lettre US (215,9 × 279,4 mm)** au
lieu de 58 ou 80 mm.

### Cause racine

**Le navigateur ne peut pas forcer la taille de papier d'une imprimante
physique.** C'est une limite du Web, pas un bug du code.

- La règle CSS `@page { size }` ne fonctionne **que pour les imprimantes
  virtuelles PDF** (« Enregistrer au format PDF », « Microsoft Print to PDF »).
  Avec une vraie imprimante thermique, Chrome utilise la taille de papier
  configurée **dans le pilote d'imprimante**, pas celle du CSS.
- Chrome a en plus un comportement connu : il **ignore la taille de papier
  définie par défaut dans le pilote** et retombe sur Lettre US. C'est exactement
  le symptôme observé.

### Ce que `@page { size }` corrige réellement

- **« Enregistrer en PDF »** → le PDF sort bien en 58/80 mm.
- **La largeur de mise en page** du contenu (le HTML est contraint à 58/80 mm).

Il ne corrige **pas** l'impression sur une imprimante thermique physique.

## 3. Les solutions possibles

### A. Configurer le pilote (effort faible, à faire une fois)

Régler la taille 58/80 mm directement dans Windows, puis la choisir dans la
boîte d'impression Chrome.

**Dans Windows :**
`Paramètres → Bluetooth et appareils → Imprimantes et scanners → [imprimante] →
Préférences d'impression → Taille du papier = 80 mm (ou 58 mm)`.

**Dans la boîte d'impression Chrome :**
`Plus de paramètres →`
- `Destination` = l'imprimante thermique,
- `Taille du papier` = 80 mm (rouleau) / 80 mm continu / 58 mm,
- `Échelle` = 100 %,
- `Marges` = Aucune,
- `En-têtes et pieds de page` = désactivés.

Ces réglages peuvent être sauvegardés en préréglage pour les caissiers.

### B. Impression brute via un pont local (robuste, POS) — ✅ implémenté

Contourne totalement la boîte d'impression du navigateur en parlant directement
au service d'impression du système via un agent local installé sur le poste de
caisse : **QZ Tray** (https://qz.io — le plus répandu pour le POS web).

**Implémentation** (`src/lib/qz-tray-client.ts`) :
- `printFactureTicket()` (`src/core/api/facturation.ts`) regarde d'abord si une
  imprimante QZ Tray est configurée sur ce poste
  (`src/lib/imprimante-thermique-store.ts`, `localStorage` — réglage matériel
  propre à la machine, jamais envoyé au backend). Si oui, imprime directement
  dessus via `imprimerTicketQZ()` : le même HTML de ticket est envoyé à QZ en
  mode `pixel`/`html`, avec la largeur/hauteur imposées au niveau de la config
  QZ (donc du pilote, via Java) — indépendant du bug Chrome documenté en
  section 2.
- Si QZ Tray n'est pas configuré, ou si l'appel échoue (agent fermé, imprimante
  débranchée…), repli silencieux sur `imprimerHtml()` (méthode A) — jamais
  d'échec dur pour le caissier.
- Réglage du poste : menu du bouton d'impression → « Paramètres
  d'impression… » (`parametres-impression-dialog.tsx`) — détecte l'agent,
  liste les imprimantes système qu'il expose, permet de choisir + tester.
- Sécurité : mode **non signé** (`qz.security.setCertificatePromise`/
  `setSignaturePromise` résolvent vide). QZ Tray affiche une fois par poste une
  confirmation locale (« Autoriser ce site ? », case « Se souvenir »), pas de
  certificat à gérer — suffisant pour un parc de postes internes avec
  opérateur ; une signature ne serait utile que pour un déploiement kiosque
  sans aucune confirmation manuelle.

**Prérequis côté poste** : installer l'agent QZ Tray (https://qz.io/download),
puis dans « Paramètres d'impression… » choisir l'imprimante système
correspondant au ticket 58/80mm.

### C. Générer le ticket en PDF côté backend

Le backend produit directement un PDF au format 58/80 mm (comme le reçu PDF
actuel). Le PDF contient la bonne taille de page, mais l'impression sur
imprimante physique reste soumise au pilote (voir section 2) : la boîte Chrome
peut toujours proposer Lettre US tant que le pilote n'est pas configuré.

## 4. Résumé

| Approche | Contrôle de la taille | Dépend du pilote ? | Effort |
|---|---|---|---|
| `@page { size }` (méthode A) | PDF/aperçu uniquement | Oui (physique) | Déjà en place |
| Config pilote Windows | Oui, via Windows | Oui (mais réglé) | Faible |
| QZ Tray (méthode B) | Total (largeur imposée) | Non | ✅ Implémenté |
| PDF côté backend | Taille du PDF correcte | Oui (physique) | Moyen |

QZ Tray (B) est en place et utilisé automatiquement dès qu'une imprimante est
configurée dans « Paramètres d'impression… ». Sans agent installé sur le
poste, l'app retombe sur la méthode A (config pilote en dépannage).
