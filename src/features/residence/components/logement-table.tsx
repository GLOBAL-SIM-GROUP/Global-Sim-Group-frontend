import { Link } from "@tanstack/react-router";

import { cn } from "#/lib/utils";

import {
	formatTarifFCFA,
	LOGEMENT_STATUT_LABELS,
	LOGEMENT_TYPE_LABELS,
	type Logement,
	type LogementStatut,
	OCCUPATION_LABELS,
} from "../models/logements";
import { LogementActions } from "./logement-actions";

/** Couleurs de badge par statut (teintes distinctes, texte blanc). */
const STATUT_BADGE: Record<LogementStatut, string> = {
	DISPONIBLE: "bg-[#27AE60] text-white",
	RESERVE: "bg-[#E67E22] text-white",
	OCCUPE: "bg-[#2980B9] text-white",
	EN_NETTOYAGE: "bg-[#1ABC9C] text-white",
	EN_MAINTENANCE: "bg-[#E74C3C] text-white",
	INDISPONIBLE: "bg-[#95A5A6] text-white",
};

interface LogementTableProps {
	logements: Logement[];
	onEdit: (logement: Logement) => void;
}

/**
 * Tableau des logements du bâtiment courant (HTML sémantique — même gabarit
 * que le tableau des bâtiments : en-têtes navy `bg-sea-ink`).
 */
export function LogementTable({ logements, onEdit }: LogementTableProps) {
	if (logements.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun logement trouvé.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							NUMÉRO
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TYPE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							STATUT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TARIF
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							OCCUPATION ACTUELLE
						</th>
						<th scope="col" className="px-4 py-3 text-right font-medium">
							ACTIONS
						</th>
					</tr>
				</thead>
				<tbody>
					{logements.map((logement) => (
						<tr
							key={logement.id}
							className="relative border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3">
								{/* Toute la ligne est cliquable (stretched link) : le lien du
								    numéro couvre le <tr> via `after:inset-0` (le <tr> est
								    `relative`). La cellule ACTIONS repasse au-dessus
								    (`relative z-10`) pour garder les boutons fonctionnels. */}
								<Link
									to="/residence/logements/$id"
									params={{ id: logement.id }}
									title={`Voir la fiche du logement ${logement.numero}`}
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{logement.numero}
								</Link>
							</td>
							<td className="px-4 py-3 text-foreground">
								{LOGEMENT_TYPE_LABELS[logement.type]}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										STATUT_BADGE[logement.statut],
									)}
								>
									{LOGEMENT_STATUT_LABELS[logement.statut]}
								</span>
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatTarifFCFA(logement.tarif)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{OCCUPATION_LABELS[logement.statut]}
							</td>
							<td className="relative z-10 px-4 py-3">
								<LogementActions logement={logement} onEdit={onEdit} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
