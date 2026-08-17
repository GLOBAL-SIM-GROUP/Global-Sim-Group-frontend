# Gestion d'état

Chaque type d'état a **une** place désignée. On ne mélange pas.

## Matrice

| Type d'état | Où | Exemple |
| --- | --- | --- |
| État serveur (données API) | **TanStack Query** (`core/query`) | `useHealthQuery()`, requêtes des features |
| État de session / auth | **`core/auth`** (snapshot `useSyncExternalStore`) | `useCurrentUser()`, `useCan()` |
| État d'URL (params, query, hash) | **TanStack Router** (search params, path params) | filtre de liste partageable, pagination |
| État de formulaire | **TanStack Form** (`@tanstack/react-form`) | login, formulaires des features |
| État local transitoire d'un composant | **`useState`** | panneau ouvert/fermé, champ non persisté |

## TanStack Query

- **Singleton** `queryClient` dans `core/query/query-client.ts` (une instance
  pour tout le cycle de vie ; le router SSR-query l'utilise aussi).
- Defaults : `retry` limité aux erreurs réseau (le wrapper API gère déjà le
  refresh 401), `refetchOnWindowFocus: false`, `staleTime: 30 s`,
  mutations sans retry automatique.
- Clés de requêtes via `createQueryKeys(scope)` :

```ts
const contratsKeys = createQueryKeys('residence.contrats')
queryClient.invalidateQueries({ queryKey: contratsKeys.all })
queryClient.setQueryData(contratsKeys.detail(id), data)
```

- Invalidation **ciblée** après une mutation (jamais `invalidateQueries()` global).

## Règles

1. L'état serveur ne se duplique jamais dans `useState` : le cache Query est
   la source. `refetch()`/`setQueryData` pour rafraîchir.
2. Une feature n'instancie pas de `QueryClient` (le singleton suffit) et
   déclare ses clés via `createQueryKeys`.
3. L'état URL se lit/écrit via les search params du router — pas de `useState`
   synchronisé à la main.

## À ne pas faire

- ❌ État global "au cas où" (contexte fourre-tout) sans justification.
- ❌ Lire plusieurs fois une même requête avec des options différentes (cache
  incohérent) — centraliser dans un hook de feature.
- ❌ Synchroniser `useState` avec une requête (`useEffect` + `setState`) au lieu
  d'utiliser le cache Query.
