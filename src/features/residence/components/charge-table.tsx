import { HandCoins } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { type Charge, chargeStatutLabel } from "../models/charges";
import { formatMontantFCFA } from "../models/format";

const CHARGE_STATUT_BADGE: Record<string, string> = {
	PAYEE: "bg-[#27AE60] text-white",
	IMPAYEE: "bg-[#E74C3C] text-white",
	PARTIELLE: "bg-[#E67E22] text-white",
};

interface ChargeTableProps {
	charges: Charge[];
	onPayer: (charge: Charge) => void;
}

/**
 * Tableau des charges facturées (M2.4). Action « Enregistrer un paiement »
 * (gated `RESIDENCE.CREER` && `FINANCES.VOIR`) — pas de « Modifier » (aucun
 * PATCH `/charges/{id}` dans le spec).
 */
export function ChargeTable({ charges, onPayer }: ChargeTableProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	if (charges.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucune charge trouvée.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							LOGEMENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							PÉRIODE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							CATÉGORIE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							MONTANT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							MONTANT PAYÉ
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							STATUT
						</th>
						<th scope="col" className="px-4 py-3 text-right font-medium">
							ACTIONS
						</th>
					</tr>
				</thead>
				<tbody>
					{charges.map((charge) => {
						const aUnReste = Number(charge.reste_a_payer) > 0;
						return (
							<tr
								key={charge.id}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 font-semibold text-foreground">
									{charge.numero_logement}
								</td>
								<td className="px-4 py-3 text-foreground">{charge.periode}</td>
								<td className="px-4 py-3 text-foreground">
									{charge.categorie_libelle}
								</td>
								<td className="px-4 py-3 text-foreground">
									{formatMontantFCFA(charge.montant)}
								</td>
								<td className="px-4 py-3 text-foreground">
									{formatMontantFCFA(charge.montant_paye)}
								</td>
								<td className="px-4 py-3">
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
											CHARGE_STATUT_BADGE[charge.statut] ??
												"bg-[#95A5A6] text-white",
										)}
									>
										{chargeStatutLabel(charge.statut)}
									</span>
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-end">
										{canCreer && canFinancesVoir && aUnReste ? (
											<Button
												variant="ghost"
												size="icon-sm"
												title="Enregistrer le paiement"
												onClick={() => onPayer(charge)}
											>
												<HandCoins className="size-4 text-lagoon" aria-hidden />
												<span className="sr-only">Enregistrer le paiement</span>
											</Button>
										) : null}
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
