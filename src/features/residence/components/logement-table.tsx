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
	formatTarifFCFA,
	LOGEMENT_STATUT_LABELS,
	LOGEMENT_STATUT_VARIANT,
	LOGEMENT_TYPE_LABELS,
	type Logement,
	OCCUPATION_LABELS,
} from "../models/logements";
import { LogementActions } from "./logement-actions";

interface LogementTableProps {
	logements: Logement[];
	onEdit: (logement: Logement) => void;
}

/**
 * Tableau des logements du bâtiment courant (même gabarit que le tableau des
 * bâtiments).
 */
export function LogementTable({ logements, onEdit }: LogementTableProps) {
	if (logements.length === 0) {
		return <EmptyState title="Aucun logement trouvé." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>NUMÉRO</Th>
						<Th>TYPE</Th>
						<Th>STATUT</Th>
						<Th>TARIF</Th>
						<Th>OCCUPATION ACTUELLE</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{logements.map((logement) => (
						<Tr key={logement.id}>
							<Td>
								{/* Toute la ligne est cliquable (stretched link) : le lien du
								    numéro couvre le <tr> via `after:inset-0` (le <tr> est
								    `relative`). La cellule ACTIONS repasse au-dessus
								    (`relative z-10`) pour garder les boutons fonctionnels. */}
								<Link
									to="/residence/logements/$id"
									params={{ id: logement.id }}
									title={`Voir la fiche du logement ${logement.numero}`}
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{logement.numero}
								</Link>
							</Td>
							<Td className="text-foreground">
								{LOGEMENT_TYPE_LABELS[logement.type]}
							</Td>
							<Td>
								<Badge variant={LOGEMENT_STATUT_VARIANT[logement.statut]}>
									{LOGEMENT_STATUT_LABELS[logement.statut]}
								</Badge>
							</Td>
							<Td className="text-foreground">
								{formatTarifFCFA(logement.tarif)}
							</Td>
							<Td className="text-muted-foreground">
								{OCCUPATION_LABELS[logement.statut]}
							</Td>
							<Td className="relative z-10 text-right">
								<LogementActions logement={logement} onEdit={onEdit} />
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
