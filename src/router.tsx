import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createAuthSession, createLocalStorageTokenStore } from "#/core/auth";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();
	// Session créée une fois par router et logée dans le contexte : les guards
	// (`beforeLoad`) et le layout `_authenticated` lisent la même instance — pas
	// de double source de vérité. Tokens persistés (localStorage) : la session
	// survit au rechargement, restaurée par `auth.restore()` au démarrage.
	const auth = createAuthSession({
		tokenStorage: createLocalStorageTokenStore(),
	});

	const router = createTanStackRouter({
		routeTree,
		context: { ...context, auth },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
