import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import {
	VENTE_STATUT_LABELS,
	type VenteJoin,
	type VenteStatut,
} from "../models/ventes";
import { VenteActions } from "./vente-actions";

const VENTE_STATUT_BADGE: Record<VenteStatut, string> = {
	EN_COURS: "bg-[#E67E22] text-white",
	PAYEE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#95A5A6] text-white",
};

interface VenteTableProps {
	ventes: VenteJoin[];
	onVoirFacture: (vente: VenteJoin) => void;
	onAnnuler: (vente: VenteJoin) => void;
}

/** Tableau de l'historique des ventes (M3). */
export function VenteTable({
	ventes,
	onVoirFacture,
	onAnnuler,
}: VenteTableProps) {
	if (ventes.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucune vente trouvée.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							N° FACTURE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							CLIENT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TOTAL
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							REMISE
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
					{ventes.map((vente) => (
						<tr
							key={vente.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3 font-semibold text-foreground">
								{vente.id}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateHeureISO(vente.date)}
							</td>
							<td className="px-4 py-3 text-foreground">{vente.clientNom}</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(vente.total)}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatMontantFCFA(vente.remise)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										VENTE_STATUT_BADGE[vente.statut],
									)}
								>
									{VENTE_STATUT_LABELS[vente.statut]}
								</span>
							</td>
							<td className="px-4 py-3">
								<VenteActions
									vente={vente}
									onVoirFacture={onVoirFacture}
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
