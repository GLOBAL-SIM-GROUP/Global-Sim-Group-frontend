import type { ReactNode } from "react";

import * as m from "#/paraglide/messages";

import { LogoutButton } from "./logout-button";
import { NotificationButton } from "./notification-button";
import { Sidebar } from "./sidebar";

/**
 * Coquille applicative des écrans authentifiés : header (langue, déconnexion —
 * la marque et l'utilisateur passent dans la sidebar sur desktop, la marque
 * reste dans le header sur mobile où la sidebar est masquée), sidebar gauche
 * et zone de contenu.
 */
export function AppShell({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh">
			{/* Sidebar pleine hauteur, collée en haut de page (desktop). La marque
			    et la déconnexion y vivent ; le header ne la chevauche pas. */}
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
					<div className="flex h-14 w-full items-center gap-4 px-4">
						<span className="text-lg font-semibold lg:hidden">
							{m.app_name()}
						</span>
						<div className="ml-auto flex items-center gap-3">
							<NotificationButton />
							{/* Déconnexion : dans le footer de la sidebar sur desktop
							    (masquée sous lg), donc dans le header en mobile. */}
							<span className="lg:hidden">
								<LogoutButton />
							</span>
						</div>
					</div>
				</header>
				<main className="min-w-0 flex-1">{children}</main>
			</div>
		</div>
	);
}
