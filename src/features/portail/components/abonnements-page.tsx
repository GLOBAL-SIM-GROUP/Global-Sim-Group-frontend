import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { EtatBadge } from "#/features/abonnement/components/etat-badge";
import { SoldeProgress } from "#/features/abonnement/components/solde-progress";
import {
	ACTIVITE_LABELS,
	montantPositif,
	UNITE_LABELS,
} from "#/features/abonnement/models/abonnements";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useMesSouscriptions } from "../hooks/use-abonnements";

interface AbonnementsPageProps {
	/** Route liste pour le lien d'une carte (ex. `/espace-client/abonnements/$id`). */
	lienDetail: string;
	/** Fil d'Ariane : libellé racine + destination. */
	breadcrumbAccueil: { label: string; to: string };
	/** Classes du conteneur (le portail résident ajoute `p-6`). */
	className?: string;
}

/**
 * « Mes abonnements » — quotas prépayés du client connecté (`GET
 * /abonnement/portail/souscriptions`, scopé par le JWT). Lecture seule :
 * cartes par souscription (offre, état calculé, solde/quota, fin de validité,
 * reste à payer), le clic ouvre l'historique des mouvements. Partagée entre
 * le portail résident (`/residence/portail`) et l'espace client
 * (`/espace-client`) — seules les destinations des liens changent.
 */
export function AbonnementsPage({
	lienDetail,
	breadcrumbAccueil,
	className = "w-full space-y-6 pt-6 pb-16",
}: AbonnementsPageProps) {
	const souscriptionsQuery = useMesSouscriptions();

	if (souscriptionsQuery.isLoading) {
		return (
			<div className={className}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (souscriptionsQuery.isError) {
		return (
			<div className={className}>
				<h1 className="text-2xl font-semibold text-foreground">
					Mes abonnements
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos abonnements.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={() => void souscriptionsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const souscriptions = souscriptionsQuery.data ?? [];

	return (
		<div className={className}>
			<PageHeader
				breadcrumb={[breadcrumbAccueil, { label: "Mes abonnements" }]}
				title="Mes abonnements"
				description="Vos quotas prépayés pressing et restaurant — solde, validité et utilisation."
			/>

			{souscriptions.length === 0 ? (
				<EmptyState
					title="Aucun abonnement pour le moment."
					description="Les abonnements sont vendus par le personnel — renseignez-vous à la réception."
				/>
			) : (
				<div className="space-y-3">
					{souscriptions.map((souscription) => (
						<Link
							key={souscription.id_souscription}
							to={lienDetail as never}
							params={{ id: souscription.id_souscription } as never}
							className="group block space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate font-semibold text-foreground">
											{souscription.offre_libelle}
										</span>
										<EtatBadge etat={souscription.etat} />
										<Badge variant="neutral">
											{ACTIVITE_LABELS[souscription.activite] ??
												souscription.activite}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{souscription.prestation_libelle ?? souscription.offre_code}
										{" — valable jusqu'au "}
										{formatDateISO(souscription.date_fin)}
									</p>
								</div>
								<ChevronRight
									className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
									aria-hidden
								/>
							</div>

							<SoldeProgress
								solde={souscription.solde}
								quota={souscription.quota}
								uniteLabel={
									UNITE_LABELS[souscription.unite] ?? souscription.unite
								}
							/>

							{montantPositif(souscription.reste_a_payer) ? (
								<p className="text-sm">
									<span className="text-muted-foreground">
										Reste à payer :{" "}
									</span>
									<span className="font-semibold text-destructive">
										{formatMontantFCFA(souscription.reste_a_payer)}
									</span>
								</p>
							) : null}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
