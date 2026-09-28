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
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import {
	type CommandePressing,
	type CommandePressingStatut,
	PRESSING_STATUT_LABELS,
} from "../models/commandes";
import { CommandeActions } from "./commande-actions";

const PRESSING_STATUT_VARIANT = {
	EN_ATTENTE: "warning",
	DEPOSE: "info",
	EN_TRAITEMENT: "warning",
	PRET: "success",
	RETIRE: "neutral",
	ANNULEE: "danger",
} as const satisfies Record<
	CommandePressingStatut,
	"success" | "warning" | "info" | "danger" | "neutral"
>;

interface CommandeTableProps {
	commandes: CommandePressing[];
	canModifier: boolean;
	canCreer: boolean;
	canFinancesVoir: boolean;
	/** `PRESSING.ANNULER` — refuser une demande `EN_ATTENTE`. */
	canAnnuler: boolean;
	canTraiter: boolean;
	canMarquerPret: boolean;
	canRetirer: boolean;
	onEdit: (commande: CommandePressing) => void;
	onTraitement: (commande: CommandePressing) => void;
	onPret: (commande: CommandePressing) => void;
	onRetirer: (commande: CommandePressing) => void;
	onValider: (commande: CommandePressing) => void;
	onRefuser: (commande: CommandePressing) => void;
}

/**
 * Tableau des commandes pressing (M4). Toute la ligne est cliquable (stretched
 * link) vers la fiche ; la cellule ACTIONS repasse au-dessus (z-10).
 */
export function CommandeTable({
	commandes,
	canModifier,
	canCreer,
	canFinancesVoir,
	canAnnuler,
	canTraiter,
	canMarquerPret,
	canRetirer,
	onEdit,
	onTraitement,
	onPret,
	onRetirer,
	onValider,
	onRefuser,
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
						<Th>DATE DÉPÔT</Th>
						<Th>RETRAIT PRÉVU</Th>
						<Th>MONTANT</Th>
						<Th>ACOMPTE</Th>
						<Th>RESTE</Th>
						<Th>STATUT</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{commandes.map((commande) => (
						<Tr key={commande.id}>
							<Td>
								{/* Toute la ligne est cliquable (stretched link) vers la fiche ;
								    la cellule ACTIONS repasse au-dessus (z-10). */}
								<Link
									to="/pressing/commandes/$id"
									params={{ id: commande.id }}
									title="Voir la fiche"
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{commande.numero_commande}
								</Link>
							</Td>
							<Td className="text-foreground">
								{`${commande.client_nom} ${commande.client_prenoms}`.trim()}
							</Td>
							<Td className="text-muted-foreground">
								{formatDateHeureUTC(commande.date_depot)}
							</Td>
							<Td className="text-muted-foreground">
								{commande.date_retrait_prevue ?? "—"}
							</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(commande.montant_total)}
							</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(commande.acompte)}
							</Td>
							<Td className="text-muted-foreground">
								{formatMontantFCFA(commande.reste_a_payer)}
							</Td>
							<Td>
								<Badge variant={PRESSING_STATUT_VARIANT[commande.statut]}>
									{PRESSING_STATUT_LABELS[commande.statut]}
								</Badge>
							</Td>
							<Td className="relative z-10">
								<CommandeActions
									commande={commande}
									canModifier={canModifier}
									canCreer={canCreer}
									canFinancesVoir={canFinancesVoir}
									canAnnuler={canAnnuler}
									canTraiter={canTraiter}
									canMarquerPret={canMarquerPret}
									canRetirer={canRetirer}
									onEdit={onEdit}
									onTraitement={onTraitement}
									onPret={onPret}
									onRetirer={onRetirer}
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
