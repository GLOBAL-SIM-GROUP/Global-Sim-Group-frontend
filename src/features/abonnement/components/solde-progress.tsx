import { cn } from "#/lib/utils";

import { progressionConsommee } from "../models/abonnements";

/**
 * Barre de progression « solde / quota » d'une souscription — le quota est
 * celui figé à la vente. Reste à `null` (barre masquée) si les montants
 * réseau ne sont pas interpretables.
 */
export function SoldeProgress({
	solde,
	quota,
	uniteLabel,
}: {
	solde: string;
	quota: string;
	uniteLabel: string;
}) {
	const ratio = progressionConsommee(solde, quota);
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">
					Solde restant :{" "}
					<span className="font-semibold text-foreground">
						{solde} {uniteLabel}
					</span>
				</span>
				<span className="text-muted-foreground">
					sur {quota} {uniteLabel}
				</span>
			</div>
			{ratio !== null ? (
				<div
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(ratio * 100)}
					aria-label="Quota consommé"
					className="h-2 overflow-hidden rounded-full bg-muted"
				>
					<div
						className={cn(
							"h-full rounded-full transition-all",
							ratio >= 1 ? "bg-destructive" : "bg-lagoon",
						)}
						style={{ width: `${ratio * 100}%` }}
					/>
				</div>
			) : null}
		</div>
	);
}
