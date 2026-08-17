import {
	createFileRoute,
	Outlet,
	useRouteContext,
} from "@tanstack/react-router";
import { AppShell } from "#/components/layout/app-shell";
import { AuthProvider, requireAuth } from "#/core/auth";

/**
 * Layout protégé : avant tout rendu, le guard redirige vers /login si la
 * session est absente. `AuthProvider` est monté ici (pas à la racine) — la
 * page de login, publique, accède à la session via le contexte route.
 */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context }) => {
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
