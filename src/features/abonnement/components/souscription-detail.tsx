import { Ban, Scale, SlidersHorizontal, Wallet } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useSouscription } from "../hooks/use-souscriptions";
import {
	ACTIVITE_LABELS,
	montantPositif,
	type SouscriptionDetail,
	STATUT_LABELS,
	UNITE_LABELS,
} from "../models/abonnements";
import { AjusterQuotaDialog } from "./ajuster-quota-dialog";
import { EtatBadge } from "./etat-badge";
import { MouvementsTimeline } from "./mouvements-timeline";
import { PaiementSouscriptionDialog } from "./paiement-souscription-dialog";
import { ReliquatDialog } from "./reliquat-dialog";
import { ResilierSouscriptionDialog } from "./resilier-souscription-dialog";
import { SoldeProgress } from "./solde-progress";

function couverture(souscription: SouscriptionDetail): string {
	if (souscription.activite === "PRESSING") {
		return souscription.prestation_libelle ?? "—";
	}
	return `Plats : ${souscription.id_categorie_plat ? "catégorie dédiée" : "tous"}${
		souscription.max_par_jour ? ` · max ${souscription.max_par_jour}/jour` : ""
	}`;
}

/**
 * Fiche souscription (`ABONNEMENT.VOIR`) : solde/état calculés en direct,
 * actions staff (`VENDRE` paiement complémentaire, `AJUSTER` quota/résiliation,
 * `DECIDER_RELIQUAT`) et timeline des mouvements.
 */
