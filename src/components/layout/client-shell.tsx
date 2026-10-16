import { Outlet } from "@tanstack/react-router";
import { useState } from "react";

import { useCan } from "#/core/auth";

import { AppBackground } from "./app-background";
import { ClientNavbar, MobileTabBar } from "./client-navbar";
import { ClientSidebar } from "./client-sidebar";
import { NotificationBell } from "./notification-bell";
import { PanierBadgeButton } from "./panier-badge-button";

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
 *
 * Sur desktop (`lg+`), le topbar sticky reprend la même disposition que
 * l'en-tête d'`AppShell` (résident/staff) : fil d'Ariane à gauche, panier +
 * notifications à droite — la sidebar n'a alors plus besoin de la cloche.
 * La cible `#app-navbar-breadcrumb` (vers laquelle `Breadcrumb` se teleporte
 * via `createPortal`) n'est montée que sous `lg` : l'élément est `display:
 * none` en dessous et un portal dans un nœud caché rendrait le fil invisible
 * — sur mobile il reste donc rendu inline dans la page, comme avant.
 */
export function ClientShell() {
	const [estDesktop] = useState(
		() =>
			typeof window.matchMedia === "function" &&
			window.matchMedia("(min-width: 1024px)").matches,
	);
	// Même règle que l'AppShell résident : le panier n'existe que pour les
	// comptes pouvant atteindre les endpoints `/…/portail`.
	const canPortail = useCan("PORTAIL.VOIR");
	return (
		<div className="relative flex min-h-dvh">
			<AppBackground />
			<ClientSidebar />
			<div className="relative z-10 flex min-w-0 flex-1 flex-col">
				<ClientNavbar />
				<header className="sticky top-0 z-40 hidden border-b bg-background/95 backdrop-blur lg:block">
					<div className="flex min-h-14 w-full items-center gap-1 px-6 py-1.5">
						{estDesktop ? (
							<div
								id="app-navbar-breadcrumb"
								className="min-w-0 flex-1 overflow-hidden"
							/>
						) : (
							<div className="flex-1" />
						)}
						{canPortail ? (
							<PanierBadgeButton to="/espace-client/panier" />
						) : null}
						<NotificationBell />
					</div>
				</header>
				<main className="w-full min-w-0 flex-1 px-6">
					<Outlet />
				</main>
			</div>
			<MobileTabBar />
		</div>
	);
}
