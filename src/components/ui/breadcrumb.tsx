import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

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
	return (
		<nav aria-label="Fil d'Ariane" className="text-sm">
			<ol className="flex flex-wrap items-center gap-1.5">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					return (
						<li key={item.label} className="flex items-center gap-1.5">
							{item.to && !isLast ? (
								<Link
									to={item.to as never}
									search={item.search as never}
									className="text-lagoon transition-colors hover:underline"
								>
									{item.label}
								</Link>
							) : (
								<span
									aria-current={isLast ? "page" : undefined}
									className={
										isLast
											? "font-medium text-foreground"
											: "text-muted-foreground"
									}
								>
									{item.label}
								</span>
							)}
							{!isLast ? (
								<ChevronRight
									className="size-3.5 text-muted-foreground"
									aria-hidden
								/>
							) : null}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
