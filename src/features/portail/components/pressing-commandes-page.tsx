import { Link } from "@tanstack/react-router";
import { ChevronRight, Shirt } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { usePressingCommandes } from "../hooks/use-pressing";
import {
	calculerProgression,
	libelleDateDepot,
	libelleMontantPressing,
	PRESSING_STATUT_LABELS,
	PRESSING_STATUT_VARIANT,
} from "../models/pressing";

/**
 * Page « Suivi Pressing » : liste des commandes de pressing du compte
 * connecté avec statut et progression visuelle — lecture seule, les dépôts
 * sont enregistrés par le personnel au comptoir. Partagée entre le portail
 * résident (`/residence/portail/pressing`, `variant="resident"`) et l'espace
 * client (`/espace-client/pressing`, `variant="client"`) : `variant` fixe le
 * conteneur (`p-6` résident, `pt-6 pb-16` client), le fil d'Ariane, le
 * libellé et les liens de détail.
 */
export function PressingCommandesPage({
	variant,
}: {
	variant: "client" | "resident";
}) {
	const commandesQuery = usePressingCommandes();
	const estClient = variant === "client";

	const conteneur = estClient
		? "w-full space-y-6 pt-6 pb-16"
		: "w-full space-y-6 p-6";
	const titre = estClient ? "Pressing" : "Suivi Pressing";
	const lienDetail = estClient
		? "/espace-client/pressing/$id"
		: "/residence/portail/pressing/$id";

	if (commandesQuery.isLoading) {
		return (
			<div className={conteneur}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (commandesQuery.isError) {
		return (
			<div className={cn(conteneur, "space-y-3")}>
				<h1 className="text-2xl font-semibold text-foreground">{titre}</h1>
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
		<div className={conteneur}>
			<PageHeader
				breadcrumb={
					estClient
						? [
								{ label: "Espace client", to: "/espace-client" },
								{ label: "Pressing" },
							]
						: [
								{ label: "Accueil", to: "/" },
								{ label: "Mon espace résident", to: "/residence/portail" },
								{ label: "Suivi Pressing" },
							]
				}
				title={titre}
				description={
					estClient
						? "Avancement de vos commandes déposées en pressing."
						: "Avancement de vos commandes de pressing."
				}
				actions={
					estClient ? undefined : (
						<Button
							variant="outline"
							size="sm"
							className="rounded-full"
							asChild
						>
							<Link to="/residence/portail">Retour à mon espace</Link>
						</Button>
					)
				}
			/>

			{commandes.length === 0 ? (
				estClient ? (
					<EmptyState
						icon={Shirt}
						title="Aucune commande de pressing pour le moment"
						description="Déposez votre linge au comptoir — suivez ensuite son avancement ici."
					/>
				) : (
					<EmptyState title="Aucune commande de pressing pour le moment." />
				)
			) : (
				<div className="grid gap-3 sm:grid-cols-2">
					{commandes.map((commande) => {
						const progression = calculerProgression(commande.statut);
						return (
							<Link
								key={commande.id}
								to={lienDetail}
								params={{ id: commande.id }}
								className="group block space-y-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
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
