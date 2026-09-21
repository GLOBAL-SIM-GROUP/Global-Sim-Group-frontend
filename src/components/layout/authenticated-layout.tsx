import { Outlet, useRouteContext } from "@tanstack/react-router";

import { AuthProvider, useSessionBootstrap } from "#/core/auth";
import { NotificationsProvider } from "#/core/notifications";

import { AppLaunchSplash } from "./app-launch-splash";
import { AppShell } from "./app-shell";
import { NotificationsBridge } from "./notifications-bridge";

/**
 * Layout protégé (extrait de `routes/_authenticated.tsx` — un composant
 * exporté en plus de `Route` empêche TanStack Router de découper cette route
 * dans son propre chunk, voir l'avertissement "will not be code-split").
 */
export function AuthenticatedLayout() {
	const { auth, notifications } = useRouteContext({ from: "/_authenticated" });
	useSessionBootstrap(auth);

	return (
		<AuthProvider session={auth}>
			<NotificationsProvider client={notifications}>
				<AppLaunchSplash ready={auth.isAuthenticated} />
				<NotificationsBridge />
				<AppShell>
					<Outlet />
				</AppShell>
			</NotificationsProvider>
		</AuthProvider>
	);
}
