import { Dialog } from "radix-ui";

import { DownloadReceiptButton } from "#/features/facturation/components/download-receipt-button";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { useCommande } from "../hooks/use-commandes";
import { COMMANDE_STATUT_LABELS } from "../models/commandes";

interface CommandeFactureDialogProps {
	open: boolean;
	/** Id de la commande affichée ; null = fermé. */
	commandeId: string | null;
	onOpenChange: (open: boolean) => void;
}

/** Modale « Voir la facture » d'une commande restaurant (M5) : lignes + total. */
export function CommandeFactureDialog({
	open,
	commandeId,
	onOpenChange,
}: CommandeFactureDialogProps) {
	const commandeQuery = useCommande(commandeId ?? undefined);

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Facture n° {commandeId ?? "—"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Détail de la commande et de ses lignes.
					</Dialog.Description>

					<div className="mt-4">
						{commandeQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">Chargement…</p>
						) : commandeQuery.isError || !commandeQuery.data ? (
							<p role="alert" className="text-sm text-destructive">
								Commande introuvable.
							</p>
						) : (
							<div className="space-y-4">
								<dl className="grid gap-2 text-sm sm:grid-cols-2">
									<div>
										<dt className="text-muted-foreground">Statut</dt>
										<dd className="text-foreground">
											{COMMANDE_STATUT_LABELS[commandeQuery.data.statut]}
										</dd>
									</div>
									<div>
										<dt className="text-muted-foreground">Type</dt>
										<dd className="text-foreground">
											{commandeQuery.data.type}
										</dd>
									</div>
								</dl>

								<div className="overflow-x-auto rounded-md border border-border">
									<table className="w-full border-collapse text-sm">
										<thead className="bg-sea-ink text-left text-white">
											<tr>
												<th scope="col" className="px-3 py-2 font-medium">
													PLAT
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
											{commandeQuery.data.lignes.map((ligne) => (
												<tr key={ligne.id} className="border-t border-border">
													<td className="px-3 py-2 text-foreground">
														{ligne.id_plat}
													</td>
													<td className="px-3 py-2 text-foreground">
														{ligne.quantite}
													</td>
													<td className="px-3 py-2 text-foreground">
														{formatMontantFCFA(ligne.prix_unitaire)}
													</td>
													<td className="px-3 py-2 text-right text-foreground">
														{formatMontantFCFA(ligne.total)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="flex items-center justify-between gap-4">
									<DownloadReceiptButton
										sourceType="COMMANDE_RESTAURANT"
										idClient={commandeQuery.data.id_client}
										montantTotal={commandeQuery.data.total}
										isPaid={commandeQuery.data.statut === "PAYEE"}
									/>
									<p className="text-right text-sm font-semibold text-foreground">
										Total : {formatMontantFCFA(commandeQuery.data.total)}
									</p>
								</div>
							</div>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
