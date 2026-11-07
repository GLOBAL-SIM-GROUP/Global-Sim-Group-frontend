import { Scale } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { formatDateHeureUTC } from "#/features/residence/models/format";
import {
	MOUVEMENT_TYPE_LABELS,
	MOUVEMENT_TYPE_VARIANT,
	type Mouvement,
} from "../models/mouvements";
import type { Produit } from "../models/produits";

interface MouvementTableProps {
	mouvements: Mouvement[];
	/** Nom du fournisseur par référence produit (`null` si sans fournisseur). */
	fournisseursParReference: ReadonlyMap<string, string | null>;
	/**
	 * Produit courant par référence + callback d'écrasement du stock. Fournir
	 * les deux ajoute une colonne ACTIONS « Corriger le stock » (réservée
	 * `MARCHANDISE.CORRIGER_STOCK` — la page ne les passe que si le compte a
	 * le verbe).
	 */
	produitParReference?: ReadonlyMap<string, Produit>;
	onCorrigerStock?: (produit: Produit) => void;
}

/**
 * Tableau de l'historique des mouvements de stock (M3). L'historique expose
 * référence, nom, date, type, quantité, delta et stock résultant (pas de
 * motif/document ni de fournisseur dans la réponse — résolu via le
 * catalogue produits côté page).
 */
export function MouvementTable({
	mouvements,
	fournisseursParReference,
	produitParReference,
	onCorrigerStock,
}: MouvementTableProps) {
	if (mouvements.length === 0) {
		return <EmptyState title="Aucun mouvement trouvé." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>DATE</Th>
						<Th>PRODUIT</Th>
						<Th>FOURNISSEUR</Th>
						<Th>TYPE</Th>
						<Th>QUANTITÉ</Th>
						<Th>STOCK RÉSULTANT</Th>
						{onCorrigerStock ? <Th className="text-right">ACTIONS</Th> : null}
					</tr>
				</DataTableHead>
				<tbody>
					{mouvements.map((mouvement) => (
						<Tr
							key={`${mouvement.reference}-${mouvement.date}-${mouvement.delta}-${mouvement.stock_resultant}`}
						>
							<Td className="text-muted-foreground">
								{formatDateHeureUTC(mouvement.date)}
							</Td>
							<Td className="text-foreground">
								<span className="font-medium">{mouvement.reference}</span> —{" "}
								{mouvement.nom}
							</Td>
							<Td className="text-muted-foreground">
								{fournisseursParReference.get(mouvement.reference) ?? "—"}
							</Td>
							<Td>
								<Badge variant={MOUVEMENT_TYPE_VARIANT[mouvement.type]}>
									{MOUVEMENT_TYPE_LABELS[mouvement.type]}
								</Badge>
							</Td>
							<Td className="text-foreground">
								{mouvement.quantite_mouvement}
							</Td>
							<Td className="text-foreground">
								{mouvement.stock_resultant ?? "—"}
							</Td>
							{onCorrigerStock ? (
								<Td>
									<div className="flex justify-end">
										<Button
											variant="ghost"
											size="icon-sm"
											title="Corriger le stock"
											disabled={!produitParReference?.has(mouvement.reference)}
											onClick={() => {
												const cible = produitParReference?.get(
													mouvement.reference,
												);
												if (cible) onCorrigerStock(cible);
											}}
										>
											<Scale className="size-4" aria-hidden />
											<span className="sr-only">Corriger le stock</span>
										</Button>
									</div>
								</Td>
							) : null}
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
