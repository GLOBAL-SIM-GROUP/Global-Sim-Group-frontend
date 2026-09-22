import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { AnnulerDemandeDialog } from "#/features/portail/components/annuler-demande-dialog";
import { StatutTimeline } from "#/features/portail/components/statut-timeline";
import {
	useAnnulerCommandeRestaurant,
	useCommandeRestaurantPortail,
} from "#/features/portail/hooks/use-restaurant";
import {
	COMMANDE_PORTAIL_ETAPES,
	COMMANDE_PORTAIL_STATUT_BADGE,
	COMMANDE_PORTAIL_STATUT_LABELS,
	estCommandeAnnulable,
	TYPE_COMMANDE_PORTAIL_LABELS,
} from "#/features/portail/models/restaurant";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

/**
 * Détail d'une commande restaurant passée depuis l'espace client : lignes,
 * statut, motif d'annulation éventuel et annulation tant qu'elle est
 * `EN_ATTENTE` (`RESTAURANT.COMMANDER`). Aucun paiement en ligne — le
 * règlement se fait au comptoir.
 */
export function RestaurantCommandeDetailPage({ id }: { id: string }) {
	const commandeQuery = useCommandeRestaurantPortail(id);
	const canCommander = useCan("RESTAURANT.COMMANDER");
	const annuler = useAnnulerCommandeRestaurant();
	const [confirmOuvert, setConfirmOuvert] = useState(false);

	if (commandeQuery.isLoading) {
		return (
			<div className="w-full space-y-6 pt-6 pb-16">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (commandeQuery.isError || !commandeQuery.data) {
		return (
			<div className="w-full space-y-3 pt-6 pb-16">
				<h1 className="text-2xl font-semibold text-foreground">
					Commande restaurant
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette commande.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void commandeQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const commande = commandeQuery.data;

	return (
		<div className="w-full space-y-6 pt-6 pb-16">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Restaurant", to: "/espace-client/restaurant" },
					{ label: `Commande du ${formatDateHeureUTC(commande.date)}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-2xl font-semibold text-foreground">
							Commande du {formatDateHeureUTC(commande.date)}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								COMMANDE_PORTAIL_STATUT_BADGE[commande.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{COMMANDE_PORTAIL_STATUT_LABELS[commande.statut] ??
								commande.statut}
						</span>
					</div>
					<p className="text-muted-foreground">
						{TYPE_COMMANDE_PORTAIL_LABELS[commande.type] ?? commande.type}
						{commande.adresse_livraison
							? ` — ${commande.adresse_livraison}`
							: ""}
					</p>
				</section>
				<div className="flex flex-wrap items-center gap-2">
					{canCommander && estCommandeAnnulable(commande) ? (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:bg-destructive/10"
							onClick={() => setConfirmOuvert(true)}
						>
							Annuler la commande
						</Button>
					) : null}
					<Button variant="outline" size="sm" asChild>
						<Link to="/espace-client/mes-demandes">Retour à mes demandes</Link>
					</Button>
				</div>
			</div>

			{commande.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{commande.motif_annulation}</p>
				</div>
			) : null}

			{commande.lignes && commande.lignes.length > 0 ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Articles commandés
					</h2>
					<table className="mt-3 w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="py-1 font-medium">Plat</th>
								<th className="py-1 text-right font-medium">Qté</th>
								<th className="py-1 text-right font-medium">P.U.</th>
								<th className="py-1 text-right font-medium">Total</th>
							</tr>
						</thead>
						<tbody>
							{commande.lignes.map((ligne) => (
								<tr key={ligne.id_plat} className="border-b border-border/50">
									<td className="py-1 text-foreground">
										{ligne.nom_plat ?? `Plat ${ligne.id_plat}`}
									</td>
									<td className="py-1 text-right text-foreground">
										{ligne.quantite}
									</td>
									<td className="py-1 text-right text-foreground">
										{formatMontantFCFA(ligne.prix_unitaire)}
									</td>
									<td className="py-1 text-right text-foreground">
										{formatMontantFCFA(ligne.total)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className="mt-3 text-right text-base font-semibold text-foreground">
						Total : {formatMontantFCFA(commande.total)}
					</p>
				</section>
			) : (
				<p className="text-sm text-muted-foreground">
					Total : {formatMontantFCFA(commande.total)}
				</p>
			)}

			{commande.notes ? (
				<section className="rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
					<p className="font-medium text-foreground">Votre note</p>
					<p className="mt-1 text-muted-foreground">{commande.notes}</p>
				</section>
			) : null}

			<StatutTimeline
				etapes={COMMANDE_PORTAIL_ETAPES}
				statut={commande.statut}
				labels={COMMANDE_PORTAIL_STATUT_LABELS}
				titre="Suivi de la commande"
			/>

			<AnnulerDemandeDialog
				open={confirmOuvert}
				titre="Annuler la commande ?"
				description="L'annulation est définitive — possible uniquement tant que la commande n'a pas été prise en charge."
				isPending={annuler.isPending}
				erreur={
					annuler.error
						? annuler.error instanceof Error
							? annuler.error.message
							: "Impossible d'annuler la commande."
						: null
				}
				onConfirm={() =>
					annuler.mutate(commande.id, {
						onSuccess: () => setConfirmOuvert(false),
					})
				}
				onOpenChange={setConfirmOuvert}
			/>
		</div>
	);
}
