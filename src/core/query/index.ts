/**
 * Frontière d'état serveur du frontend (TanStack Query).
 *
 * Singleton `queryClient`, clés de requêtes typées, hooks partagés. Les
 * features déclarent leurs propres clés via `createQueryKeys(scope)` et
 * n'instancient jamais de QueryClient.
 */

export { useHealthQuery } from "./hooks";
export { getQueryClient, queryClient } from "./query-client";
export type { QueryKeyPart } from "./query-keys";
export { createQueryKeys } from "./query-keys";
