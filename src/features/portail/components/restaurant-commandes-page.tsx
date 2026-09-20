import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import {
	useCreerCommandeRestaurant,
	useMesCommandesRestaurant,
} from "../hooks/use-restaurant";
import {
	COMMANDE_PORTAIL_STATUT_BADGE,
	COMMANDE_PORTAIL_STATUT_LABELS,
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
					{ label: "Restaurant" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Restaurant</h1>
					<p className="text-muted-foreground">
						Commandez en ligne et suivez vos commandes — le règlement se fait au
						comptoir.
					</p>
				</section>
				<div className="flex flex-wrap items-center gap-2">
					{canCommander ? (
						<Button
							size="sm"
							onClick={() => {
								setErreurCommande(null);
								setCommandeOuverte(true);
							}}
						>
							<Plus className="size-4" aria-hidden />
							Passer une commande
						</Button>
					) : null}
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/portail">Retour à mon espace</Link>
					</Button>
				</div>
			</div>

			{commandes.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune commande pour le moment.
					{canCommander
						? " Utilisez « Passer une commande » pour commander au restaurant."
						: ""}
				</div>
			) : (
				<div className="space-y-3">
					{commandes.map((commande) => (
						<Link
							key={commande.id}
							to="/residence/portail/restaurant/$id"
							params={{ id: commande.id }}
							className="group block space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate font-semibold text-foreground">
											Commande du {formatDateHeureUTC(commande.date)}
										</span>
										<span
											className={cn(
												"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
												COMMANDE_PORTAIL_STATUT_BADGE[commande.statut] ??
													"bg-[#95A5A6] text-white",
											)}
										>
											{COMMANDE_PORTAIL_STATUT_LABELS[commande.statut] ??
												commande.statut}
										</span>
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
