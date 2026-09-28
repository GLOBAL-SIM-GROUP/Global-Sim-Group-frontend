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
	useAnnulerCommandeRestaurant,
	useCommandeRestaurantPortail,
} from "#/features/portail/hooks/use-restaurant";
import {
	COMMANDE_PORTAIL_ETAPES,
	COMMANDE_PORTAIL_STATUT_LABELS,
	COMMANDE_PORTAIL_STATUT_VARIANT,
	estCommandeAnnulable,
	TYPE_COMMANDE_PORTAIL_LABELS,
} from "#/features/portail/models/restaurant";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

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
						className="rounded-full"
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
			<PageHeader
				breadcrumb={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Restaurant", to: "/espace-client/restaurant" },
					{ label: `Commande du ${formatDateHeureUTC(commande.date)}` },
				]}
				title={
					<span className="inline-flex flex-wrap items-center gap-2">
						{`Commande du ${formatDateHeureUTC(commande.date)}`}
						<Badge variant={COMMANDE_PORTAIL_STATUT_VARIANT[commande.statut]}>
							{COMMANDE_PORTAIL_STATUT_LABELS[commande.statut] ??
								commande.statut}
						</Badge>
					</span>
				}
				description={
					<>
						{TYPE_COMMANDE_PORTAIL_LABELS[commande.type] ?? commande.type}
						{commande.adresse_livraison
							? ` — ${commande.adresse_livraison}`
							: ""}
					</>
				}
				actions={
					<div className="flex flex-wrap items-center gap-2">
						{canCommander && estCommandeAnnulable(commande) ? (
							<Button
								variant="outline"
								size="sm"
								className="rounded-full text-destructive hover:bg-destructive/10"
								onClick={() => setConfirmOuvert(true)}
							>
								Annuler la commande
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

			{commande.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{commande.motif_annulation}</p>
				</div>
			) : null}

			{commande.lignes && commande.lignes.length > 0 ? (
				<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
					<h2 className="text-base font-semibold text-foreground">
						Articles commandés
					</h2>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>Plat</Th>
								<Th className="text-right">Qté</Th>
								<Th className="text-right">P.U.</Th>
								<Th className="text-right">Total</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{commande.lignes.map((ligne) => (
								<Tr key={ligne.id_plat}>
									<Td className="text-foreground">
										{ligne.nom_plat ?? `Plat ${ligne.id_plat}`}
									</Td>
									<Td className="text-right text-foreground">
										{ligne.quantite}
									</Td>
									<Td className="text-right text-foreground">
										{formatMontantFCFA(ligne.prix_unitaire)}
									</Td>
									<Td className="text-right text-foreground">
										{formatMontantFCFA(ligne.total)}
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
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
				<section className="rounded-xl border border-border bg-card p-5 text-sm shadow-sm">
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
