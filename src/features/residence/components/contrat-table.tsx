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
	CONTRAT_STATUT_LABELS,
	CONTRAT_STATUT_VARIANT,
	type ContratJoin,
} from "../models/contrats";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { ContratActions } from "./contrat-actions";

interface ContratTableProps {
	contrats: ContratJoin[];
	onActiver?: (contrat: ContratJoin) => void;
	onModifier?: (contrat: ContratJoin) => void;
}

/** Tableau des contrats de location. */
export function ContratTable({
	contrats,
	onActiver,
	onModifier,
}: ContratTableProps) {
	if (contrats.length === 0) {
		return <EmptyState title="Aucun contrat trouvé." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>NUMÉRO CONTRAT</Th>
						<Th>LOCATAIRE</Th>
						<Th>LOGEMENT</Th>
						<Th>DATE DÉBUT</Th>
						<Th>DATE FIN</Th>
						<Th>LOYER</Th>
						<Th>STATUT</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{contrats.map((contrat) => (
						<Tr key={contrat.id}>
							<Td>
								{/* Toute la ligne est cliquable (stretched link) vers la fiche
								    contrat ; la cellule ACTIONS repasse au-dessus (z-10). */}
								<Link
									to="/residence/contrats/$id"
									params={{ id: contrat.id }}
									title={`Voir la fiche du contrat ${contrat.numero_contrat}`}
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{contrat.numero_contrat}
								</Link>
							</Td>
							<Td className="text-foreground">{contrat.clientNom}</Td>
							<Td className="text-foreground">{contrat.logementNumero}</Td>
							<Td className="text-muted-foreground">
								{formatDateISO(contrat.date_debut)}
							</Td>
							<Td className="text-muted-foreground">
								{formatDateISO(contrat.date_fin_prevue)}
							</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(contrat.montant_loyer)}
							</Td>
							<Td>
								<Badge variant={CONTRAT_STATUT_VARIANT[contrat.statut]}>
									{CONTRAT_STATUT_LABELS[contrat.statut]}
								</Badge>
							</Td>
							<Td className="relative z-10 text-right">
								<ContratActions
									contrat={contrat}
									onActiver={onActiver}
									onModifier={onModifier}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
