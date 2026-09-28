import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
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
	VENTE_PORTAIL_STATUT_LABELS,
	VENTE_PORTAIL_STATUT_VARIANT,
} from "#/features/portail/models/market";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

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
			<div className="w-full space-y-6 pt-6 pb-16">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (venteQuery.isError || !venteQuery.data) {
		return (
			<div className="w-full space-y-3 pt-6 pb-16">
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
						className="rounded-full"
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
		<div className="w-full space-y-6 pt-6 pb-16">
			<PageHeader
				breadcrumb={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Boutique", to: "/espace-client/boutique" },
					{ label: `Demande du ${formatDateHeureUTC(vente.date)}` },
				]}
				title={
					<span className="inline-flex flex-wrap items-center gap-2">
						{`Demande du ${formatDateHeureUTC(vente.date)}`}
						<Badge variant={VENTE_PORTAIL_STATUT_VARIANT[vente.statut]}>
							{VENTE_PORTAIL_STATUT_LABELS[vente.statut] ?? vente.statut}
						</Badge>
					</span>
				}
				description="Boutique — retrait et paiement au comptoir"
				actions={
					<div className="flex flex-wrap items-center gap-2">
						{canCommander && estVentePortailAnnulable(vente) ? (
							<Button
								variant="outline"
								size="sm"
								className="rounded-full text-destructive hover:bg-destructive/10"
								onClick={() => setConfirmOuvert(true)}
							>
								Annuler la demande
							</Button>
						) : null}
						<Button
							variant="outline"
							size="sm"
							className="rounded-full"
							asChild
						>
							<Link to="/espace-client/mes-demandes">
								Retour à mes demandes
							</Link>
						</Button>
					</div>
				}
			/>

			{vente.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{vente.motif_annulation}</p>
				</div>
			) : null}

			{vente.lignes && vente.lignes.length > 0 ? (
				<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
					<h2 className="text-base font-semibold text-foreground">
						Articles demandés
					</h2>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>Produit</Th>
								<Th className="text-right">Qté</Th>
								<Th className="text-right">P.U.</Th>
								<Th className="text-right">Total</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{vente.lignes.map((ligne) => (
								<Tr key={ligne.id_produit}>
									<Td className="text-foreground">
										{ligne.nom_produit ?? `Produit ${ligne.id_produit}`}
									</Td>
									<Td className="text-right text-foreground">
										{ligne.quantite}
									</Td>
									<Td className="text-right text-foreground">
										{formatMontantFCFA(ligne.prix_unitaire)}
									</Td>
									<Td className="text-right text-foreground">
										{formatMontantFCFA(ligne.total_ligne)}
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
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
				<section className="rounded-xl border border-border bg-card p-5 text-sm shadow-sm">
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