export function SouscriptionDetailPage({ id }: { id: string }) {
	const canVendre = useCan("ABONNEMENT.VENDRE");
	const canAjuster = useCan("ABONNEMENT.AJUSTER");
	const canReliquat = useCan("ABONNEMENT.DECIDER_RELIQUAT");

	const detailQuery = useSouscription(id);
	const souscription = detailQuery.data ?? null;

	const [dialogue, setDialogue] = useState<
		"paiement" | "ajustement" | "resiliation" | "reliquat" | null
	>(null);
	const fermer = () => setDialogue(null);

	if (detailQuery.isLoading) {
		return (
			<div className="w-full p-3 sm:p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}
	if (detailQuery.isError || !souscription) {
		return (
			<div className="w-full p-3 sm:p-6">
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Souscription introuvable ou inaccessible.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void detailQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{
						label: "Souscriptions",
						to: "/abonnements/souscriptions",
					},
					{ label: souscription.offre_libelle },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="flex items-center gap-3 text-lg font-semibold text-foreground sm:text-2xl">
						{souscription.offre_libelle}
						<EtatBadge etat={souscription.etat} />
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						{souscription.client_nom} {souscription.client_prenoms} ·{" "}
						{ACTIVITE_LABELS[souscription.activite]} ·{" "}
						{couverture(souscription)}
					</p>
				</section>
				<div className="flex flex-wrap gap-2">
					{souscription.reliquat_a_decider && canReliquat ? (
						<Button onClick={() => setDialogue("reliquat")}>
							<Scale className="size-4" aria-hidden />
							Décider le reliquat
						</Button>
					) : null}
					{montantPositif(souscription.reste_a_payer) && canVendre ? (
						<Button variant="outline" onClick={() => setDialogue("paiement")}>
							<Wallet className="size-4" aria-hidden />
							Encaisser {formatMontantFCFA(souscription.reste_a_payer)}
						</Button>
					) : null}
					{canAjuster &&
					souscription.etat !== "RESILIEE" &&
					souscription.etat !== "ANNULEE" ? (
						<Button variant="outline" onClick={() => setDialogue("ajustement")}>
							<SlidersHorizontal className="size-4" aria-hidden />
							Ajuster le quota
						</Button>
					) : null}
					{canAjuster && souscription.statut === "ACTIVE" ? (
						<Button
							variant="destructive"
							onClick={() => setDialogue("resiliation")}
						>
							<Ban className="size-4" aria-hidden />
							Résilier
						</Button>
					) : null}
				</div>
			</div>

			{souscription.reliquat_a_decider ? (
				<p
					role="alert"
					className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
				>
					Souscription expirée avec un solde restant de {souscription.solde}{" "}
					{UNITE_LABELS[souscription.unite]} — une décision de reliquat (report
					ou perte) est attendue.
				</p>
			) : null}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<section className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<h2 className="text-xs font-medium text-muted-foreground">
						Solde restant
					</h2>
					<div className="mt-2">
						<SoldeProgress
							solde={souscription.solde}
							quota={souscription.quota}
							uniteLabel={
								UNITE_LABELS[souscription.unite] ?? souscription.unite
							}
						/>
					</div>
				</section>
				<section className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<h2 className="text-xs font-medium text-muted-foreground">
						Validité
					</h2>
					<p className="mt-2 text-sm font-semibold text-foreground">
						{formatDateISO(souscription.date_debut)} →{" "}
						{formatDateISO(souscription.date_fin)}
					</p>
					{souscription.max_par_jour ? (
						<p className="mt-1 text-xs text-muted-foreground">
							Consommé aujourd'hui : {souscription.consomme_aujourdhui}/
							{souscription.max_par_jour} repas
						</p>
					) : null}
				</section>
				<section className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<h2 className="text-xs font-medium text-muted-foreground">
						Règlement
					</h2>
					<p className="mt-2 text-sm font-semibold text-foreground">
						{formatMontantFCFA(souscription.montant_paye)} /{" "}
						{formatMontantFCFA(souscription.prix)}
					</p>
					{montantPositif(souscription.reste_a_payer) ? (
						<p className="mt-1 text-xs text-amber-600">
							Reste à payer : {formatMontantFCFA(souscription.reste_a_payer)}
						</p>
					) : null}
				</section>
				<section className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<h2 className="text-xs font-medium text-muted-foreground">Détails</h2>
					<p className="mt-2 text-sm text-foreground">
						Statut : {STATUT_LABELS[souscription.statut]}
					</p>
					{souscription.facture_numero ? (
						<p className="mt-1 text-xs text-muted-foreground">
							Facture {souscription.facture_numero}
						</p>
					) : null}
					{souscription.note ? (
						<p className="mt-1 text-xs text-muted-foreground">
							{souscription.note}
						</p>
					) : null}
				</section>
			</div>

			<section className="rounded-lg border border-border bg-card p-4 shadow-sm">
				<h2 className="text-sm font-semibold text-foreground">
					Journal des mouvements
				</h2>
				<div className="mt-4">
					<MouvementsTimeline
						mouvements={souscription.mouvements}
						unite={souscription.unite}
						lienCommande={(mouvement) =>
							mouvement.id_commande_pressing
								? {
										to: `/pressing/commandes/${mouvement.id_commande_pressing}`,
										label: mouvement.numero_commande_pressing
											? `Commande ${mouvement.numero_commande_pressing}`
											: "Voir la commande",
									}
								: null
						}
					/>
				</div>
			</section>

			<PaiementSouscriptionDialog
				open={dialogue === "paiement"}
				souscription={souscription}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermer();
				}}
				onSaved={() => {
					fermer();
					void detailQuery.refetch();
				}}
			/>
			<AjusterQuotaDialog
				open={dialogue === "ajustement"}
				souscription={souscription}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermer();
				}}
				onSaved={() => {
					fermer();
					void detailQuery.refetch();
				}}
			/>
			<ResilierSouscriptionDialog
				open={dialogue === "resiliation"}
				souscription={souscription}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermer();
				}}
				onSaved={() => {
					fermer();
					void detailQuery.refetch();
				}}
			/>
			<ReliquatDialog
				open={dialogue === "reliquat"}
				souscription={souscription.reliquat_a_decider ? souscription : null}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermer();
				}}
				onSaved={() => {
					fermer();
					void detailQuery.refetch();
				}}
			/>
		</div>
	);
}
