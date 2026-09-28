import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useMesVentesPortail } from "../hooks/use-market";
import {
	VENTE_PORTAIL_STATUT_LABELS,
	VENTE_PORTAIL_STATUT_VARIANT,
} from "../models/market";

/**
 * Page « Boutique » du portail résident : liste des demandes d'achat
 * envoyées (`POST /market/portail/ventes`, statut `EN_ATTENTE` à la
 * création) avec leur suivi. La composition du panier reste dans l'espace
 * client (`/espace-client/boutique`) — pas de catalogue dans le shell
 * interne ; cette page sert au suivi et à l'annulation.
 */
export function BoutiqueDemandesPage() {
	const ventesQuery = useMesVentesPortail();

	if (ventesQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (ventesQuery.isError) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Boutique</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos demandes boutique.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={() => void ventesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const ventes = ventesQuery.data ?? [];

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Boutique" },
				]}
				title="Boutique"
				description="Suivez vos demandes d'achat — validation par le personnel puis retrait et règlement au comptoir."
				actions={
					<Button variant="outline" size="sm" className="rounded-full" asChild>
						<Link to="/residence/portail">Retour à mon espace</Link>
					</Button>
				}
			/>

			{ventes.length === 0 ? (
				<EmptyState
					title="Aucune demande pour le moment."
					description="Composez votre panier depuis la boutique de l'espace client."
				/>
			) : (
				<div className="space-y-3">
					{ventes.map((vente) => (
						<Link
							key={vente.id}
							to="/residence/portail/boutique/$id"
							params={{ id: vente.id }}
							className="group block space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate font-semibold text-foreground">
											Demande du {formatDateHeureUTC(vente.date)}
										</span>
										<Badge variant={VENTE_PORTAIL_STATUT_VARIANT[vente.statut]}>
											{VENTE_PORTAIL_STATUT_LABELS[vente.statut] ??
												vente.statut}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{vente.note ?? "Boutique"}
										{vente.motif_annulation
											? ` — ${vente.motif_annulation}`
											: ""}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-1.5">
									<span className="font-semibold text-foreground">
										{formatMontantFCFA(vente.total)}
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
		</div>
	);
}
