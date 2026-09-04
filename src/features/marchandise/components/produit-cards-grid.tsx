import { Image as ImageIcon } from "lucide-react";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import type {
	CategorieProduit,
	Fournisseur,
	Produit,
} from "../models/produits";
import { estEnAlerte, estEpuise } from "../models/produits";
import { ProduitActions } from "./produit-actions";

interface ProduitCardsGridProps {
	produits: Produit[];
	categories: CategorieProduit[];
	fournisseurs: Fournisseur[];
	onEdit: (produit: Produit) => void;
	onCodeBarre: (produit: Produit) => void;
}

/**
 * Grille de cartes du catalogue produits (M3). Affiche chaque produit en carte
 * avec image, référence, catégorie, prix, stock coloré, seuil et fournisseur.
 */
export function ProduitCardsGrid({
	produits,
	categories,
	fournisseurs,
	onEdit,
	onCodeBarre,
}: ProduitCardsGridProps) {
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
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{produits.map((produit) => {
				const enAlerte = estEnAlerte(produit);
				const epuise = estEpuise(produit);
				const inactif = !produit.actif;

				return (
					<div
						key={produit.id}
						className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
					>
						<ProduitImageDisplay
							imageKey={produit.image_url}
							nomProduit={produit.nom}
							inactif={inactif}
						/>

						<div className="space-y-3 p-4">
							<div>
								<p className="text-xs font-mono text-muted-foreground">
									{produit.reference}
								</p>
								<h3 className="font-semibold text-foreground line-clamp-2">
									{produit.nom}
								</h3>
								<p className="text-xs text-muted-foreground">
									{categorieParId.get(produit.id_categorie_produit ?? "") ??
										"—"}
								</p>
							</div>

							<div className="space-y-2 border-t border-border pt-3">
								<div className="flex items-baseline justify-between gap-2">
									<span className="text-xs text-muted-foreground">Achat</span>
									<p className="text-sm font-semibold text-foreground">
										{formatMontantFCFA(produit.prix_achat)}
									</p>
								</div>
								<div className="flex items-baseline justify-between gap-2">
									<span className="text-xs text-muted-foreground">Vente</span>
									<p className="text-lg font-bold text-primary">
										{formatMontantFCFA(produit.prix_vente)}
									</p>
								</div>
							</div>

							<div className="space-y-2 border-t border-border pt-3">
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs text-muted-foreground">Stock</span>
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
											epuise
												? "bg-red-500 text-white"
												: enAlerte
													? "bg-amber-500 text-white"
													: "bg-green-500 text-white",
										)}
									>
										{produit.quantite_stock}
									</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs text-muted-foreground">Seuil</span>
									<span className="text-xs font-medium text-foreground">
										{produit.seuil_alerte}
									</span>
								</div>
								{fournisseurParId.get(produit.id_fournisseur ?? "") && (
									<div className="flex items-center justify-between gap-2">
										<span className="text-xs text-muted-foreground">
											Fournisseur
										</span>
										<span className="text-xs font-medium text-foreground">
											{fournisseurParId.get(produit.id_fournisseur ?? "")}
										</span>
									</div>
								)}
							</div>

							<div className="flex items-center justify-end gap-1 border-t border-border pt-3">
								<ProduitActions
									produit={produit}
									onEdit={onEdit}
									onCodeBarre={onCodeBarre}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/** Composant pour afficher une image de produit avec authentification */
function ProduitImageDisplay({
	imageKey,
	nomProduit,
	inactif,
}: {
	imageKey: string | null | undefined;
	nomProduit: string;
	inactif: boolean;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(imageKey);

	return (
		<div className="relative h-48 w-full overflow-hidden bg-muted">
			{isLoading ? (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sea-ink/10 to-lagoon/10">
					<div className="text-xs text-muted-foreground">Chargement…</div>
				</div>
			) : blobUrl ? (
				<img
					src={blobUrl}
					alt={nomProduit}
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sea-ink/10 to-lagoon/10">
					<ImageIcon className="size-12 text-muted-foreground/50" aria-hidden />
				</div>
			)}
			{inactif && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
					<span className="text-sm font-semibold text-white">Inactif</span>
				</div>
			)}
		</div>
	);
}
