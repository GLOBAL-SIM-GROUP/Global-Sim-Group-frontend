import { cn } from "#/lib/utils";

import {
	ABONNEMENT_STATUT_LABELS,
	ABONNEMENT_TYPE_LABELS,
	type Abonnement,
	type AbonnementStatut,
} from "../models/abonnements";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { AbonnementActions } from "./abonnement-actions";

const ABONNEMENT_STATUT_BADGE: Record<AbonnementStatut, string> = {
	ACTIF: "bg-[#27AE60] text-white",
	SUSPENDU: "bg-[#E67E22] text-white",
	RESILIE: "bg-[#E74C3C] text-white",
	EXPIRE: "bg-[#95A5A6] text-white",
};

interface AbonnementTableProps {
	abonnements: Abonnement[];
	onEdit: (abonnement: Abonnement) => void;
	onResilier: (abonnement: Abonnement) => void;
}

/**
 * Tableau des abonnements (M2.4). Le lister embarque déjà le nom du locataire
 * et le numéro de logement.
 */
export function AbonnementTable({
	abonnements,
	onEdit,
	onResilier,
}: AbonnementTableProps) {
	if (abonnements.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun abonnement trouvé.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							LOCATAIRE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							SERVICE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TYPE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							MONTANT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE DÉBUT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE FIN
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
					{abonnements.map((abonnement) => (
						<tr
							key={abonnement.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3 font-medium text-foreground">
								{`${abonnement.client_nom} ${abonnement.client_prenoms}`.trim()}
							</td>
							<td className="px-4 py-3 text-foreground">
								{abonnement.service}
							</td>
							<td className="px-4 py-3 text-foreground">
								{ABONNEMENT_TYPE_LABELS[abonnement.type]}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(abonnement.montant)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateISO(abonnement.date_debut)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateISO(abonnement.date_fin)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										ABONNEMENT_STATUT_BADGE[abonnement.statut],
									)}
								>
									{ABONNEMENT_STATUT_LABELS[abonnement.statut]}
								</span>
							</td>
							<td className="px-4 py-3">
								<AbonnementActions
									abonnement={abonnement}
									onEdit={onEdit}
									onResilier={onResilier}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
