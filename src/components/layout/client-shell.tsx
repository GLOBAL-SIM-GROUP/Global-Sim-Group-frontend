import { Outlet } from "@tanstack/react-router";

import { SiteFooter } from "#/components/site-footer";

import { AppBackground } from "./app-background";
import { ClientNavbar, MobileTabBar } from "./client-navbar";
import { ClientSidebar } from "./client-sidebar";

/**
 * Layout de l'espace client (comptes rôle CLIENT) — sidebar verticale
 * (`ClientSidebar`, `lg+`), jamais la sidebar staff/résident (`AppShell`/
 * `Sidebar`) qui mène dans `_authenticated`. Volontairement indépendant de
 * `AuthenticatedLayout`.
 *
 * `AppBackground` (même fond animé que l'espace de gestion) est réutilisable
 * tel quel : ses halos sont excentrés à droite, hors de la sidebar.
 *
 * Sous `lg`, `ClientNavbar` (header slim + hamburger) et `MobileTabBar`
 * (barre d'onglets basse, `sm:hidden`) prennent le relais — les pages
 * gardent leur `pb-16`/`pb-28` pour ne pas passer sous la barre fixe.
 */
export function ClientShell() {
	return (
		<div className="relative flex min-h-dvh">
			<AppBackground />
			<ClientSidebar />
			<div className="relative z-10 flex min-w-0 flex-1 flex-col">
				<ClientNavbar />
				<main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
					<Outlet />
				</main>
				<div className="mt-10">
					<SiteFooter variant="client" />
				</div>
			</div>
			<MobileTabBar />
		</div>
	);
}
