import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import type {
	CategorieProduit,
	Fournisseur,
	Produit,
} from "../models/produits";
import { ProduitActions } from "./produit-actions";

interface ProduitTableProps {
	produits: Produit[];
	categories: CategorieProduit[];
	fournisseurs: Fournisseur[];
	onEdit: (produit: Produit) => void;
	onCodeBarre: (produit: Produit) => void;
}

/**
 * Tableau du catalogue produits (M3). Les catégories et fournisseurs sont
 * résolus depuis les listers (le catalogue ne porte que leurs ids).
 */
export function ProduitTable({
	produits,
	categories,
	fournisseurs,
	onEdit,
	onCodeBarre,
}: ProduitTableProps) {
	if (produits.length === 0) {
		return (
			<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
				Aucun produit trouvé.
			</div>
		);
	}

	const categorieParId = new Map(categories.map((c) => [c.id, c.libelle]));
	const fournisseurParId = new Map(fournisseurs.map((f) => [f.id, f.nom]));

	return (
		<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead className="bg-sea-ink text-left text-white">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">
							RÉFÉRENCE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							NOM
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							CATÉGORIE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							PRIX ACHAT
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							PRIX VENTE
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							STOCK
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							SEUIL
						</th>
						<th scope="col" className="px-4 py-3 font-medium">
							FOURNISSEUR
						</th>
						<th scope="col" className="px-4 py-3 text-right font-medium">
							ACTIONS
						</th>
					</tr>
				</thead>
				<tbody>
					{produits.map((produit) => (
						<tr
							key={produit.id}
							className="border-t border-border transition-colors hover:bg-accent/40"
						>
							<td className="px-4 py-3 font-semibold text-foreground">
								{produit.reference}
							</td>
							<td className="px-4 py-3 text-foreground">{produit.nom}</td>
							<td className="px-4 py-3 text-muted-foreground">
								{categorieParId.get(produit.id_categorie_produit ?? "") ?? "—"}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(produit.prix_achat)}
							</td>
							<td className="px-4 py-3 text-foreground">
								{formatMontantFCFA(produit.prix_vente)}
							</td>
							<td className="px-4 py-3">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										Number(produit.quantite_stock) <= 0
											? "bg-[#E74C3C] text-white"
											: Number(produit.quantite_stock) <
													Number(produit.seuil_alerte)
												? "bg-[#E67E22] text-white"
												: "bg-[#27AE60] text-white",
									)}
								>
									{produit.quantite_stock}
								</span>
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{produit.seuil_alerte}
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{fournisseurParId.get(produit.id_fournisseur ?? "") ?? "—"}
							</td>
							<td className="px-4 py-3">
								<ProduitActions
									produit={produit}
									onEdit={onEdit}
									onCodeBarre={onCodeBarre}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
