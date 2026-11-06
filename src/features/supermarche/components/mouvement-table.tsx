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
import { formatDateHeureUTC } from "#/features/residence/models/format";
import {
	MOUVEMENT_TYPE_LABELS,
	MOUVEMENT_TYPE_VARIANT,
	type Mouvement,
} from "../models/mouvements";

interface MouvementTableProps {
	mouvements: Mouvement[];
	/** Nom du fournisseur par référence produit (`null` si sans fournisseur). */
	fournisseursParReference: ReadonlyMap<string, string | null>;
}

/**
 * Tableau de l'historique des mouvements de stock (M3). L'historique expose
 * référence, nom, date, type, quantité, delta et stock résultant (pas de
 * motif/document ni de fournisseur dans la réponse — résolu via le
 * catalogue produits côté page).
 */
export function MouvementTable({
	mouvements,
	fournisseursParReference,
}: MouvementTableProps) {
	if (mouvements.length === 0) {
		return <EmptyState title="Aucun mouvement trouvé." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>DATE</Th>
						<Th>PRODUIT</Th>
						<Th>FOURNISSEUR</Th>
						<Th>TYPE</Th>
						<Th>QUANTITÉ</Th>
						<Th>STOCK RÉSULTANT</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{mouvements.map((mouvement) => (
						<Tr
							key={`${mouvement.reference}-${mouvement.date}-${mouvement.delta}-${mouvement.stock_resultant}`}
						>
							<Td className="text-muted-foreground">
								{formatDateHeureUTC(mouvement.date)}
							</Td>
							<Td className="text-foreground">
								<span className="font-medium">{mouvement.reference}</span> —{" "}
								{mouvement.nom}
							</Td>
							<Td className="text-muted-foreground">
								{fournisseursParReference.get(mouvement.reference) ?? "—"}
							</Td>
							<Td>
								<Badge variant={MOUVEMENT_TYPE_VARIANT[mouvement.type]}>
									{MOUVEMENT_TYPE_LABELS[mouvement.type]}
								</Badge>
							</Td>
							<Td className="text-foreground">
								{mouvement.quantite_mouvement}
							</Td>
							<Td className="text-foreground">{mouvement.stock_resultant}</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
