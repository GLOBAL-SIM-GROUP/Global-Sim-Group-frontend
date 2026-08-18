import { Dialog } from "radix-ui";

import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
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

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Facture n° {venteId ?? "—"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Détail de la vente et de ses lignes.
					</Dialog.Description>

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
											{formatDateHeureISO(venteQuery.data.date)}
										</dd>
									</div>
									<div>
										<dt className="text-muted-foreground">Statut</dt>
										<dd className="text-foreground">
											{VENTE_STATUT_LABELS[venteQuery.data.statut]}
										</dd>
									</div>
								</dl>

								<div className="overflow-x-auto rounded-md border border-border">
									<table className="w-full border-collapse text-sm">
										<thead className="bg-sea-ink text-left text-white">
											<tr>
												<th scope="col" className="px-3 py-2 font-medium">
													PRODUIT
												</th>
												<th scope="col" className="px-3 py-2 font-medium">
													QTÉ
												</th>
												<th scope="col" className="px-3 py-2 font-medium">
													P.U.
												</th>
												<th
													scope="col"
													className="px-3 py-2 text-right font-medium"
												>
													TOTAL
												</th>
											</tr>
										</thead>
										<tbody>
											{venteQuery.data.lignes.map((ligne) => (
												<tr key={ligne.id} className="border-t border-border">
													<td className="px-3 py-2 text-foreground">
														{ligne.id_produit}
													</td>
													<td className="px-3 py-2 text-foreground">
														{ligne.quantite}
													</td>
													<td className="px-3 py-2 text-foreground">
														{formatMontantFCFA(ligne.prix_unitaire)}
													</td>
													<td className="px-3 py-2 text-right text-foreground">
														{formatMontantFCFA(ligne.total_ligne)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<p className="text-right text-sm font-semibold text-foreground">
									Total : {formatMontantFCFA(venteQuery.data.total)}
								</p>
							</div>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
