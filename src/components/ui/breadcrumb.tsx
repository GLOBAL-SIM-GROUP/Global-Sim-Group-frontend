import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface BreadcrumbItem {
	label: string;
	/** Chemin de route (littéral) ; absent = page courante. */
	to?: string;
	/** Search params du lien (objet plat). */
	search?: Record<string, string | undefined>;
}

/**
 * Fil d'Ariane : maillons cliquables (liens typés) séparés par des chevrons,
 * le dernier étant la page courante (`aria-current="page"`). Le `to` est un
 * littéral de route validé par le routeTree à l'exécution (cast local : le
 * composant reste générique, les pages passent des routes connues).
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
	const [navbarTarget, setNavbarTarget] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setNavbarTarget(document.getElementById("app-navbar-breadcrumb"));
	}, []);

	const breadcrumb = (
		<nav aria-label="Fil d'Ariane" className="overflow-hidden text-sm">
			<ol className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<li
							key={`${item.to ?? "current"}-${item.label}`}
							className="flex min-w-0 items-center gap-1.5"
						>
							{item.to && !isLast ? (
								<Link
									to={item.to as never}
									search={item.search as never}
									className="shrink-0 text-lagoon transition-colors hover:underline"
								>
									{item.label}
								</Link>
							) : (
								<span
									aria-current={isLast ? "page" : undefined}
									className={
										isLast
											? "truncate font-medium text-foreground"
											: "shrink-0 text-muted-foreground"
									}
								>
									{item.label}
								</span>
							)}
							{!isLast ? (
								<ChevronRight
									className="size-3.5 shrink-0 text-muted-foreground"
									aria-hidden
								/>
							) : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);

	return navbarTarget ? createPortal(breadcrumb, navbarTarget) : breadcrumb;
}
