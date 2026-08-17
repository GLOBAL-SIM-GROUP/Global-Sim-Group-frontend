# Tests

## Outils installés

- **Vitest** (runner, `jsdom` comme environnement) + **@testing-library/react**,
  **@testing-library/jest-dom**, **@testing-library/user-event**.
- Config : `vitest.config.ts` (jsdom, `src/test/setup.ts`, alias `#/*` et `@/*`).

## Pyramide de tests

| Niveau | Exemples | Où |
| --- | --- | --- |
| Unitaire (fonctions pures) | `core/permissions` (`hasPermission`), `core/api/api-error` (normalisation), `core/query/query-keys` | `*.test.ts` à côté du fichier |
| Intégration composant | formulaire de login (mock du client API) | `src/routes/login.test.tsx` |
| E2E / smoke | login réel contre le backend dev | manuel (`npm run dev` + devtools) |

La fondation cible les deux premiers niveaux ; les features ajoutent leurs
propres tests en suivant le même modèle.

## Écrire un test

```bash
npm test                # vitest run (une fois)
npm test -- --watch     # mode watch pendant le dev
```

```ts
// src/core/permissions/permissions.test.ts
import { describe, expect, it } from 'vitest'
import { hasPermission } from './permissions'

it('accorde une permission présente', () => {
  expect(hasPermission(['FINANCES.VOIR'], 'FINANCES.VOIR')).toBe(true)
})
```

## Tests UI (login)

- Le client API est **mocké** (`authApi.login`, `authApi.me`) ; la session est
  une vraie `createAuthSession({ tokenStorage: createMemoryTokenStore() })` ou
  une session factice.
- On teste : le mapping des erreurs de champ (`details[].property` →
  erreur sous l'input), l'affichage des messages i18n, l'état `isSubmitting`.

## À ne pas faire

- ❌ Tester l'implémentation (snapshots de classes CSS, détails internes).
- ❌ Tests réseau réels dans la suite Vitest (lents, dépendants de l'env).
- ❌ Ignorer un test qui échoue — le corriger ou le supprimer avec justification.
