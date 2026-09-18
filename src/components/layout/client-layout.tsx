import { useRouteContext } from "@tanstack/react-router";

import { useSessionBootstrap } from "#/core/auth";

import { ClientShell } from "./client-shell";

/**
 * Layout protégé de l'espace client (extrait de `routes/_espace-client.tsx` —
 * cf. `AuthenticatedLayout` pour la raison de ce découpage composant/route).
 * Même restauration de session que l'espace staff/résident
 * (`useSessionBootstrap`), mais monte `ClientShell` (navbar) au lieu
 * d'`AppShell` (sidebar) — les deux espaces sont volontairement indépendants.
 */
export function ClientLayout() {
	const { auth } = useRouteContext({ from: "/_espace-client" });
	useSessionBootstrap(auth);

	return <ClientShell />;
}
