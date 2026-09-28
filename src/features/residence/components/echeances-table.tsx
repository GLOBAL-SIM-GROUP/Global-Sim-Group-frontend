import { Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import { EmptyState } from "#/components/ui/empty-state";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";

import {
	type EcheanceSuivi,
	echanceStatutLabel,
	echanceStatutVariant,
} from "../models/echeances";
import { formatDateISO, formatMontantFCFA } from "../models/format";

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
		return <EmptyState title="Aucune échéance trouvée." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>LOCATAIRE</Th>
						<Th>LOGEMENT</Th>
						<Th>MOIS</Th>
						<Th>ANNÉE</Th>
						<Th>MONTANT</Th>
						<Th>STATUT</Th>
						<Th>DATE D'ÉCHÉANCE</Th>
						<Th className="text-right">ACTION</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{echeances.map((echeance) => {
						const contratId = contratIds.get(echeance.numero_contrat);
						return (
							<Tr
								key={`${echeance.numero_contrat}-${echeance.mois}-${echeance.annee}`}
							>
								<Td className="text-foreground">{echeance.client}</Td>
								<Td className="text-foreground">{echeance.logement}</Td>
								<Td className="font-semibold text-foreground">
									{echeance.mois}
								</Td>
								<Td className="text-foreground">{echeance.annee}</Td>
								<Td className="text-foreground">
									{formatMontantFCFA(echeance.loyer_applique)}
								</Td>
								<Td>
									<Badge variant={echanceStatutVariant(echeance.statut)}>
										{echanceStatutLabel(echeance.statut)}
									</Badge>
								</Td>
								<Td className="text-muted-foreground">
									{formatDateISO(echeance.date_echeance)}
								</Td>
								<Td>
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
								</Td>
							</Tr>
						);
					})}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
