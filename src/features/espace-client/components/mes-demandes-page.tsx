import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { usePressingCommandes } from "#/features/portail/hooks/use-pressing";
import {
	PRESSING_STATUT_BADGE,
	PRESSING_STATUT_LABELS,
} from "#/features/portail/models/pressing";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { DEMANDE_SERVICE_LABELS, listerDemandes } from "../models/demandes";

/**
 * « Mes demandes » de l'espace client : regroupe les dépôts pressing (seule
 * donnée réelle exposée au compte CLIENT) et les demandes envoyées depuis
 * les formulaires (salle de fête, séjours courts), persistées localement —
 * aucun endpoint CLIENT n'existe pour les demandes, cf. `models/demandes.ts`.
 */
export function MesDemandesPage() {
	const commandesQuery = usePressingCommandes();
	const [demandes] = useState(listerDemandes);

	const commandes = commandesQuery.data ?? [];

	return (
		<div className="mx-auto w-full max-w-4xl space-y-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Mes demandes</h1>
				<p className="text-sm text-muted-foreground">
					Suivez vos demandes envoyées et vos dépôts pressing.
				</p>
			</div>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold text-foreground">
					Demandes envoyées
				</h2>
				{demandes.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
						Aucune demande pour le moment. Formulez une demande depuis la page{" "}
						<Link
							to="/espace-client/salle-fete"
							className="font-medium text-lagoon hover:underline"
						>
							Salle de fête
						</Link>{" "}
						ou{" "}
						<Link
							to="/espace-client/residence"
							className="font-medium text-lagoon hover:underline"
						>
							Résidence
						</Link>
						.
					</div>
				) : (
					<div className="space-y-3">
						{demandes.map((demande) => (
							<div
								key={demande.id}
								className="space-y-1 rounded-lg border border-border bg-card p-4 shadow-sm"
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-semibold text-foreground">
											{DEMANDE_SERVICE_LABELS[demande.service]}
										</span>
										<span className="inline-flex items-center rounded-full bg-[#E67E22] px-2.5 py-1 text-xs font-medium text-white">
											Envoyée — en attente de réponse
										</span>
									</div>
									<span className="text-xs text-muted-foreground">
										Envoyée le {formatDateISO(demande.dateEnvoi.slice(0, 10))}
									</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{demande.resume}
								</p>
								{demande.observations ? (
									<p className="text-sm text-muted-foreground italic">
										« {demande.observations} »
									</p>
								) : null}
							</div>
						))}
					</div>
				)}
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold text-foreground">
					Dépôts pressing
				</h2>
				{commandesQuery.isLoading ? (
					<p className="text-sm text-muted-foreground">Chargement…</p>
				) : commandesQuery.isError ? (
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
				) : commandes.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
						Aucune commande de pressing pour le moment.
					</div>
				) : (
					<div className="space-y-3">
						{commandes.map((commande) => (
							<Link
								key={commande.id}
								to="/espace-client/pressing/$id"
								params={{ id: commande.id }}
								className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
							>
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
										Déposé le {formatDateISO(commande.date_depot.slice(0, 10))}{" "}
										· {formatMontantFCFA(commande.montant_total)}
									</p>
								</div>
								<ChevronRight
									className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
									aria-hidden
								/>
							</Link>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
