import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import { DownloadReceiptButton } from "#/features/facturation/components/download-receipt-button";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { useProduits } from "../hooks/use-produits";
import { useVente } from "../hooks/use-ventes";
import { VENTE_STATUT_LABELS } from "../models/ventes";

interface VenteFactureDialogProps {
	open: boolean;
	/** Id de la vente affichée ; null = fermé. */
	venteId: string | null;
	onOpenChange: (open: boolean) => void;
}

/**
 * Modale « Voir la facture » d'une vente (M3) : détail + lignes, chargé par
 * `GET /market/ventes/{id}`.
 */
export function VenteFactureDialog({
	open,
	venteId,
	onOpenChange,
}: VenteFactureDialogProps) {
	const venteQuery = useVente(venteId ?? undefined);
	const produitsQuery = useProduits();
	const nomProduit = (idProduit: string) =>
		produitsQuery.data?.find((produit) => produit.id === idProduit)?.nom ??
		`Produit ${idProduit}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>Facture n° {venteId ?? "—"}</DialogTitle>
				<DialogDescription>
					Détail de la vente et de ses lignes.
				</DialogDescription>

				<div className="mt-4">
					{venteQuery.isLoading ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : venteQuery.isError || !venteQuery.data ? (
						<p role="alert" className="text-sm text-destructive">
							Vente introuvable.
						</p>
					) : (
						<div className="space-y-4">
							<dl className="grid gap-2 text-sm sm:grid-cols-2">
								<div>
									<dt className="text-muted-foreground">Date</dt>
									<dd className="text-foreground">
										{formatDateHeureUTC(venteQuery.data.date)}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Statut</dt>
									<dd className="text-foreground">
										{VENTE_STATUT_LABELS[venteQuery.data.statut]}
										{venteQuery.data.origine === "PORTAIL"
											? " — demande portail"
											: ""}
									</dd>
								</div>
							</dl>

							{venteQuery.data.note ? (
								<div className="rounded-md border border-border bg-accent/20 p-3 text-sm">
									<p className="font-medium text-foreground">Note du client</p>
									<p className="mt-0.5 text-muted-foreground">
										{venteQuery.data.note}
									</p>
								</div>
							) : null}

							{venteQuery.data.motif_annulation ? (
								<div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
									<p className="font-medium text-destructive">
										Motif d'annulation
									</p>
									<p className="mt-0.5 text-foreground">
										{venteQuery.data.motif_annulation}
									</p>
								</div>
							) : null}

							<div className="overflow-x-auto rounded-md border border-border">
								<DataTable>
									<DataTableHead>
										<tr>
											<Th>PRODUIT</Th>
											<Th>QTÉ</Th>
											<Th>P.U.</Th>
											<Th className="text-right">TOTAL</Th>
										</tr>
									</DataTableHead>
									<tbody>
										{venteQuery.data.lignes.map((ligne) => (
											<Tr key={ligne.id}>
												<Td className="text-foreground">
													{nomProduit(ligne.id_produit)}
												</Td>
												<Td className="text-foreground">{ligne.quantite}</Td>
												<Td className="text-foreground">
													{formatMontantFCFA(ligne.prix_unitaire)}
												</Td>
												<Td className="text-right text-foreground">
													{formatMontantFCFA(ligne.total_ligne)}
												</Td>
											</Tr>
										))}
									</tbody>
								</DataTable>
							</div>

							<div className="flex items-center justify-between gap-4">
								<DownloadReceiptButton
									sourceType="VENTE"
									idClient={venteQuery.data.id_client}
									montantTotal={venteQuery.data.total}
									isPaid={venteQuery.data.statut === "PAYEE"}
								/>
								<p className="text-right text-sm font-semibold text-foreground">
									Total : {formatMontantFCFA(venteQuery.data.total)}
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
