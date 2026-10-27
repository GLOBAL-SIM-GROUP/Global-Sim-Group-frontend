import { Badge } from "#/components/ui/badge";
import { EmptyState } from "#/components/ui/empty-state";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { formatMontantFCFA } from "#/features/residence/models/format";
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

/** Variante `<Badge>` du stock : rupture, sous le seuil, ou normal. */
function stockVariant(produit: Produit): "danger" | "warning" | "success" {
	if (Number(produit.quantite_stock) <= 0) return "danger";
	if (Number(produit.quantite_stock) < Number(produit.seuil_alerte)) {
		return "warning";
	}
	return "success";
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
		return <EmptyState title="Aucun produit trouvé." />;
	}

	const categorieParId = new Map(categories.map((c) => [c.id, c.libelle]));
	const fournisseurParId = new Map(fournisseurs.map((f) => [f.id, f.nom]));

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>RÉFÉRENCE</Th>
						<Th>NOM</Th>
						<Th>CATÉGORIE</Th>
						<Th>PRIX ACHAT</Th>
						<Th>PRIX VENTE</Th>
						<Th>STOCK</Th>
						<Th>SEUIL</Th>
						<Th>FOURNISSEUR</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{produits.map((produit) => (
						<Tr key={produit.id}>
							<Td className="font-semibold text-foreground">
								{produit.reference}
							</Td>
							<Td className="text-foreground">{produit.nom}</Td>
							<Td className="text-muted-foreground">
								{categorieParId.get(produit.id_categorie_produit ?? "") ?? "—"}
							</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(produit.prix_achat)}
							</Td>
							<Td className="text-foreground">
								{formatMontantFCFA(produit.prix_vente)}
							</Td>
							<Td>
								<Badge variant={stockVariant(produit)}>
									{produit.quantite_stock}
								</Badge>
							</Td>
							<Td className="text-muted-foreground">{produit.seuil_alerte}</Td>
							<Td className="text-muted-foreground">
								{fournisseurParId.get(produit.id_fournisseur ?? "") ?? "—"}
							</Td>
							<Td>
								<ProduitActions
									produit={produit}
									onEdit={onEdit}
									onCodeBarre={onCodeBarre}
								/>
							</Td>
						</Tr>
					))}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
