import { formatDateHeureISO } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import {
	MOUVEMENT_TYPE_LABELS,
	type Mouvement,
	type MouvementType,
} from "../models/mouvements";

const MOUVEMENT_TYPE_BADGE: Record<MouvementType, string> = {
	ENTREE: "bg-[#27AE60] text-white",
	SORTIE: "bg-[#E74C3C] text-white",
	AJUSTEMENT: "bg-[#E67E22] text-white",
};

interface MouvementTableProps {
	mouvements: Mouvement[];
}

/**
 * Tableau de l'historique des mouvements de stock (M3). L'historique expose
 * référence, nom, date, type, quantité, delta et stock résultant (pas de
 * motif/document dans la réponse).
 */
export function MouvementTable({ mouvements }: MouvementTableProps) {
	if (mouvements.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun mouvement trouvé.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							DATE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							PRODUIT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							TYPE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							QUANTITÉ
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							STOCK RÉSULTANT
						</th>
					</tr>
				</thead>
				<tbody>
					{mouvements.map((mouvement) => (
						<tr
							key={`${mouvement.reference}-${mouvement.date}-${mouvement.delta}-${mouvement.stock_resultant}`}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDateHeureISO(mouvement.date)}
							</td>
							<td className="px-4 py-3 text-foreground">
								<span className="font-medium">{mouvement.reference}</span> —{" "}
								{mouvement.nom}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										MOUVEMENT_TYPE_BADGE[mouvement.type],
									)}
								>
									{MOUVEMENT_TYPE_LABELS[mouvement.type]}
								</span>
							</td>
							<td className="px-4 py-3 text-foreground">
								{mouvement.quantite_mouvement}
							</td>
							<td className="px-4 py-3 text-foreground">
								{mouvement.stock_resultant}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
