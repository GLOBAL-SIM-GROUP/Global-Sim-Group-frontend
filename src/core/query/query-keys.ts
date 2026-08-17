/**
 * Fabrique de clés de requêtes (convention TanStack Query).
 *
 * Chaque feature déclare ses clés depuis son scope :
 *
 *   const contratsKeys = createQueryKeys('residence.contrats')
 *   queryClient.getQueryData(contratsKeys.list())
 *   queryClient.invalidateQueries({ queryKey: contratsKeys.all })
 *
 * Une clé est toujours un tableau ordonné — jamais un objet seul — pour que
 * l'égalité de clé reste déterministe (comparaison par éléments, pas par
 * référence d'objet).
 */
export type QueryKeyPart = string | number | boolean | null | undefined;

export function createQueryKeys<Scope extends string>(scope: Scope) {
	return {
		all: [scope] as const,
		list: (...filters: QueryKeyPart[]) => [scope, "list", ...filters] as const,
		detail: (id: QueryKeyPart) => [scope, "detail", id] as const,
	};
}
