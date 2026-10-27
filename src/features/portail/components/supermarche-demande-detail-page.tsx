import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import { useCan } from "#/core/auth";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useAnnulerVentePortail, useVentePortail } from "../hooks/use-market";
import {
	estVentePortailAnnulable,
	VENTE_PORTAIL_ETAPES,
	VENTE_PORTAIL_STATUT_LABELS,
	VENTE_PORTAIL_STATUT_VARIANT,
} from "../models/market";
import { AnnulerDemandeDialog } from "./annuler-demande-dialog";
import { FactureDocumentsParSource } from "./facture-documents";
import { StatutTimeline } from "./statut-timeline";

interface BoutiqueDemandePortailDetailPageProps {
	id: string;
	/** Fil d'Ariane : entrée d'accueil de l'espace (résident ou client). */
	breadcrumbAccueil: { label: string; to: string };
	/** Fil d'Ariane : libellé et cible du crumb « liste » du service. */
	labelListe: string;
	lienListe: string;
	/** Bouton retour — `lienRetour` vaut `lienListe` par défaut. */
	labelRetour: string;
	lienRetour?: string;
	className?: string;
}

/**
 * Détail d'une demande boutique : lignes, total, suivi du statut et
 * annulation tant qu'elle est `EN_ATTENTE` (`MARCHANDISE.COMMANDER`). Aucun
 * paiement en ligne — retrait et règlement au comptoir. Partagée entre le
 * portail résident et l'espace client : les routes passent fil d'Ariane,
 * liens retour et conteneur via les props.
 */
export function BoutiqueDemandePortailDetailPage({
	id,
	breadcrumbAccueil,
	labelListe,
	lienListe,
	labelRetour,
	lienRetour,
	className = "w-full space-y-6 p-6",
}: BoutiqueDemandePortailDetailPageProps) {
	const venteQuery = useVentePortail(id);
	const canCommander = useCan("MARCHANDISE.COMMANDER");
	const annuler = useAnnulerVentePortail();
	const [confirmOuvert, setConfirmOuvert] = useState(false);

	if (venteQuery.isLoading) {
		return (
			<div className={className}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (venteQuery.isError || !venteQuery.data) {
		return (
			<div className={`${className} space-y-3`}>
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
		<div className={className}>
			<PageHeader
				breadcrumb={[
					breadcrumbAccueil,
					{ label: labelListe, to: lienListe },
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
						<FactureDocumentsParSource sourceType="VENTE" sourceId={vente.id} />
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
							<Link to={(lienRetour ?? lienListe) as never}>{labelRetour}</Link>
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
					<h2 className="text-lg font-semibold text-foreground">
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
