import { Link } from "@tanstack/react-router";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { Fragment } from "react";

import { cn } from "#/lib/utils";

/** Une entrée de navigation (lien) d'un groupe ou hors accordéon. */
export interface NavItem {
	to?: string;
	label: string;
	icon: LucideIcon;
	/** `true` → actif uniquement sur le chemin exact (utile quand `to`
	 *  préfixe les autres entrées — ex. l'accueil de l'espace). */
	exact?: boolean;
	/** Clé React stable si `to` ne suffit pas à identifier l'entrée. */
	id?: string;
	/** `true` → réservée à la sidebar desktop (le menu mobile y accède
	 *  autrement — tab bar, navbar). */
	sidebarOnly?: boolean;
}

/**
 * Groupe de navigation en accordéon : `code` = identifiant du menu
 * déroulant ; `code: null` = entrées planes rendues sans header (ex.
 * « Accueil » / « Mon espace résident » au sommet).
 */
export interface NavGroupe {
	code: string | null;
	label: string;
	icon: LucideIcon;
	items: readonly NavItem[];
}

/**
 * Code du groupe accordéon contenant la route courante — sert à ouvrir le
 * bon menu au montage (ex. `/espace-client/panier` → « Mon suivi »).
 */
export function groupeDeLaRoute(
	groupes: readonly NavGroupe[],
	chemin: string,
): string | null {
	for (const groupe of groupes) {
		if (!groupe.code) continue;
		if (
			groupe.items.some(
				(item) =>
					item.to !== undefined &&
					(chemin === item.to || chemin.startsWith(`${item.to}/`)),
			)
		) {
			return groupe.code;
		}
	}
	return null;
}

const linkClassName =
	"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-sea-ink/50 hover:text-white";
const linkActiveClassName =
	"bg-lagoon/15 text-lagoon before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-lagoon before:rounded-r relative";
const subLinkClassName =
	"flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-all duration-200 hover:bg-sea-ink/50 hover:text-white relative";
const subActiveClassName = "bg-lagoon/20 text-lagoon font-medium";

/**
 * Liste de groupes en accordéon partagée entre la sidebar staff/résident
 * (`Sidebar`, entrées `RESIDENT_NAV`) et la sidebar client
 * (`ClientSidebar`, entrées `SERVICES_GROUPES`) : header icône + chevron,
 * sous-liste indentée `border-l`, plusieurs groupes ouvrables en même
 * temps (piloté par `ouverts`/`onToggle`), entrées actives en lagoon. Les
 * entrées `code: null` sont rendues en liens plats. `badgeCompteur`
 * affiche la pastille compteur (ex. panier) sur les sous-entrées
 * concernées.
 */
export function NavGroupes({
	groupes,
	ouverts,
	onToggle,
	badgeCompteur,
	onNavigate,
}: {
	groupes: readonly NavGroupe[];
	ouverts: readonly string[];
	onToggle: (code: string) => void;
	/** Compteur de pastille sur une sous-entrée — `undefined`/0 = masquée. */
	badgeCompteur?: (item: NavItem) => number | undefined;
	onNavigate?: () => void;
}) {
	const badgeDe = (item: NavItem): number => badgeCompteur?.(item) ?? 0;

	return (
		<>
			{groupes.map((groupe) => {
				const estOuvert = groupe.code !== null && ouverts.includes(groupe.code);
				return groupe.code === null ? (
					<Fragment key={groupe.label || "plan"}>
						{groupe.items.map((item) => (
							<li key={item.id ?? item.to}>
								<Link
									to={item.to as never}
									activeOptions={{ exact: item.exact }}
									activeProps={{ className: linkActiveClassName }}
									className={linkClassName}
									onClick={() => onNavigate?.()}
								>
									<item.icon
										className="size-4 text-gray-400 transition-colors"
										aria-hidden
									/>
									{item.label}
								</Link>
							</li>
						))}
					</Fragment>
				) : (
					<li key={groupe.code}>
						<button
							type="button"
							onClick={() => onToggle(groupe.code as string)}
							className={cn(
								linkClassName,
								"w-full text-left relative",
								estOuvert &&
									"text-lagoon bg-sea-ink/70 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-lagoon before:rounded-r",
							)}
						>
							<groupe.icon
								className={cn(
									"size-4 transition-colors",
									estOuvert ? "text-lagoon" : "text-gray-400",
								)}
								aria-hidden
							/>
							<span className="flex-1 text-left">{groupe.label}</span>
							<ChevronDown
								className={cn(
									"size-4 text-gray-400 transition-all duration-200",
									estOuvert && "rotate-180 text-lagoon",
								)}
								aria-hidden
							/>
						</button>

						{estOuvert ? (
							<ul className="ml-5 mt-1 space-y-1 border-l border-palm pl-2">
								{groupe.items.map((item) => {
									const compteur = badgeDe(item);
									return (
										<li key={item.id ?? item.to}>
											<Link
												to={item.to as never}
												activeOptions={{ exact: item.exact }}
												activeProps={{ className: subActiveClassName }}
												className={subLinkClassName}
												onClick={() => onNavigate?.()}
											>
												<item.icon
													className="size-3.5 shrink-0 text-gray-400 transition-colors"
													aria-hidden
												/>
												<span className="flex-1">{item.label}</span>
												{compteur > 0 ? (
													<span
														aria-hidden
														className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lagoon px-1 text-[0.65rem] font-semibold text-white"
													>
														{compteur > 99 ? "99+" : compteur}
													</span>
												) : null}
											</Link>
										</li>
									);
								})}
							</ul>
						) : null}
					</li>
				);
			})}
		</>
	);
}
