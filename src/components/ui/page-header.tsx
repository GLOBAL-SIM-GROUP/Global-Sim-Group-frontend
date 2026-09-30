import type { ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "#/components/ui/breadcrumb";
import { cn } from "#/lib/utils";

/**
 * En-tête de page standard — design system « Concierge ». Fige le gabarit
 * répété dans toutes les pages : fil d'Ariane (injecté dans la barre du
 * shell via portal), titre `text-2xl font-semibold`, description muette,
 * actions alignées à droite. Voir `docs.global-sim-group.com/frontend/design-system/` § Hiérarchie.
 */
export function PageHeader({
	breadcrumb,
	title,
	titleClassName,
	description,
	actions,
}: {
	/** Maillons du fil d'Ariane ; le dernier est la page courante. */
	breadcrumb: BreadcrumbItem[];
	title: ReactNode;
	/** Classe(s) additionnelle(s) du titre — ex. `display-title` (serif). */
	titleClassName?: string;
	description?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<>
			<Breadcrumb items={breadcrumb} />
			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="min-w-0 space-y-1">
					<h1
						className={cn(
							"text-2xl font-semibold text-foreground",
							titleClassName,
						)}
					>
						{title}
					</h1>
					{description ? (
						<p className="text-muted-foreground">{description}</p>
					) : null}
				</section>
				{actions ? (
					<div className="flex flex-wrap items-center gap-2">{actions}</div>
				) : null}
			</div>
		</>
	);
}
