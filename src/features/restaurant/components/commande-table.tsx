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
	COMMANDE_STATUT_LABELS,
	type CommandeRestaurant,
	type CommandeRestaurantStatut,
	TYPE_COMMANDE_LABELS,
} from "../models/commandes";
import { CommandeActions } from "./commande-actions";

const COMMANDE_STATUT_VARIANT = {
	EN_ATTENTE: "warning",
	EN_COURS: "info",
	EN_PREPARATION: "warning",
	SERVIE: "success",
	PAYEE: "neutral",
	ANNULEE: "danger",
} as const satisfies Record<
	CommandeRestaurantStatut,
	"success" | "warning" | "info" | "danger" | "neutral"
>;

interface CommandeTableProps {
	commandes: CommandeRestaurant[];
	clients: ReadonlyMap<string, string>;
	canModifier: boolean;
	canSupprimer: boolean;
	/** `RESTAURANT.VALIDER` — valider/refuser une demande `EN_ATTENTE`. */
	canValider: boolean;
	/** `FINANCES.ENCAISSER` — encaisser une commande (règlement intégral). */
	canEncaisser: boolean;
	onVoirFacture: (commande: CommandeRestaurant) => void;
	onStatut: (
		commande: CommandeRestaurant,
		statut: CommandeRestaurant["statut"],
	) => void;
	onAnnuler: (commande: CommandeRestaurant) => void;
	onRefuser: (commande: CommandeRestaurant) => void;
	onEncaisser: (commande: CommandeRestaurant) => void;
}

/** Tableau des commandes restaurant (M5). Le client est résolu par la page. */
export function CommandeTable({
	commandes,
	clients,
	canModifier,
	canSupprimer,
	canValider,
	canEncaisser,
	onVoirFacture,
	onStatut,
	onAnnuler,
	onRefuser,
	onEncaisser,
}: CommandeTableProps) {
	if (commandes.length === 0) {
		return <EmptyState title="Aucune commande trouvée." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>N° COMMANDE</Th>
						<Th>CLIENT</Th>
						<Th>DATE</Th>
						<Th>TYPE</Th>
						<Th>TOTAL</Th>
						<Th>STATUT</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{commandes.map((commande) => (
						<Tr key={commande.id}>
							<Td className="font-semibold text-foreground">{commande.id}</Td>
							<Td className="text-foreground">
								{commande.id_client
									? (clients.get(commande.id_client) ?? "…")
									: "—"}
							</Td>
							<Td className="text-muted-foreground">
								{formatDateHeureUTC(commande.date)}
							</Td>
							<Td className="text-foreground">
								{TYPE_COMMANDE_LABELS[commande.type]}
							</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(commande.total)}
							</Td>
							<Td>
								<Badge variant={COMMANDE_STATUT_VARIANT[commande.statut]}>
									{COMMANDE_STATUT_LABELS[commande.statut]}
								</Badge>
							</Td>
							<Td>
								<CommandeActions
									commande={commande}
									canModifier={canModifier}
									canSupprimer={canSupprimer}
									canValider={canValider}
									canEncaisser={canEncaisser}
									onVoirFacture={onVoirFacture}
									onStatut={onStatut}
									onAnnuler={onAnnuler}
									onRefuser={onRefuser}
									onEncaisser={onEncaisser}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
