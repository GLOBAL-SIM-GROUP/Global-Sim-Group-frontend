import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { cn } from "#/lib/utils";
import { usePressingCommandes } from "../hooks/use-pressing";
import {
	PRESSING_STATUT_COLORS,
	PRESSING_STATUT_LABELS,
	calculerProgression,
} from "../models/pressing";

/**
 * Page « Suivi Pressing » (M5.x) : liste des commandes de pressing du résident
 * avec statut et progression visuelle.
 */
export function PressingCommandesPage() {
	const { data: commandes, isLoading, error } = usePressingCommandes();

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-lagoon" />
			</div>
		);
	}

	if (error) {
		return (
			<Card className="border-destructive/20 bg-destructive/5">
				<CardContent className="pt-6 flex gap-3">
					<AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
					<div className="text-sm text-destructive">
						Erreur lors du chargement de vos commandes
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<section className="space-y-1">
				<h1 className="text-2xl font-bold text-foreground">Suivi Pressing</h1>
				<p className="text-muted-foreground">
					Suivez l'état d'avancement de vos habits en traitement
				</p>
			</section>

			{/* Commandes list */}
			{!commandes || commandes.length === 0 ? (
				<Card>
					<CardContent className="pt-6 text-center text-muted-foreground py-12">
						Aucune commande pour le moment
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{commandes.map((commande) => {
						const progression = calculerProgression(commande.statut);
						const couleur =
							PRESSING_STATUT_COLORS[commande.statut] ??
							"bg-gray-100 text-gray-800";

						return (
							<Link
								key={commande.id}
								to={`/residence/portail/pressing/commandes/${commande.id}`}
							>
								<Card className="cursor-pointer hover:shadow-md transition-shadow">
									<CardContent className="pt-6">
										<div className="space-y-4">
											{/* Header row */}
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="font-semibold text-foreground">
															{commande.numero_commande}
														</h3>
														<span
															className={cn(
																"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
																couleur,
															)}
														>
															{PRESSING_STATUT_LABELS[commande.statut]}
														</span>
													</div>
													<p className="text-sm text-muted-foreground">
														Déposé le{" "}
														{new Date(commande.date_depot).toLocaleDateString(
															"fr-FR",
														)}
													</p>
												</div>
												<div className="text-right">
													<p className="font-semibold text-foreground">
														{commande.montant_total} FCFA
													</p>
													<ChevronRight className="size-5 text-muted-foreground ml-auto mt-1" />
												</div>
											</div>

											{/* Progress bar */}
											<div className="space-y-2">
												<div className="flex justify-between text-xs text-muted-foreground">
													<span>Progression</span>
													<span>{progression}%</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
													<div
														className="bg-lagoon h-full rounded-full transition-all"
														style={{ width: `${progression}%` }}
													/>
												</div>
											</div>

											{/* Details row */}
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<p className="text-muted-foreground">Articles</p>
													<p className="font-medium text-foreground">
														{commande.nombre_articles ?? "-"} article(s)
													</p>
												</div>
												<div className="text-right">
													<p className="text-muted-foreground">
														Payé
													</p>
													<p className="font-medium text-foreground">
														{commande.montant_paye} FCFA
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
