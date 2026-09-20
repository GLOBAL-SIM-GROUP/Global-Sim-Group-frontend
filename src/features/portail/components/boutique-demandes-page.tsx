import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { useMesVentesPortail } from "../hooks/use-market";
import {
	VENTE_PORTAIL_STATUT_BADGE,
	VENTE_PORTAIL_STATUT_LABELS,
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
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Boutique" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Boutique</h1>
					<p className="text-muted-foreground">
						Suivez vos demandes d'achat — validation par le personnel puis
						retrait et règlement au comptoir.
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/portail">Retour à mon espace</Link>
				</Button>
			</div>

			{ventes.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune demande pour le moment. Composez votre panier depuis la
					boutique de l'espace client.
				</div>
			) : (
				<div className="space-y-3">
					{ventes.map((vente) => (
						<Link
							key={vente.id}
							to="/residence/portail/boutique/$id"
							params={{ id: vente.id }}
							className="group block space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate font-semibold text-foreground">
											Demande du {formatDateHeureUTC(vente.date)}
										</span>
										<span
											className={cn(
												"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
												VENTE_PORTAIL_STATUT_BADGE[vente.statut] ??
													"bg-[#95A5A6] text-white",
											)}
										>
											{VENTE_PORTAIL_STATUT_LABELS[vente.statut] ??
												vente.statut}
										</span>
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
