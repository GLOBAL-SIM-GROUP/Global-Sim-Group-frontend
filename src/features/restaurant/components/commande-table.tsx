import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import {
	COMMANDE_STATUT_LABELS,
	type CommandeRestaurant,
	type CommandeRestaurantStatut,
	TYPE_COMMANDE_LABELS,
} from "../models/commandes";
import { CommandeActions } from "./commande-actions";

const COMMANDE_STATUT_BADGE: Record<CommandeRestaurantStatut, string> = {
	EN_COURS: "bg-[#2980B9] text-white",
	EN_PREPARATION: "bg-[#E67E22] text-white",
	SERVIE: "bg-[#27AE60] text-white",
	PAYEE: "bg-[#95A5A6] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

interface CommandeTableProps {
	commandes: CommandeRestaurant[];
	clients: ReadonlyMap<string, string>;
	canModifier: boolean;
	canSupprimer: boolean;
	onVoirFacture: (commande: CommandeRestaurant) => void;
	onStatut: (
		commande: CommandeRestaurant,
		statut: CommandeRestaurant["statut"],
	) => void;
	onAnnuler: (commande: CommandeRestaurant) => void;
}

/** Tableau des commandes restaurant (M5). Le client est résolu par la page. */
export function CommandeTable({
	commandes,
	clients,
	canModifier,
	canSupprimer,
	onVoirFacture,
	onStatut,
	onAnnuler,
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
							DATE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TYPE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TOTAL
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
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3 font-semibold text-foreground">
								{commande.id}
							</td>
							<td className="px-4 py-3 text-foreground">
								{commande.id_client
									? (clients.get(commande.id_client) ?? "…")
									: "—"}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateHeureISO(commande.date)}
							</td>
							<td className="px-4 py-3 text-foreground">
								{TYPE_COMMANDE_LABELS[commande.type]}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(commande.total)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										COMMANDE_STATUT_BADGE[commande.statut],
									)}
								>
									{COMMANDE_STATUT_LABELS[commande.statut]}
								</span>
							</td>
							<td className="px-4 py-3">
								<CommandeActions
									commande={commande}
									canModifier={canModifier}
									canSupprimer={canSupprimer}
									onVoirFacture={onVoirFacture}
									onStatut={onStatut}
									onAnnuler={onAnnuler}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
