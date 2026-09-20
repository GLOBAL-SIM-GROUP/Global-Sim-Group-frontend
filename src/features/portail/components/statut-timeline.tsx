import { cn } from "#/lib/utils";

interface StatutTimelineProps<Statut extends string> {
	/** Étapes ordonnées du cycle de vie (ex. EN_ATTENTE → … → PAYEE). */
	etapes: readonly Statut[];
	statut: Statut;
	labels: Record<Statut, string>;
	titre?: string;
}

/**
 * Timeline verticale des étapes d'une demande du portail (commande
 * restaurant, réservation de salle de fête) — même rendu que la progression
 * pressing. Un statut hors liste (`ANNULEE`) affiche étape 0/étapes.
 */
export function StatutTimeline<Statut extends string>({
	etapes,
	statut,
	labels,
	titre = "Progression",
}: StatutTimelineProps<Statut>) {
	const indexActuel = etapes.indexOf(statut);
	const actuelle = indexActuel === -1 ? 0 : indexActuel + 1;

	return (
		<section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-foreground">{titre}</h2>
			<ol className="space-y-4">
				{etapes.map((etape, index) => {
					const isCompleted = index < actuelle - 1;
					const isCurrent = index === actuelle - 1;
					return (
						<li key={etape} className="flex gap-3">
							<div className="flex flex-col items-center">
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
										isCompleted
											? "border-[#27AE60] bg-[#27AE60] text-white"
											: isCurrent
												? "border-lagoon text-lagoon"
												: "border-border text-muted-foreground",
									)}
								>
									{isCompleted ? "✓" : index + 1}
								</span>
								{index < etapes.length - 1 ? (
									<div
										className={cn(
											"mt-1 w-px flex-1",
											isCompleted ? "bg-[#27AE60]" : "bg-border",
										)}
										style={{ minHeight: "2rem" }}
									/>
								) : null}
							</div>
							<div className="pb-2">
								<p className="text-sm font-medium text-foreground">
									{labels[etape]}
								</p>
								<p className="text-xs text-muted-foreground">
									{isCompleted
										? "Complété"
										: isCurrent
											? "En cours"
											: "À venir"}
								</p>
							</div>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
