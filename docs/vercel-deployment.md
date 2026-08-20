# Déploiement sur Vercel — Frontend GLOBAL SIM GROUP · SIM

Guide de déploiement du frontend **TanStack Start** sur **Vercel**. Toutes les
modifications ci-dessous ont été **vérifiées localement** sur ce dépôt
(build de production + serveur de dev) avant rédaction.

> Dépôt : `GLOBAL-SIM-GROUP/Global-Sim-Group-frontend` (branche `main`)
> Stack : TanStack Start 1.168 · Vite 8 · React 19 · Nitro 3 (déjà en devDependencies)

---

## 1. Vue d'ensemble

Vercel héberge **uniquement le frontend** (rendu SSR). Le backend NestJS
(`/api/v1`) et PostgreSQL restent sur leur hôte actuel (`dev.sim.strife-cyber.org`
en dev, à remplacer par l'instance de production).

```text
Navigateur
   │  même origine (le navigateur n'appelle que le domaine Vercel)
   ▼
Vercel ──> Function Node (SSR TanStack Start, via Nitro)
   │
   └── /api/* ──rewrite──> Backend NestJS (https://…/api/v1)
```

Deux points de blocage à connaître :

1. **Vercel ne peut pas exécuter `server.mjs` tel quel** (hôte `node:http` custom
   prévu pour Docker). La voie officielle 2026 = **plugin Nitro** (`nitro/vite`) :
   Vercel détecte TanStack Start / Nitro et génère automatiquement une Vercel
   Function (Fluid Compute) qui fait le SSR.
2. **Le fichier `server.mjs` à la racine entre en collision avec Nitro** : Nitro
   le prend pour son entrée serveur et échoue (`MISSING_EXPORT`). Il faut le
   renommer. Détail au §4.2.

Le relais `/api/*` (qui était fait par `server.mjs` en Docker) est remplacé par
une **rewrite Vercel** : mêmes appels relative (`/api/v1`), aucun CORS à gérer.

---

## 2. Prérequis

- Compte [Vercel](https://vercel.com) + accès au repo GitHub (déjà poussé).
- **Node.js 22** côté Vercel (aligné sur le `Dockerfile` `node:22-alpine`).
  Se règle dans **Project Settings → Node.js Version** (ou via `engines` dans
  `package.json`, optionnel).
- `nitro` est **déjà installé** (`devDependencies`, v3.0.260610-beta) — rien à installer.

---

## 3. Modifications du code

Trois modifications, listées avec leur état avant/après. Les exemples de diff
supposent que vous êtes à la racine du frontend (`Code/Frontend/global-sim-group`).

### 3.1 — `vite.config.ts` : enregistrer le plugin Nitro

Ajouter l'import et le plugin, **juste après `tanstackStart()`** :

```diff
 import { tanstackStart } from "@tanstack/react-start/plugin/vite";
 import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
 import { defineConfig } from "vite";
+import { nitro } from "nitro/vite";

 const config = defineConfig({
   ...
   plugins: [
     // devtools-vite doit rester la première entrée du tableau.
     devtools(),
     tailwindcss(),
     tanstackStart(),
+    nitro(),
     viteReact(),
     babel({ presets: [reactCompilerPreset()] }),
   ],
 });
```

### 3.2 — Renommer `server.mjs` → `prod-server.mjs`

**Pourquoi.** Nitro auto-détecte tout fichier `server.*` à la racine comme son
entrée serveur. `server.mjs` (l'hôte Docker) n'exporte rien → le build échoue :

```text
[MISSING_EXPORT] "default" is not exported by "server.mjs".
    at #nitro/virtual/routing:14:8
```

**Vérifié :** avec `server.mjs` renommé, le build Nitro passe (`.output/nitro.json`
généré, SSR intégré) et le serveur de dev répond en HTTP 200.

**Action :**

```bash
git mv server.mjs prod-server.mjs
```

Puis mettre à jour les **deux références** du `Dockerfile` :

```diff
-COPY server.mjs ./server.mjs
+COPY prod-server.mjs ./prod-server.mjs
 ...
-CMD ["node", "server.mjs"]
+CMD ["node", "prod-server.mjs"]
```

Le fichier n'importe toujours `./dist/server/server.js` (toujours produit par
`vite build`), donc le runtime Docker est inchangé.

Mettre aussi à jour la doc qui nomme `server.mjs` :
`README.md` (§ Docker) et `docs/development.md`. Les fichiers `prompt-*.md`
sont des archives historiques — ne pas les toucher.

### 3.3 — `vercel.json` : relais `/api/*` + anti-cache

Créer `vercel.json` à la racine du frontend :

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "tanstack-start",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://dev.sim.strife-cyber.org/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "x-vercel-enable-rewrite-caching", "value": "0" }
      ]
    }
  ]
}
```

- **`destination`** : remplacer `dev.sim.strife-cyber.org` par l'URL du backend
  de **production** (l'instance de dev n'est pas pérenne).
- **`x-vercel-enable-rewrite-caching: 0`** : les projets Vercel créés depuis
  avril 2026 honorent par défaut les headers `cache-control` du backend sur les
  rewrites externes. Or les réponses d'une API JWT (login, refresh, données par
  utilisateur) ne doivent **jamais** être mises en cache au CDN. Ce header
  désactive la mise en cache sur `/api/*`.
- **`framework: "tanstack-start"`** : rend le build déterministe même si la
  détection automatique échoue. Peut être retiré une fois l'import confirmé.
- Les rewrites externes Vercel relaient bien **tous les verbes** (POST/PUT/
  DELETE avec corps) — le login/refresh fonctionne.
- Limite à connaître : corps de requête/réponse ≤ 4,5 Mo pour une Function
  (les uploads lourds devront passer par Vercel Blob, cf. §9).

#### Alternative au rewrite : URL absolue + CORS

Si vous préférez que le navigateur appelle le backend en direct :

```env
VITE_API_URL=https://mon-backend.example.com/api/v1
```

…**et** ajouter le domaine Vercel à la liste CORS du backend NestJS (le CORS du
backend refuse actuellement `localhost:*` ; il accepterait le domaine Vercel).
Inconvénient : le backend devient directement atteignable (il l'est déjà) et il
faut maintenir la config CORS. Le rewrite est recommandé.

---

## 4. Variables d'environnement

| Variable       | Utilisation                          | Sur Vercel |
|----------------|--------------------------------------|------------|
| `VITE_API_URL` | URL de l'API, **inlinée au build**. Défaut `/api/v1` (même origine) | Aucune valeur requise si on garde le rewrite. Le défaut convient. |
| `API_TARGET`   | Cible du relais `/api/*` dans `server.mjs` (Docker) | **Non utilisé** sur Vercel (le rewrite remplace). Peut rester absent. |
| `VITE_APP_TITLE` | Titre de l'app, optionnel | Optionnel |

Aucun secret n'est requis côté Vercel. Rappel (spec §21) : **ne jamais mettre de
secret dans une variable `VITE_`** — elle est publique dans le bundle navigateur.

Les variables se règlent dans **Project Settings → Environment Variables**
(Production / Preview / Development), puis un redeploy est nécessaire.
`VITE_API_URL` étant inlinée au build, la changer = reconstruire.

---

## 5. Import du projet sur Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** du repo
   `GLOBAL-SIM-GROUP/Global-Sim-Group-frontend`.
2. **Framework Preset** : `TanStack Start` (auto-détecté) — installer et build
   sont fournis par défaut (`npm install` / `npm run build`), aucun réglage.
3. **Node.js Version** : `22.x` dans les réglages du projet.
4. **Deploy**. Vercel lit `.vercel/output` (Build Output API) généré par Nitro
   avec son preset `vercel` : SSR → Function Node, assets → static.

Le guide officiel Vercel :
[Deploy a TanStack Start app to Vercel](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel).

---

## 6. Vérifications

### Avant le push

```bash
npm run build                    # OK : dist/ (client + server) + .output/ (Nitro)
```

Test du **build Vercel exact** en local (CLI) :

```bash
npx vercel build                 # → génère .vercel/output avec le preset vercel
npx vercel dev                   # → sert localement comme en production
```

### Après le déploiement

1. `GET /` → rendu SSR (HTML complet, pas de shell vide) ; `GET /login` → 200.
2. `POST /api/v1/auth/login` avec le compte de démo → **valide le rewrite**
   (verbe POST + corps + headers `Authorization` relayés, absence de CORS).
3. Naviguer entre routes authentifiées (préload/router) ; rafraîchir une page
   profonde (SSR à la bonne route, pas de 404).
4. Vérifier les logs du déploiement (Dashboard → Deployments → logs) s'il y a
   la moindre erreur 500/404.

---

## 7. Déploiements continus

- **Git** : chaque push sur `main` → déploiement production ; chaque PR →
  preview avec URL dédiée. Les rewrites `vercel.json` s'appliquent aussi aux
  previews.
- **CLI** : `npx vercel` (preview), `npx vercel --prod` (production),
  `npx vercel promote <url>` (promouvoir une preview).
- **Rollback** : Dashboard → Deployments → ⋮ → Promote previous / Redeploy.

---

## 8. Impact sur le déploiement Docker existant

- Le `Dockerfile` continue de fonctionner après le §3.2 (les deux références
  sont mises à jour). `docker compose up --build` → toujours `http://localhost:3004`.
- `npm run build` produit **en plus** `.output/` (bundle Nitro) → builds locaux
  légèrement plus lents. `.output` est déjà dans `.gitignore` (ligne 11).
- Variante avancée : n'activer `nitro()` que sur Vercel pour garder des builds
  Docker rapides :

  ```ts
  // vite.config.ts
  const isVercel = process.env.VERCEL === "1";
  // ... plugins: [...tanstackStart(), ...(isVercel ? [nitro()] : []), viteReact()]
  ```

  La configuration documentée ici (Nitro **toujours actif**) est la plus simple
  et a été testée avec le build Docker et le dev. La variante conditionnelle est
  fine si vous souhaitez préserver la vitesse des builds locaux.

---

## 9. Dépannage

| Symptôme | Cause | Correctif |
|---|---|---|
| `[MISSING_EXPORT] "default" is not exported by "server.mjs"` | Nitro prend `server.mjs` racine pour son entrée | Renommer en `prod-server.mjs` (§3.2) |
| Routes 404 sur le déployé | `nitro()` absent du `vite.config.ts` (build statique sans SSR) | Ajouter `nitro()` et redéployer |
| `POST /login` échoue / erreur réseau | Rewrite `/api` incorrect ou cache CDN sur `/api` | Vérifier `vercel.json` (§3.3), notamment `x-vercel-enable-rewrite-caching: 0` |
| Erreur CORS | `VITE_API_URL` en absolu sans CORS backend | Retour au rewrite, ou ajouter le domaine Vercel au CORS NestJS |
| `413 FUNCTION_PAYLOAD_TOO_LARGE` | Limite 4,5 Mo d'une Function | Uploader les gros fichiers via Vercel Blob (pas via le proxy `/api`) |
| Build OK en local, échec Vercel | Version Node différente | Fixer Node 22.x dans Project Settings |
| `/api/*` renvoie du HTML de l'app | Rewrite masqué par la route SSR | Source du rewrite plus spécifique, ou `framework` présent dans `vercel.json` |
| Port 3000 capturé par WSL en local | Environnement Windows/WSL | Utiliser le port de dev configuré (3001) — sans rapport avec Vercel |

---

## 10. Récapitulatif des fichiers touchés

| Fichier | Modification |
|---|---|
| `vite.config.ts` | + import et plugin `nitro()` |
| `server.mjs` | renommé → `prod-server.mjs` |
| `Dockerfile` | `COPY` + `CMD` pointés sur `prod-server.mjs` |
| `vercel.json` | **créé** : rewrite `/api/*` + anti-cache |
| `README.md`, `docs/development.md` | mentions `server.mjs` → `prod-server.mjs` |

Modifications **vérifiées localement** :
`npm run build` passe (dist + `.output/nitro.json`, preset `node-server` en
local, `vercel` sur Vercel) · `npm run dev` répond en HTTP 200 · `server.mjs`
présent + `nitro()` → erreur `MISSING_EXPORT` confirmée (d'où le rename).
