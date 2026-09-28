import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { DownloadReceiptButton } from "#/features/facturation/components/download-receipt-button";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { useCommande } from "../hooks/use-commandes";
import {
	COMMANDE_STATUT_LABELS,
	TYPE_COMMANDE_LABELS,
} from "../models/commandes";

interface CommandeFactureDialogProps {
	open: boolean;
	/** Id de la commande affichée ; null = fermé. */
	commandeId: string | null;
	/** Index `id_plat` → nom (la page charge déjà le catalogue). */
	plats?: ReadonlyMap<string, string>;
	onOpenChange: (open: boolean) => void;
}

/** Modale « Voir la facture » d'une commande restaurant (M5) : lignes + total. */
export function CommandeFactureDialog({
	open,
	commandeId,
	plats,
	onOpenChange,
}: CommandeFactureDialogProps) {
	const commandeQuery = useCommande(commandeId ?? undefined);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>Facture n° {commandeId ?? "—"}</DialogTitle>
				<DialogDescription>
					Détail de la commande et de ses lignes.
				</DialogDescription>

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
										{TYPE_COMMANDE_LABELS[commandeQuery.data.type] ??
											commandeQuery.data.type}
									</dd>
								</div>
								{commandeQuery.data.adresse_livraison ? (
									<div className="sm:col-span-2">
										<dt className="text-muted-foreground">
											Adresse de livraison
										</dt>
										<dd className="text-foreground">
											{commandeQuery.data.adresse_livraison}
										</dd>
									</div>
								) : null}
								{commandeQuery.data.notes ? (
									<div className="sm:col-span-2">
										<dt className="text-muted-foreground">Note du client</dt>
										<dd className="text-foreground">
											{commandeQuery.data.notes}
										</dd>
									</div>
								) : null}
							</dl>

							{commandeQuery.data.motif_annulation ? (
								<p
									role="alert"
									className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
								>
									Motif du refus : {commandeQuery.data.motif_annulation}
								</p>
							) : null}

							<TableShell>
								<DataTable>
									<DataTableHead>
										<tr>
											<Th>PLAT</Th>
											<Th>QTÉ</Th>
											<Th>P.U.</Th>
											<Th className="text-right">TOTAL</Th>
										</tr>
									</DataTableHead>
									<tbody>
										{commandeQuery.data.lignes.map((ligne) => (
											<Tr key={ligne.id}>
												<Td className="text-foreground">
													{plats?.get(ligne.id_plat) ?? ligne.id_plat}
													{ligne.quantite_couverte != null &&
													ligne.quantite_couverte > 0 ? (
														<span className="block text-xs text-lagoon">
															{ligne.quantite_couverte}/{ligne.quantite}{" "}
															couvert(s) par abonnement
														</span>
													) : null}
												</Td>
												<Td className="text-foreground">{ligne.quantite}</Td>
												<Td className="text-foreground">
													{formatMontantFCFA(ligne.prix_unitaire)}
												</Td>
												<Td className="text-right text-foreground">
													{formatMontantFCFA(ligne.total)}
												</Td>
											</Tr>
										))}
									</tbody>
								</DataTable>
							</TableShell>

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
			</DialogContent>
		</Dialog>
	);
}
