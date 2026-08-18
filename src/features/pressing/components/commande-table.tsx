import { Link } from "@tanstack/react-router";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import {
	type CommandePressing,
	type CommandePressingStatut,
	PRESSING_STATUT_LABELS,
} from "../models/commandes";
import { CommandeActions } from "./commande-actions";

const PRESSING_STATUT_BADGE: Record<CommandePressingStatut, string> = {
	DEPOSE: "bg-[#2980B9] text-white",
	EN_TRAITEMENT: "bg-[#E67E22] text-white",
	PRET: "bg-[#27AE60] text-white",
	RETIRE: "bg-[#95A5A6] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

interface CommandeTableProps {
	commandes: CommandePressing[];
	canModifier: boolean;
	canCreer: boolean;
	canFinancesVoir: boolean;
	onEdit: (commande: CommandePressing) => void;
	onTraitement: (commande: CommandePressing) => void;
	onPret: (commande: CommandePressing) => void;
	onRetirer: (commande: CommandePressing) => void;
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
	onEdit,
	onTraitement,
	onPret,
	onRetirer,
}: CommandeTableProps) {
	if (commandes.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucune commande trouvée.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							N° COMMANDE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							CLIENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE DÉPÔT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							RETRAIT PRÉVU
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							MONTANT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							ACOMPTE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							RESTE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							STATUT
						</th>
						<th scope="col" className="px-4 py-3 text-right font-medium">
							ACTIONS
						</th>
					</tr>
				</thead>
				<tbody>
					{commandes.map((commande) => (
						<tr
							key={commande.id}
							className="relative border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3">
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
							</td>
							<td className="px-4 py-3 text-foreground">
								{`${commande.client_nom} ${commande.client_prenoms}`.trim()}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateHeureISO(commande.date_depot)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{commande.date_retrait_prevue ?? "—"}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(commande.montant_total)}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(commande.acompte)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatMontantFCFA(commande.reste_a_payer)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										PRESSING_STATUT_BADGE[commande.statut],
									)}
								>
									{PRESSING_STATUT_LABELS[commande.statut]}
								</span>
							</td>
							<td className="relative z-10 px-4 py-3">
								<CommandeActions
									commande={commande}
									canModifier={canModifier}
									canCreer={canCreer}
									canFinancesVoir={canFinancesVoir}
									onEdit={onEdit}
									onTraitement={onTraitement}
									onPret={onPret}
									onRetirer={onRetirer}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
