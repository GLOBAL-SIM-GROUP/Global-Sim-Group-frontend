import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

/**
 * État vide standard — design system « Concierge ». Remplace les
 * « Aucun(e) … trouvé(e) » réécrits page par page : icône muette dans un
 * rond, titre, description, action optionnelle. Voir `docs.global-sim-group.com/frontend/design-system/`.
 */
export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: {
	icon?: LucideIcon;
	title: string;
	description?: ReactNode;
	/** Bouton/lien d'action, ex. créer le premier élément. */
	action?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center",
				className,
			)}
		>
			{Icon ? (
				<span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
					<Icon className="size-5" aria-hidden />
				</span>
			) : null}
			<div className="space-y-1">
				<p className="text-sm font-medium text-foreground">{title}</p>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{action}
		</div>
	);
}
