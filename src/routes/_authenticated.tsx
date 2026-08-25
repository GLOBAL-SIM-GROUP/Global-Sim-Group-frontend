import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { AppShell } from "#/components/layout/app-shell";
import { AuthProvider, requireAuth } from "#/core/auth";

/**
 * Layout protégé : avant tout rendu, le guard redirige vers /login si la
 * session est absente. Sur le client, on restaure d'abord la session depuis
 * les tokens persistés (rechargement de page) ; en cas d'échec, la redirection
 * vers /login porte l'URL d'origine (`?next=`) pour y revenir après connexion.
 * `AuthProvider` est monté ici (pas à la racine) — la page de login, publique,
 * accède à la session via le contexte route.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		console.log(
			"[beforeLoad] _authenticated - starting, isAuthenticated:",
			context.auth.isAuthenticated,
		);
		await context.auth.restore();
		console.log(
			"[beforeLoad] _authenticated - after restore(), isAuthenticated:",
			context.auth.isAuthenticated,
		);
		if (!context.auth.isAuthenticated) {
			console.log("[beforeLoad] _authenticated - redirecting to login");
			// Sur le serveur, `restore()` ne fait rien (pas de localStorage) : la
			// redirection vers /login garde l'URL d'origine pour le retour.
			throw redirect({
				href: `/login?next=${encodeURIComponent(location.href)}`,
			});
		}
		console.log("[beforeLoad] _authenticated - allowing access");
		requireAuth(context.auth);
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { auth } = useRouteContext({ from: "/_authenticated" });

	return (
		<AuthProvider session={auth}>
			<AppShell>
				<Outlet />
			</AppShell>
		</AuthProvider>
	);
}
