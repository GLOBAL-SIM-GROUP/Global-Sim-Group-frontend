import { Link } from "@tanstack/react-router";

import { cn } from "#/lib/utils";

import {
	CONTRAT_STATUT_LABELS,
	type ContratJoin,
	type ContratStatut,
} from "../models/contrats";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { ContratActions } from "./contrat-actions";

const CONTRAT_STATUT_BADGE: Record<ContratStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	ACTIF: "bg-[#27AE60] text-white",
	EXPIRE: "bg-[#95A5A6] text-white",
	RESILIE: "bg-[#E74C3C] text-white",
	TERMINE: "bg-[#2980B9] text-white",
};

interface ContratTableProps {
	contrats: ContratJoin[];
	onActiver?: (contrat: ContratJoin) => void;
}

/**
 * Tableau des contrats de location (même gabarit que les autres tableaux
 * Résidence : en-têtes navy `bg-sea-ink`).
 */
export function ContratTable({ contrats, onActiver }: ContratTableProps) {
	if (contrats.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun contrat trouvé.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							NUMÉRO CONTRAT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							LOCATAIRE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							LOGEMENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE DÉBUT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE FIN
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							LOYER
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
					{contrats.map((contrat) => (
						<tr
							key={contrat.id}
							className="relative border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3">
								{/* Toute la ligne est cliquable (stretched link) vers la fiche
								    contrat ; la cellule ACTIONS repasse au-dessus (z-10). */}
								<Link
									to="/residence/contrats/$id"
									params={{ id: contrat.id }}
									title={`Voir la fiche du contrat ${contrat.numero_contrat}`}
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{contrat.numero_contrat}
								</Link>
							</td>
							<td className="px-4 py-3 text-foreground">{contrat.clientNom}</td>
							<td className="px-4 py-3 text-foreground">
								{contrat.logementNumero}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateISO(contrat.date_debut)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateISO(contrat.date_fin_prevue)}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(contrat.montant_loyer)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										CONTRAT_STATUT_BADGE[contrat.statut],
									)}
								>
									{CONTRAT_STATUT_LABELS[contrat.statut]}
								</span>
							</td>
							<td className="relative z-10 px-4 py-3">
								<ContratActions contrat={contrat} onActiver={onActiver} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
