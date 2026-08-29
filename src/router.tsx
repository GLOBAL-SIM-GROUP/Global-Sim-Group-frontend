import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { createAuthSession, createLocalStorageTokenStore } from "#/core/auth";
import { createNotificationsClient } from "#/core/notifications";
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
	// Client de notifications temps réel, lié à la même session (connecte/
	// déconnecte le socket selon `auth.isAuthenticated`, reconnecte sur
	// rotation du token). Créé ici pour la même raison que `auth` : une seule
	// instance partagée par tout l'arbre de routes.
	const notifications = createNotificationsClient(auth);

	const router = createTanStackRouter({
		routeTree,
		context: { ...context, auth, notifications },
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
