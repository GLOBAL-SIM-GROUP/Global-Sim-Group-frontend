import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { AnnulerDemandeDialog } from "#/features/portail/components/annuler-demande-dialog";
import { StatutTimeline } from "#/features/portail/components/statut-timeline";
import {
	useAnnulerVentePortail,
	useVentePortail,
} from "#/features/portail/hooks/use-market";
import {
	estVentePortailAnnulable,
	VENTE_PORTAIL_ETAPES,
	VENTE_PORTAIL_STATUT_BADGE,
	VENTE_PORTAIL_STATUT_LABELS,
} from "#/features/portail/models/market";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

/**
 * Détail d'une demande boutique envoyée depuis l'espace client : lignes,
 * total (prix figés au catalogue), statut, motif d'annulation éventuel et
 * annulation tant qu'elle est `EN_ATTENTE` (`MARCHANDISE.COMMANDER`). Aucun
 * paiement en ligne — le règlement se fait à la boutique au retrait.
 */
export function BoutiqueDemandeDetailPage({ id }: { id: string }) {
	const venteQuery = useVentePortail(id);
	const canCommander = useCan("MARCHANDISE.COMMANDER");
	const annuler = useAnnulerVentePortail();
	const [confirmOuvert, setConfirmOuvert] = useState(false);

	if (venteQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (venteQuery.isError || !venteQuery.data) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-foreground">
					Demande boutique
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette demande.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void venteQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const vente = venteQuery.data;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Boutique", to: "/espace-client/boutique" },
					{ label: `Demande du ${formatDateHeureUTC(vente.date)}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-2xl font-semibold text-foreground">
							Demande du {formatDateHeureUTC(vente.date)}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								VENTE_PORTAIL_STATUT_BADGE[vente.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{VENTE_PORTAIL_STATUT_LABELS[vente.statut] ?? vente.statut}
						</span>
					</div>
					<p className="text-muted-foreground">
						Boutique — retrait et paiement au comptoir
					</p>
				</section>
				<div className="flex flex-wrap items-center gap-2">
					{canCommander && estVentePortailAnnulable(vente) ? (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:bg-destructive/10"
							onClick={() => setConfirmOuvert(true)}
						>
							Annuler la demande
						</Button>
					) : null}
					<Button variant="outline" size="sm" asChild>
						<Link to="/espace-client/mes-demandes">Retour à mes demandes</Link>
					</Button>
				</div>
			</div>

			{vente.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{vente.motif_annulation}</p>
				</div>
			) : null}

			{vente.lignes && vente.lignes.length > 0 ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Articles demandés
					</h2>
					<table className="mt-3 w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="py-1 font-medium">Produit</th>
								<th className="py-1 text-right font-medium">Qté</th>
								<th className="py-1 text-right font-medium">P.U.</th>
								<th className="py-1 text-right font-medium">Total</th>
							</tr>
						</thead>
						<tbody>
							{vente.lignes.map((ligne) => (
								<tr
									key={ligne.id_produit}
									className="border-b border-border/50"
								>
									<td className="py-1 text-foreground">
										{ligne.nom_produit ?? `Produit ${ligne.id_produit}`}
									</td>
									<td className="py-1 text-right text-foreground">
										{ligne.quantite}
									</td>
									<td className="py-1 text-right text-foreground">
										{formatMontantFCFA(ligne.prix_unitaire)}
									</td>
									<td className="py-1 text-right text-foreground">
										{formatMontantFCFA(ligne.total_ligne)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className="mt-3 text-right text-base font-semibold text-foreground">
						Total : {formatMontantFCFA(vente.total)}
					</p>
				</section>
			) : (
				<p className="text-sm text-muted-foreground">
					Total : {formatMontantFCFA(vente.total)}
				</p>
			)}

			{vente.note ? (
				<section className="rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
					<p className="font-medium text-foreground">Votre note</p>
					<p className="mt-1 text-muted-foreground">{vente.note}</p>
				</section>
			) : null}

			<StatutTimeline
				etapes={VENTE_PORTAIL_ETAPES}
				statut={vente.statut}
				labels={VENTE_PORTAIL_STATUT_LABELS}
				titre="Suivi de la demande"
			/>

			<AnnulerDemandeDialog
				open={confirmOuvert}
				titre="Annuler la demande ?"
				description="L'annulation est définitive — possible uniquement tant que la demande n'a pas été validée par la boutique."
				isPending={annuler.isPending}
				erreur={
					annuler.error
						? annuler.error instanceof Error
							? annuler.error.message
							: "Impossible d'annuler la demande."
						: null
				}
				onConfirm={() =>
					annuler.mutate(
						{ id: vente.id },
						{ onSuccess: () => setConfirmOuvert(false) },
					)
				}
				onOpenChange={setConfirmOuvert}
			/>
		</div>
	);
}
