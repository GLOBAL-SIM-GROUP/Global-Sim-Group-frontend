import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

import { formatDateHeureISO, formatMontantFCFA } from "../models/format";
import {
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type Sejour,
	type SejourStatut,
} from "../models/sejours";
import { SejourActions } from "./sejour-actions";

const SEJOUR_STATUT_BADGE: Record<SejourStatut, string> = {
	EN_COURS: "bg-[#2980B9] text-white",
	TERMINE: "bg-[#27AE60] text-white",
	ANNULE: "bg-[#95A5A6] text-white",
};

interface SejourTableProps {
	sejours: Sejour[];
	onEdit: (sejour: Sejour) => void;
	onPayer: (sejour: Sejour) => void;
}

/**
 * Tableau des séjours courts (M2.3). Toute la ligne est cliquable (stretched
 * link) vers la fiche ; la cellule ACTIONS repasse au-dessus (z-10).
 */
export function SejourTable({ sejours, onEdit, onPayer }: SejourTableProps) {
	if (sejours.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun séjour trouvé.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							CLIENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TYPE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							LOGEMENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							ARRIVÉE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DÉPART
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							STATUT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							MONTANT TOTAL
						</th>
						<th scope="col" className="px-4 py-3 text-right font-medium">
							ACTIONS
						</th>
					</tr>
				</thead>
				<tbody>
					{sejours.map((sejour) => (
						<tr
							key={sejour.id}
							className="relative border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3">
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
							</td>
							<td className="px-4 py-3 text-foreground">
								{SEJOUR_TYPE_LABELS[sejour.type_prestation]}
							</td>
							<td className="px-4 py-3 text-foreground">
								{sejour.numero_logement}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateHeureISO(sejour.date_heure_arrivee)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateHeureISO(sejour.date_heure_depart_prevue)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										SEJOUR_STATUT_BADGE[sejour.statut],
									)}
								>
									{SEJOUR_STATUT_LABELS[sejour.statut]}
								</span>
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(sejour.montant_total)}
							</td>
							<td className="relative z-10 px-4 py-3">
								<SejourActions
									sejour={sejour}
									onEdit={onEdit}
									onPayer={onPayer}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
