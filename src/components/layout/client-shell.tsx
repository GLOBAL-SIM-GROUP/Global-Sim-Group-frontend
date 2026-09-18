import { Outlet } from "@tanstack/react-router";

import { AppBackground } from "./app-background";
import { ClientNavbar } from "./client-navbar";

/**
 * Layout de l'espace client (comptes rôle CLIENT) — navbar horizontale
 * (`ClientNavbar`), jamais la sidebar staff/résident (`AppShell`/`Sidebar`).
 * Volontairement indépendant de `AuthenticatedLayout` : à monter par un futur
 * layout de route réservé au rôle CLIENT, séparé de `_authenticated` (dont le
 * composant impose `AppShell`).
 *
 * `AppBackground` (même fond animé que l'espace de gestion) est réutilisable
 * tel quel : ses halos sont excentrés à droite pour éviter la sidebar
 * staff/résident, absente ici — sans elle, le fond s'étale simplement sur
 * toute la largeur.
 */
export function ClientShell() {
	return (
		<div className="relative flex min-h-dvh flex-col">
			<AppBackground />
			<ClientNavbar />
			<main className="relative z-10 min-w-0 flex-1">
				<Outlet />
			</main>
		</div>
	);
}
