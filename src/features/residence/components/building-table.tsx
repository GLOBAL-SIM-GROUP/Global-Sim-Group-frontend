import { Link } from "@tanstack/react-router";

import { cn } from "#/lib/utils";

import type { Batiment } from "../models/batiments";
import { BuildingActions } from "./building-actions";

interface BuildingTableProps {
	batiments: Batiment[];
	onToggle: (batiment: Batiment) => void;
	onEdit: (batiment: Batiment) => void;
	onDelete: (batiment: Batiment) => void;
}

/**
 * Tableau des bâtiments (HTML sémantique — pas de composant Table shadcn
 * installé). En-têtes en navy `bg-sea-ink`, badges de statut dédiés.
 */
export function BuildingTable({
	batiments,
	onToggle,
	onEdit,
	onDelete,
}: BuildingTableProps) {
	if (batiments.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun bâtiment trouvé.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							CODE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							NOM
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							ADRESSE
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
					{batiments.map((batiment) => (
						<tr
							key={batiment.id}
							className="relative border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3 font-semibold text-foreground">
								{batiment.code}
							</td>
							<td className="px-4 py-3">
								{/* Toute la ligne est cliquable : le lien (stretched) du nom
								    couvre le <tr> via `after:inset-0` (le <tr> est `relative`).
								    La cellule ACTIONS repasse au-dessus (`relative z-10`) pour
								    garder les boutons fonctionnels. */}
								<Link
									to="/residence/logements"
									search={{ batiment: batiment.id }}
									title={`Voir les logements de ${batiment.nom}`}
									className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
								>
									{batiment.nom}
								</Link>
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{batiment.adresse ?? "—"}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										batiment.actif
											? "bg-[#27AE60] text-white"
											: "bg-[#95A5A6] text-white",
									)}
								>
									{batiment.actif ? "Actif" : "Inactif"}
								</span>
							</td>
							<td className="relative z-10 px-4 py-3">
								<BuildingActions
									batiment={batiment}
									onToggle={onToggle}
									onEdit={onEdit}
									onDelete={onDelete}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
