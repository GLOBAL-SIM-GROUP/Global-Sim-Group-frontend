import { Link } from "@tanstack/react-router";
import { ChevronRight, Shirt } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { usePressingCommandes } from "#/features/portail/hooks/use-pressing";
import {
	calculerProgression,
	libelleDateDepot,
	libelleMontantPressing,
	PRESSING_STATUT_LABELS,
	PRESSING_STATUT_VARIANT,
} from "#/features/portail/models/pressing";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

/**
 * Suivi Pressing de l'espace client — reprend la logique de
 * `PressingCommandesPage` (portail résident), même API/modèle
 * (`features/portail`) — lecture seule, les dépôts sont enregistrés par le
 * personnel au comptoir.
 */
export function PressingPage() {
	const commandesQuery = usePressingCommandes();

	if (commandesQuery.isLoading) {
		return (
			<div className="w-full space-y-6 pt-6 pb-16">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (commandesQuery.isError) {
		return (
			<div className="w-full space-y-3 pt-6 pb-16">
				<h1 className="text-2xl font-semibold text-foreground">Pressing</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos commandes de pressing.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
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
		<div className="w-full space-y-6 pt-6 pb-16">
			<PageHeader
				breadcrumb={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Pressing" },
				]}
				title="Pressing"
				description="Avancement de vos commandes déposées en pressing."
			/>

			{commandes.length === 0 ? (
				<EmptyState
					icon={Shirt}
					title="Aucune commande de pressing pour le moment"
					description="Déposez votre linge au comptoir — suivez ensuite son avancement ici."
				/>
			) : (
				<div className="space-y-3">
					{commandes.map((commande) => {
						const progression = calculerProgression(commande.statut);
						return (
							<Link
								key={commande.id}
								to="/espace-client/pressing/$id"
								params={{ id: commande.id }}
								className="group block space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="truncate font-semibold text-foreground">
												{commande.numero_commande}
											</span>
											<Badge variant={PRESSING_STATUT_VARIANT[commande.statut]}>
												{PRESSING_STATUT_LABELS[commande.statut] ??
													commande.statut}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{libelleDateDepot(commande)}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-1.5">
										<span className="font-semibold text-foreground">
											{libelleMontantPressing(commande.montant_total)}
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

								{commande.montant_total != null ? (
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
								) : null}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
