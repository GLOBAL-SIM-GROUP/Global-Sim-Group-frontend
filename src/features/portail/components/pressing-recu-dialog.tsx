import { Loader2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useRecuCommandePressing } from "../hooks/use-pressing";
import type { PressingStatut } from "../models/pressing";
import {
	libelleDateDepot,
	libelleMontantPressing,
	PRESSING_STATUT_LABELS,
} from "../models/pressing";

interface PressingRecuDialogProps {
	open: boolean;
	/** Id de la commande (null si fermé). */
	id: string | null;
	onOpenChange: (open: boolean) => void;
}

/**
 * Reçu d'une commande de pressing (portail résident) : l'endpoint `recu`
 * renvoie des données JSON — rendues ici dans une modale (pas de PDF).
 * Tant que le dépôt n'est pas tarifé (`EN_ATTENTE`), les lignes sont
 * déclaratives et les montants `null` → affichés « — ».
 */
export function PressingRecuDialog({
	open,
	id,
	onOpenChange,
}: PressingRecuDialogProps) {
	const recuQuery = useRecuCommandePressing(id, open);
	const recu = recuQuery.data;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] overflow-y-auto">
				<DialogTitle>Reçu de dépôt</DialogTitle>
				<DialogDescription>
					{recu ? recu.numero_commande : ""}
				</DialogDescription>

				<div className="mt-4">
					{recuQuery.isLoading ? (
						<p className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" aria-hidden />
							Chargement…
						</p>
					) : recuQuery.isError || !recu ? (
						<div
							role="alert"
							className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
						>
							<p>Aucun reçu n'est disponible pour cette commande.</p>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full"
								onClick={() => onOpenChange(false)}
							>
								Fermer
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									{libelleDateDepot(recu)}
								</span>
								<span className="font-medium text-foreground">
									{PRESSING_STATUT_LABELS[recu.statut as PressingStatut] ??
										recu.statut}
								</span>
							</div>

							<DataTable>
								<DataTableHead>
									<tr>
										<Th>Article</Th>
										<Th className="text-right">Qté</Th>
										<Th className="text-right">Tarif</Th>
										<Th className="text-right">Total</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{recu.lignes.map((ligne) => (
										<Tr
											key={`${ligne.type_vetement}-${ligne.prestation}-${ligne.quantite}`}
										>
											<Td className="text-foreground">
												{ligne.type_vetement} — {ligne.prestation}
											</Td>
											<Td className="text-right text-foreground">
												{ligne.quantite}
											</Td>
											<Td className="text-right text-foreground">
												{formatMontantFCFA(ligne.tarif)}
											</Td>
											<Td className="text-right text-foreground">
												{formatMontantFCFA(ligne.total)}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>

							<div className="space-y-1 rounded-lg border border-border bg-sea-ink/5 p-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Montant total</span>
									<span className="font-medium text-foreground">
										{libelleMontantPressing(recu.montant_total)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Acompte</span>
									<span className="font-medium text-foreground">
										{formatMontantFCFA(recu.acompte)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Reste à payer</span>
									<span className="font-medium text-foreground">
										{formatMontantFCFA(recu.reste_a_payer)}
									</span>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									type="button"
									variant="ghost"
									className="rounded-full"
									onClick={() => onOpenChange(false)}
								>
									Fermer
								</Button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
