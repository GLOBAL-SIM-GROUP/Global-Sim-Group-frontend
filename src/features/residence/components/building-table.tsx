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

import type { Batiment } from "../models/batiments";
import { BuildingActions } from "./building-actions";

interface BuildingTableProps {
	batiments: Batiment[];
	onToggle: (batiment: Batiment) => void;
	onEdit: (batiment: Batiment) => void;
	onDelete: (batiment: Batiment) => void;
}

/** Tableau des bâtiments. */
export function BuildingTable({
	batiments,
	onToggle,
	onEdit,
	onDelete,
}: BuildingTableProps) {
	if (batiments.length === 0) {
		return <EmptyState title="Aucun bâtiment trouvé." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>CODE</Th>
						<Th>NOM</Th>
						<Th>ADRESSE</Th>
						<Th>STATUT</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{batiments.map((batiment) => (
						<Tr key={batiment.id}>
							<Td className="font-semibold text-foreground">{batiment.code}</Td>
							<Td>
								{/* Toute la ligne est cliquable : le lien (stretched) du nom
								    couvre le <tr> via `after:inset-0` (le <tr> est `relative`).
								    La cellule ACTIONS repasse au-dessus (`relative z-10`) pour
								    garder les boutons fonctionnels. */}
								<Link
									to="/residence/logements"
									search={{ batiment: batiment.id }}
									title={`Voir les logements de ${batiment.nom}`}
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{batiment.nom}
								</Link>
							</Td>
							<Td className="text-muted-foreground">
								{batiment.adresse ?? "—"}
							</Td>
							<Td>
								<Badge variant={batiment.actif ? "success" : "neutral"}>
									{batiment.actif ? "Actif" : "Inactif"}
								</Badge>
							</Td>
							<Td className="relative z-10 text-right">
								<BuildingActions
									batiment={batiment}
									onToggle={onToggle}
									onEdit={onEdit}
									onDelete={onDelete}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
