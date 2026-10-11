import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { useNombreArticlesPaniers } from "#/features/espace-client/hooks/use-panier-articles";

import { AccountMenu, SERVICES } from "./client-navbar";
import { NotificationBell } from "./notification-bell";

/**
 * Sidebar de l'espace client (desktop `lg+`, comptes rôle CLIENT) : même
 * gabarit sombre que la sidebar staff (`bg-sea-ink` figé, actif en
 * `bg-lagoon/15` + barre gauche), entrées = les mêmes `SERVICES` que le
 * menu mobile — une seule source de vérité.
 *
 * En dessous de `lg`, `ClientNavbar` (header slim + hamburger) et
 * `MobileTabBar` (téléphone) prennent le relais — trois présentations de la
 * même navigation, pas trois navigations.
 */
export function ClientSidebar() {
	const nombreArticles = useNombreArticlesPaniers();

	const linkClassName =
		"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-sea-ink/50 hover:text-white";
	const linkActiveClassName =
		"bg-lagoon/15 text-lagoon before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-lagoon before:rounded-r relative";

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
					{SERVICES.map((service) => (
						<li key={service.id}>
							<Link
								to={service.to as never}
								activeOptions={{ exact: service.exact }}
								activeProps={{ className: linkActiveClassName }}
								className={linkClassName}
							>
								<service.icon className="size-4" aria-hidden />
								{service.label}
							</Link>
						</li>
					))}
					<li>
						<Link
							to="/espace-client/panier"
							activeProps={{ className: linkActiveClassName }}
							className={linkClassName}
						>
							<ShoppingCart className="size-4" aria-hidden />
							Panier
							{nombreArticles > 0 ? (
								<span
									aria-hidden
									className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-lagoon px-1 text-[0.65rem] font-semibold text-white"
								>
									{nombreArticles > 99 ? "99+" : nombreArticles}
								</span>
							) : null}
						</Link>
					</li>
				</ul>
			</nav>

			<div className="mt-4 flex shrink-0 items-center justify-between gap-2 border-t border-palm pt-3">
				<NotificationBell className="text-gray-400 hover:bg-sea-ink/50 hover:text-white" />
				<AccountMenu variant="sidebar" />
			</div>
		</aside>
	);
}
