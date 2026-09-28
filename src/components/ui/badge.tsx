import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Badge de statut — design system « Concierge ». Une seule source de vérité
 * pour les couleurs de statut : les variantes sémantiques utilisent les
 * tokens `--status-*` (fond doux + texte plein, clair ET sombre), et
 * remplacent les maps `*_STATUT_BADGE` à hex flat-ui en dur.
 *
 * Convention : les maps par module deviennent `statut → variante Badge`
 * (`EN_ATTENTE → "warning"`, `PRET → "success"`, `ANNULEE → "danger"`…).
 * Voir `docs/design-system.md`.
 */
const badgeVariants = cva(
	"inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
	{
		variants: {
			variant: {
				/** Succès : payé, prêt, actif, validé, terminé ok. */
				success: "bg-success-bg text-success",
				/** Attention : en cours, en attente d'action, bientôt dû. */
				warning: "bg-warning-bg text-warning",
				/** Information : déposé, envoyé, réservé, planifié. */
				info: "bg-info-bg text-info",
				/** Problème : annulé, refusé, impayé, en retard. */
				danger: "bg-danger-bg text-danger",
				/** Neutre : retiré, archivé, brouillon, inactif. */
				neutral: "bg-neutral-bg text-neutral",
				/** Accent marque : mise en avant non sémantique (ex. « Nouveau »). */
				lagoon: "bg-primary/15 text-primary",
			},
		},
		defaultVariants: { variant: "neutral" },
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { badgeVariants };
