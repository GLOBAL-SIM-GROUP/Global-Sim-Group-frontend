import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { AppShell } from "#/components/layout/app-shell";
import { AuthProvider, requireAuth } from "#/core/auth";
import { NotificationsProvider } from "#/core/notifications";

/**
 * Layout protégé : avant tout rendu, le guard redirige vers /login si la
 * session est absente. Sur le client, on restaure d'abord la session depuis
 * les tokens persistés (rechargement de page) ; en cas d'échec, la redirection
 * vers /login porte l'URL d'origine (`?next=`) pour y revenir après connexion.
 * `AuthProvider` est monté ici (pas à la racine) — la page de login, publique,
 * accède à la session via le contexte route. `NotificationsProvider` est monté
 * juste après : le socket temps réel ne se connecte que pour une session
 * authentifiée.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		await context.auth.restore();
		if (!context.auth.isAuthenticated) {
			// Sur le serveur, `restore()` ne fait rien (pas de localStorage) : la
			// redirection vers /login garde l'URL d'origine pour le retour.
			throw redirect({
				href: `/login?next=${encodeURIComponent(location.href)}`,
			});
		}
		requireAuth(context.auth);
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { auth, notifications } = useRouteContext({ from: "/_authenticated" });

	return (
		<AuthProvider session={auth}>
			<NotificationsProvider client={notifications}>
				<AppShell>
					<Outlet />
				</AppShell>
			</NotificationsProvider>
		</AuthProvider>
	);
}
