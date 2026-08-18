import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

import { type EcheanceSuivi, echanceStatutLabel } from "../models/echeances";
import { formatDateISO, formatMontantFCFA } from "../models/format";

const ECHANCE_STATUT_BADGE: Record<string, string> = {
	PAYE: "bg-[#27AE60] text-white",
	IMPAYE: "bg-[#E74C3C] text-white",
	PARTIEL: "bg-[#E67E22] text-white",
	A_VENIR: "bg-[#95A5A6] text-white",
	EN_ATTENTE: "bg-[#95A5A6] text-white",
};

interface EcheancesTableProps {
	echeances: EcheanceSuivi[];
	/** `numero_contrat` → id du contrat (liens vers la fiche). */
	contratIds: ReadonlyMap<string, string>;
}

/**
 * Tableau du suivi des échéances. `/suivi` n'expose pas d'id d'échéance : la
 * seule action est le lien vers la fiche contrat (l'encaissement y a lieu).
 */
export function EcheancesTable({ echeances, contratIds }: EcheancesTableProps) {
	if (echeances.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucune échéance trouvée.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							LOCATAIRE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							LOGEMENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							MOIS
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							ANNÉE
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
							ACTION
						</th>
					</tr>
				</thead>
				<tbody>
					{echeances.map((echeance) => {
						const contratId = contratIds.get(echeance.numero_contrat);
						return (
							<tr
								key={`${echeance.numero_contrat}-${echeance.mois}-${echeance.annee}`}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 text-foreground">{echeance.client}</td>
								<td className="px-4 py-3 text-foreground">
									{echeance.logement}
								</td>
								<td className="px-4 py-3 font-semibold text-foreground">
									{echeance.mois}
								</td>
								<td className="px-4 py-3 text-foreground">{echeance.annee}</td>
								<td className="px-4 py-3 text-foreground">
									{formatMontantFCFA(echeance.loyer_applique)}
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
										{contratId ? (
											<Link
												to="/residence/contrats/$id"
												params={{ id: contratId }}
												className="text-sm font-medium text-lagoon transition-colors hover:underline"
											>
												Voir le contrat
											</Link>
										) : (
											<span className="text-sm text-muted-foreground">—</span>
										)}
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
