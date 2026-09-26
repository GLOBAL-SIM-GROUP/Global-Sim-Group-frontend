import { Link } from "@tanstack/react-router";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { EtatBadge } from "#/features/abonnement/components/etat-badge";
import { MouvementsTimeline } from "#/features/abonnement/components/mouvements-timeline";
import { SoldeProgress } from "#/features/abonnement/components/solde-progress";
import {
	ACTIVITE_LABELS,
	type Mouvement,
	montantPositif,
	STATUT_LABELS,
	UNITE_LABELS,
} from "#/features/abonnement/models/abonnements";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useMesSouscription } from "../hooks/use-abonnements";

interface AbonnementDetailPageProps {
	id: string;
	/** Routes du fil d'Ariane et des liens de commandes (préfixes portail). */
	lienListe: string;
	breadcrumbAccueil: { label: string; to: string };
	/** Bases des fiches commandes portail (ex. `/espace-client/pressing`). */
	lienCommandePressing?: string;
	lienCommandeRestaurant?: string;
	className?: string;
}

/**
 * Détail d'un de mes abonnements (`GET /abonnement/portail/souscriptions/{id}`
 * — scopé par le JWT, 404 pour la souscription d'un autre client) : état
 * calculé, solde/quota, validité, reste à payer, et l'historique des
 * mouvements avec lien vers la commande pressing/restaurant d'origine.
 */
export function AbonnementDetailPage({
	id,
	lienListe,
	breadcrumbAccueil,
	lienCommandePressing,
	lienCommandeRestaurant,
	className = "w-full space-y-6 pt-6 pb-16",
}: AbonnementDetailPageProps) {
	const souscriptionQuery = useMesSouscription(id);

	if (souscriptionQuery.isLoading) {
		return (
			<div className={className}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (souscriptionQuery.isError || !souscriptionQuery.data) {
		return (
			<div className={className}>
				<h1 className="text-2xl font-semibold text-foreground">Abonnement</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cet abonnement.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void souscriptionQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const souscription = souscriptionQuery.data;
	const uniteLabel = UNITE_LABELS[souscription.unite] ?? souscription.unite;

	const lienCommande = (mouvement: Mouvement) => {
		if (mouvement.id_commande_pressing && lienCommandePressing) {
			return {
				to: `${lienCommandePressing}/${mouvement.id_commande_pressing}`,
				label: `commande ${mouvement.numero_commande_pressing ?? ""}`.trim(),
			};
		}
		if (mouvement.id_commande_restaurant && lienCommandeRestaurant) {
			return {
				to: `${lienCommandeRestaurant}/${mouvement.id_commande_restaurant}`,
				label: "commande restaurant",
			};
		}
		return null;
	};

	return (
		<div className={className}>
			<Breadcrumb
				items={[
					breadcrumbAccueil,
					{ label: "Mes abonnements", to: lienListe },
					{ label: souscription.offre_libelle },
				]}
			/>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-2xl font-semibold text-foreground">
							{souscription.offre_libelle}
						</h1>
						<EtatBadge etat={souscription.etat} />
						<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
							{ACTIVITE_LABELS[souscription.activite] ?? souscription.activite}
						</span>
					</div>
					<p className="text-sm text-muted-foreground">
						{souscription.prestation_libelle ?? souscription.offre_code}
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to={lienListe as never}>Retour à mes abonnements</Link>
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Solde restant
					</p>
					<p className="mt-1 text-lg font-semibold text-foreground">
						{souscription.solde} {uniteLabel}
					</p>
					<p className="text-xs text-muted-foreground">
						sur {souscription.quota} {uniteLabel}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Validité
					</p>
					<p className="mt-1 text-lg font-semibold text-foreground">
						{formatDateISO(souscription.date_debut)} →{" "}
						{formatDateISO(souscription.date_fin)}
					</p>
					<p className="text-xs text-muted-foreground">
						{STATUT_LABELS[souscription.statut] ?? souscription.statut}
						{souscription.motif_statut ? ` — ${souscription.motif_statut}` : ""}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Reste à payer
					</p>
					<p
						className={
							montantPositif(souscription.reste_a_payer)
								? "mt-1 text-lg font-semibold text-destructive"
								: "mt-1 text-lg font-semibold text-foreground"
						}
					>
						{formatMontantFCFA(souscription.reste_a_payer)}
					</p>
					<p className="text-xs text-muted-foreground">
						prix {formatMontantFCFA(souscription.prix)}
					</p>
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<SoldeProgress
					solde={souscription.solde}
					quota={souscription.quota}
					uniteLabel={uniteLabel}
				/>
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold text-foreground">
					Historique d'utilisation
				</h2>
				<MouvementsTimeline
					mouvements={souscription.mouvements}
					unite={souscription.unite}
					lienCommande={lienCommande}
					vide="Aucune utilisation enregistrée pour le moment."
				/>
			</section>
		</div>
	);
}
