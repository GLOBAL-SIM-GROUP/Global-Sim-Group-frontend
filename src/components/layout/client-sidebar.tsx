import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { useNombreArticlesPaniers } from "#/features/portail/hooks/use-panier-articles";

import { AccountMenu, SERVICES_GROUPES } from "./client-navbar";
import { groupeDeLaRoute, NavGroupes } from "./nav-groupes";

/**
 * Sidebar de l'espace client (desktop `lg+`, comptes rôle CLIENT) : même
 * gabarit sombre que la sidebar staff (`bg-sea-ink` figé, actif en
 * `bg-lagoon/15` + barre gauche) et même mécanique d'accordéon que les
 * modules staff / groupes résidents (header + chevron + sous-liste
 * `border-l`, un seul groupe ouvert via `openGroupe`, celui de la route
 * courante ouvert au montage). Entrées = `SERVICES_GROUPES`, la même source
 * que le menu mobile — une seule source de vérité.
 *
 * En dessous de `lg`, `ClientNavbar` (header slim + hamburger) et
 * `MobileTabBar` (téléphone) prennent le relais — trois présentations de la
 * même navigation, pas trois navigations.
 */
export function ClientSidebar() {
	const nombreArticles = useNombreArticlesPaniers();
	const { pathname } = useLocation();

	// Groupe accordéon contenant la route courante (ex. `/espace-client/panier`
	// → « Mon suivi ») — ouvert au montage, comme les modules staff.
	const [ouverts, setOuverts] = useState<string[]>(() => {
		const groupe = groupeDeLaRoute(SERVICES_GROUPES, pathname);
		return groupe ? [groupe] : [];
	});

	return (
		<aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-palm bg-sea-ink px-3 py-4 lg:flex">
			<Link
				to="/espace-client"
				className="flex shrink-0 flex-col items-center gap-2 px-3"
			>
				<img
					src="/logo.png"
					alt="GLOBAL SIM GROUP"
					className="size-24 shrink-0 rounded-md object-contain"
				/>
				<span className="text-center text-base font-semibold text-white">
					GLOBAL SIM GROUP
				</span>
			</Link>

			<nav
				aria-label="Services"
				className="mt-6 min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<ul className="space-y-1">
					<NavGroupes
						groupes={SERVICES_GROUPES}
						ouverts={ouverts}
						onToggle={(code) =>
							setOuverts((current) =>
								current.includes(code)
									? current.filter((c) => c !== code)
									: [...current, code],
							)
						}
						badgeCompteur={(item) =>
							item.to === "/espace-client/panier" ? nombreArticles : undefined
						}
					/>
				</ul>
			</nav>

			{/* La cloche de notifications vit dans le topbar sticky desktop
			    (même disposition que l'en-tête résident/staff d'AppShell). */}
			<div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-palm pt-3">
				<AccountMenu variant="sidebar" />
			</div>
		</aside>
	);
}
