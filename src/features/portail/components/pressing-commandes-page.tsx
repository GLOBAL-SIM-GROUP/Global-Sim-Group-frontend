import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { usePressingCommandes } from "../hooks/use-pressing";
import {
	calculerProgression,
	PRESSING_STATUT_BADGE,
	PRESSING_STATUT_LABELS,
} from "../models/pressing";

/**
 * Page « Suivi Pressing » (M5.x) : liste des commandes de pressing du résident
 * avec statut et progression visuelle.
 */
export function PressingCommandesPage() {
	const commandesQuery = usePressingCommandes();

	if (commandesQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (commandesQuery.isError) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Suivi Pressing
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos commandes de pressing.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void commandesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const commandes = commandesQuery.data ?? [];

	return (
		<div className="w-full space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Suivi Pressing" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Suivi Pressing
					</h1>
					<p className="text-muted-foreground">
						Avancement de vos commandes de pressing.
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/portail">Retour à mon espace</Link>
				</Button>
			</div>

			{commandes.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune commande de pressing pour le moment.
				</div>
			) : (
				<div className="space-y-3">
					{commandes.map((commande) => {
						const progression = calculerProgression(commande.statut);
						return (
							<Link
								key={commande.id}
								to="/residence/portail/pressing/$id"
								params={{ id: commande.id }}
								className="group block space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="truncate font-semibold text-foreground">
												{commande.numero_commande}
											</span>
											<span
												className={cn(
													"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
													PRESSING_STATUT_BADGE[commande.statut] ??
														"bg-[#95A5A6] text-white",
												)}
											>
												{PRESSING_STATUT_LABELS[commande.statut] ??
													commande.statut}
											</span>
										</div>
										<p className="text-sm text-muted-foreground">
											Déposé le{" "}
											{formatDateISO(commande.date_depot.slice(0, 10))}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-1.5">
										<span className="font-semibold text-foreground">
											{formatMontantFCFA(commande.montant_total)}
										</span>
										<ChevronRight
											className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
											aria-hidden
										/>
									</div>
								</div>

								<div className="space-y-1.5">
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Progression</span>
										<span>{progression}%</span>
									</div>
									<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-lagoon transition-all"
											style={{ width: `${progression}%` }}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-muted-foreground">Acompte versé</p>
										<p className="font-medium text-foreground">
											{formatMontantFCFA(commande.acompte)}
										</p>
									</div>
									<div className="text-right">
										<p className="text-muted-foreground">Reste à payer</p>
										<p
											className={cn(
												"font-medium",
												Number(commande.reste_a_payer) > 0
													? "text-destructive"
													: "text-foreground",
											)}
										>
											{formatMontantFCFA(commande.reste_a_payer)}
										</p>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
