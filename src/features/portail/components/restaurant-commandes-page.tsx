import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { useCan } from "#/core/auth";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	useCreerCommandeRestaurant,
	useMesCommandesRestaurant,
} from "../hooks/use-restaurant";
import {
	COMMANDE_PORTAIL_STATUT_LABELS,
	COMMANDE_PORTAIL_STATUT_VARIANT,
	TYPE_COMMANDE_PORTAIL_LABELS,
} from "../models/restaurant";
import { CommanderDialog } from "./commander-dialog";

/**
 * Page « Restaurant » du portail résident : liste des commandes passées en
 * ligne avec leur statut, et composition d'une nouvelle commande
 * (`RESTAURANT.COMMANDER`, `POST /restaurant/portail/commandes`). La commande
 * naît `EN_ATTENTE` — validation et encaissement restent au comptoir.
 */
export function RestaurantCommandesPage() {
	const commandesQuery = useMesCommandesRestaurant();
	const canCommander = useCan("RESTAURANT.COMMANDER");
	const commander = useCreerCommandeRestaurant();
	const [commandeOuverte, setCommandeOuverte] = useState(false);
	const [erreurCommande, setErreurCommande] = useState<string | null>(null);

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
				<h1 className="text-2xl font-semibold text-foreground">Restaurant</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos commandes restaurant.</p>
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Restaurant" },
				]}
				title="Restaurant"
				description="Commandez en ligne et suivez vos commandes — le règlement se fait au comptoir."
				actions={
					<div className="flex flex-wrap items-center gap-2">
						{canCommander ? (
							<Button
								size="sm"
								className="rounded-full"
								onClick={() => {
									setErreurCommande(null);
									setCommandeOuverte(true);
								}}
							>
								<Plus className="size-4" aria-hidden />
								Passer une commande
							</Button>
						) : null}
						<Button
							variant="outline"
							size="sm"
							className="rounded-full"
							asChild
						>
							<Link to="/residence/portail">Retour à mon espace</Link>
						</Button>
					</div>
				}
			/>

			{commandes.length === 0 ? (
				<EmptyState
					title="Aucune commande pour le moment."
					description={
						canCommander
							? "Utilisez « Passer une commande » pour commander au restaurant."
							: undefined
					}
				/>
			) : (
				<div className="space-y-3">
					{commandes.map((commande) => (
						<Link
							key={commande.id}
							to="/residence/portail/restaurant/$id"
							params={{ id: commande.id }}
							className="group block space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate font-semibold text-foreground">
											Commande du {formatDateHeureUTC(commande.date)}
										</span>
										<Badge
											variant={COMMANDE_PORTAIL_STATUT_VARIANT[commande.statut]}
										>
											{COMMANDE_PORTAIL_STATUT_LABELS[commande.statut] ??
												commande.statut}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{TYPE_COMMANDE_PORTAIL_LABELS[commande.type] ??
											commande.type}
										{commande.motif_annulation
											? ` — ${commande.motif_annulation}`
											: ""}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-1.5">
									<span className="font-semibold text-foreground">
										{formatMontantFCFA(commande.total)}
									</span>
									<ChevronRight
										className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
										aria-hidden
									/>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}

			<CommanderDialog
				open={commandeOuverte}
				isPending={commander.isPending}
				erreur={erreurCommande}
				onSubmit={(valeurs) => {
					setErreurCommande(null);
					commander.mutate(valeurs, {
						onSuccess: () => setCommandeOuverte(false),
						onError: (error) =>
							setErreurCommande(
								error instanceof Error
									? error.message
									: "Impossible d'envoyer la commande.",
							),
					});
				}}
				onOpenChange={setCommandeOuverte}
			/>
		</div>
	);
}
