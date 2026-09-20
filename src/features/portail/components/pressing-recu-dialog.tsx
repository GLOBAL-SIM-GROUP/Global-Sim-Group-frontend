import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "#/components/ui/button";
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Reçu de dépôt
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{recu ? recu.numero_commande : ""}
					</Dialog.Description>

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

								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-border text-left text-muted-foreground">
											<th className="py-1 font-medium">Article</th>
											<th className="py-1 text-right font-medium">Qté</th>
											<th className="py-1 text-right font-medium">Tarif</th>
											<th className="py-1 text-right font-medium">Total</th>
										</tr>
									</thead>
									<tbody>
										{recu.lignes.map((ligne) => (
											<tr
												key={`${ligne.type_vetement}-${ligne.prestation}-${ligne.quantite}`}
												className="border-b border-border/50"
											>
												<td className="py-1 text-foreground">
													{ligne.type_vetement} — {ligne.prestation}
												</td>
												<td className="py-1 text-right text-foreground">
													{ligne.quantite}
												</td>
												<td className="py-1 text-right text-foreground">
													{formatMontantFCFA(ligne.tarif)}
												</td>
												<td className="py-1 text-right text-foreground">
													{formatMontantFCFA(ligne.total)}
												</td>
											</tr>
										))}
									</tbody>
								</table>

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
										onClick={() => onOpenChange(false)}
									>
										Fermer
									</Button>
								</div>
							</div>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
