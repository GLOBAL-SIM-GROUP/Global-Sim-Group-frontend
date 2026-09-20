import { useRouteContext } from "@tanstack/react-router";

import { useSessionBootstrap } from "#/core/auth";
import { NotificationsProvider } from "#/core/notifications";
import { PortailNotificationsBridge } from "#/features/portail/components/portail-notifications-bridge";

import { ClientShell } from "./client-shell";

/**
 * Layout protégé de l'espace client (extrait de `routes/_espace-client.tsx` —
 * cf. `AuthenticatedLayout` pour la raison de ce découpage composant/route).
 * Même restauration de session que l'espace staff/résident
 * (`useSessionBootstrap`), mais monte `ClientShell` (navbar) au lieu
 * d'`AppShell` (sidebar) — les deux espaces sont volontairement indépendants.
 *
 * `NotificationsProvider` + `PortailNotificationsBridge` branchent le socket
 * `/notifications` du résident : statuts de commandes/demandes poussés en
 * temps réel (invalidation des requêtes + toast).
 */
export function ClientLayout() {
	const { auth, notifications } = useRouteContext({
		from: "/_espace-client",
	});
	useSessionBootstrap(auth);

	return (
		<NotificationsProvider client={notifications}>
			<ClientShell />
			<PortailNotificationsBridge />
		</NotificationsProvider>
	);
}
