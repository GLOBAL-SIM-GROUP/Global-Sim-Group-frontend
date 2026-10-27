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
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import {
	VENTE_STATUT_LABELS,
	VENTE_STATUT_VARIANT,
	type VenteJoin,
} from "../models/ventes";
import { VenteActions } from "./vente-actions";

interface VenteTableProps {
	ventes: VenteJoin[];
	onVoirFacture: (vente: VenteJoin) => void;
	onValider: (vente: VenteJoin) => void;
	onRefuser: (vente: VenteJoin) => void;
	onEncaisser: (vente: VenteJoin) => void;
	onAnnuler: (vente: VenteJoin) => void;
}

/** Tableau de l'historique des ventes (M3) — demandes portail incluses. */
export function VenteTable({
	ventes,
	onVoirFacture,
	onValider,
	onRefuser,
	onEncaisser,
	onAnnuler,
}: VenteTableProps) {
	if (ventes.length === 0) {
		return <EmptyState title="Aucune vente trouvée." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>N° FACTURE</Th>
						<Th>DATE</Th>
						<Th>CLIENT</Th>
						<Th>TOTAL</Th>
						<Th>REMISE</Th>
						<Th>STATUT</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{ventes.map((vente) => (
						<Tr key={vente.id}>
							<Td className="font-semibold text-foreground">{vente.id}</Td>
							<Td className="text-muted-foreground">
								{formatDateHeureUTC(vente.date)}
							</Td>
							<Td className="text-foreground">{vente.clientNom}</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(vente.total)}
							</Td>
							<Td className="text-muted-foreground">
								{formatMontantFCFA(vente.remise)}
							</Td>
							<Td>
								<div className="flex flex-wrap items-center gap-1.5">
									<Badge variant={VENTE_STATUT_VARIANT[vente.statut]}>
										{VENTE_STATUT_LABELS[vente.statut]}
									</Badge>
									{vente.origine === "PORTAIL" ? (
										<Badge variant="neutral">Portail</Badge>
									) : null}
								</div>
							</Td>
							<Td>
								<VenteActions
									vente={vente}
									onVoirFacture={onVoirFacture}
									onValider={onValider}
									onRefuser={onRefuser}
									onEncaisser={onEncaisser}
									onAnnuler={onAnnuler}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
