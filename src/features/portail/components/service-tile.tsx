import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { Badge } from "#/components/ui/badge";

export type TuileBadgeVariant =
	| "success"
	| "warning"
	| "info"
	| "danger"
	| "neutral"
	| "lagoon";

/**
 * Vignette de service — bento : `large` agrandit la tuile sur 2 colonnes
 * (mise en avant), `badge` affiche un compteur réel (jamais une valeur
 * inventée) en haut à droite. Partagée entre l'accueil de l'espace client
 * (`/espace-client`) et celui du portail résident (`/residence/portail`).
 */
export function ServiceTile({
	to,
	icon: Icon,
	label,
	description,
	large = false,
	badge,
}: {
	to: string;
	icon: LucideIcon;
	label: string;
	description: string;
	large?: boolean;
	badge?: { label: string; variant: TuileBadgeVariant };
}) {
	return (
		<Link
			to={to}
			className={`group flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md ${
				large ? "sm:col-span-2" : ""
			}`}
		>
			<div className="flex items-center justify-between">
				<span className="grid size-10 place-items-center rounded-lg bg-lagoon/15">
					<Icon className="size-5 text-lagoon" aria-hidden />
				</span>
				{badge ? (
					<Badge variant={badge.variant}>{badge.label}</Badge>
				) : (
					<ChevronRight
						className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				)}
			</div>
			<div className="space-y-1">
				<p className="font-semibold text-foreground">{label}</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</Link>
	);
}
