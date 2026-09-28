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

import { formatDateHeureISO, formatMontantFCFA } from "../models/format";
import {
	SEJOUR_ORIGINE_LABELS,
	SEJOUR_ORIGINE_VARIANT,
	SEJOUR_STATUT_LABELS,
	SEJOUR_STATUT_VARIANT,
	SEJOUR_TYPE_LABELS,
	type Sejour,
} from "../models/sejours";
import { SejourActions } from "./sejour-actions";

interface SejourTableProps {
	sejours: Sejour[];
	onEdit: (sejour: Sejour) => void;
	onPayer: (sejour: Sejour) => void;
	onValider: (sejour: Sejour) => void;
	onRefuser: (sejour: Sejour) => void;
}

/**
 * Tableau des séjours courts (M2.3). Toute la ligne est cliquable (stretched
 * link) vers la fiche ; la cellule ACTIONS repasse au-dessus (z-10). La
 * colonne ORIGINE distingue les demandes portail (`EN_ATTENTE`) des séjours
 * enregistrés au comptoir.
 */
export function SejourTable({
	sejours,
	onEdit,
	onPayer,
	onValider,
	onRefuser,
}: SejourTableProps) {
	if (sejours.length === 0) {
		return <EmptyState title="Aucun séjour trouvé." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>CLIENT</Th>
						<Th>TYPE</Th>
						<Th>LOGEMENT</Th>
						<Th>ARRIVÉE</Th>
						<Th>DÉPART</Th>
						<Th>ORIGINE</Th>
						<Th>STATUT</Th>
						<Th>MONTANT TOTAL</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{sejours.map((sejour) => (
						<Tr key={sejour.id}>
							<Td>
								{/* Toute la ligne est cliquable (stretched link) vers la fiche
								    séjour ; la cellule ACTIONS repasse au-dessus (z-10). */}
								<Link
									to="/residence/sejours-courts/$id"
									params={{ id: sejour.id }}
									title="Voir la fiche du séjour"
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{[sejour.client_nom, sejour.client_prenoms]
										.filter(Boolean)
										.join(" ") || "—"}
								</Link>
							</Td>
							<Td className="text-foreground">
								{SEJOUR_TYPE_LABELS[sejour.type_prestation]}
							</Td>
							<Td className="text-foreground">{sejour.numero_logement}</Td>
							<Td className="text-muted-foreground">
								{formatDateHeureISO(sejour.date_heure_arrivee)}
							</Td>
							<Td className="text-muted-foreground">
								{formatDateHeureISO(sejour.date_heure_depart_prevue)}
							</Td>
							<Td>
								<Badge
									variant={SEJOUR_ORIGINE_VARIANT[sejour.origine] ?? "neutral"}
								>
									{SEJOUR_ORIGINE_LABELS[sejour.origine] ?? sejour.origine}
								</Badge>
							</Td>
							<Td>
								<Badge variant={SEJOUR_STATUT_VARIANT[sejour.statut]}>
									{SEJOUR_STATUT_LABELS[sejour.statut]}
								</Badge>
							</Td>
							<Td className="text-foreground">
								{sejour.montant_total
									? formatMontantFCFA(sejour.montant_total)
									: "—"}
							</Td>
							<Td className="relative z-10 text-right">
								<SejourActions
									sejour={sejour}
									onEdit={onEdit}
									onPayer={onPayer}
									onValider={onValider}
									onRefuser={onRefuser}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
