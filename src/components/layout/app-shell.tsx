import type { ReactNode } from "react";
import { useCurrentUser } from "#/core/auth";
import * as m from "#/paraglide/messages";
import { LanguageSelector } from "./language-selector";
import { LogoutButton } from "./logout-button";

/**
 * Coquille applicative des écrans authentifiés : header (marque, sélecteur
 * de langue, utilisateur + rôle, déconnexion) et zone de contenu.
 */
export function AppShell({ children }: { children: ReactNode }) {
	const user = useCurrentUser();

	return (
		<div className="min-h-dvh bg-background">
			<header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
				<div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
					<span className="text-lg font-semibold">{m.app_name()}</span>
					<div className="flex items-center gap-3">
						<LanguageSelector />
						<span className="hidden text-sm text-muted-foreground sm:inline">
							{user?.login}
							{user?.role ? <span className="ml-1">· {user.role}</span> : null}
						</span>
						<LogoutButton />
					</div>
				</div>
			</header>
			<main className="mx-auto w-full max-w-6xl">{children}</main>
		</div>
	);
}
