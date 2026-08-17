import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "#/core/query/query-client";

/**
 * Adaptateur d'intégration TanStack Start.
 *
 * `getContext()` expose le QueryClient **singleton** (et non une nouvelle
 * instance par appel de router). `setupRouterSsrQueryIntegration` enveloppe
 * lui-même le rendu du router avec `QueryClientProvider` via
 * `router.options.Wrap` : le composant exporté par défaut n'est donc pas
 * nécessaire, il documente le contrat d'intégration si on désactive le wrap
 * automatique.
 */
export function getContext() {
	return {
		queryClient: getQueryClient(),
	};
}

export default function TanstackQueryProvider({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<QueryClientProvider client={getQueryClient()}>
			{children}
		</QueryClientProvider>
	);
}
