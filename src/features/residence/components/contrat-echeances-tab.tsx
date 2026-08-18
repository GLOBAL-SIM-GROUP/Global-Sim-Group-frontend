import { HandCoins } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import type { Echeance } from "../models/contrats";
import { echanceStatutLabel } from "../models/echeances";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { EncaisserFormDialog } from "./encaisser-form-dialog";

const ECHANCE_STATUT_BADGE: Record<string, string> = {
	PAYE: "bg-[#27AE60] text-white",
	IMPAYE: "bg-[#E74C3C] text-white",
	PARTIEL: "bg-[#E67E22] text-white",
	A_VENIR: "bg-[#95A5A6] text-white",
	EN_ATTENTE: "bg-[#95A5A6] text-white",
};

interface ContratEcheancesTabProps {
	/** Échéances du contrat (embarquées par le GET détail). */
	echeances: Echeance[];
}

/**
 * Onglet « Échéances » de la fiche contrat : tableau des échéances mensuelles
 * + bouton « Enregistrer un paiement » (POST `/echeances/{id}/encaisser`) sur
 * les lignes non payées, gated par `RESIDENCE.CREER` && `FINANCES.VOIR`.
 */
export function ContratEcheancesTab({ echeances }: ContratEcheancesTabProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const moyensQuery = useMoyensPaiement();
	const [aEncaisser, setAEncaisser] = useState<Echeance | null>(null);

	if (echeances.length === 0) {
		return (
			<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
				Aucune échéance générée pour ce contrat.
			</p>
		);
	}

	return (
		<section className="space-y-3">
			<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
				<table className="w-full border-collapse text-sm">
					<thead className="bg-sea-ink text-left text-white">
						<tr>
							<th scope="col" className="px-4 py-3 font-medium">
								MOIS
							</th>
							<th scope="col" className="px-4 py-3 font-medium">
								MONTANT
							</th>
							<th scope="col" className="px-4 py-3 font-medium">
								STATUT
							</th>
							<th scope="col" className="px-4 py-3 font-medium">
								DATE D'ÉCHÉANCE
							</th>
							<th scope="col" className="px-4 py-3 text-right font-medium">
								ACTIONS
							</th>
						</tr>
					</thead>
					<tbody>
						{echeances.map((echeance) => (
							<tr
								key={echeance.id}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 font-semibold text-foreground">
									{echeance.mois}/{echeance.annee}
								</td>
								<td className="px-4 py-3 text-foreground">
									{formatMontantFCFA(echeance.montant)}
								</td>
								<td className="px-4 py-3">
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
											ECHANCE_STATUT_BADGE[echeance.statut] ??
												"bg-[#95A5A6] text-white",
										)}
									>
										{echanceStatutLabel(echeance.statut)}
									</span>
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{formatDateISO(echeance.date_echeance)}
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-end">
										{canCreer &&
										canFinancesVoir &&
										echeance.statut !== "PAYE" ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setAEncaisser(echeance)}
											>
												<HandCoins className="size-4" aria-hidden />
												Enregistrer un paiement
											</Button>
										) : null}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<EncaisserFormDialog
				open={aEncaisser !== null}
				echeance={aEncaisser}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAEncaisser(null);
				}}
				onSaved={() => setAEncaisser(null)}
			/>
		</section>
	);
}
