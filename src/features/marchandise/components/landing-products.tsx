import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { listProduits } from "../api/produits";

export function LandingProducts() {
	const { data: produits = [], isLoading, isError } = useQuery({
		queryKey: ["market", "produits", "public"],
		queryFn: () => listProduits(),
	});

	// Limiter à 6 produits pour la landing
	const displayedProduits = produits.slice(0, 6);

	return (
		<section id="boutique" className="py-20 sm:py-32 bg-background">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						Boutique
					</h2>
					<p className="text-lg text-muted-foreground">
						Découvrez nos produits de qualité à prix compétitifs
					</p>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
								<div className="aspect-square bg-muted rounded-lg mb-4" />
								<div className="h-4 bg-muted rounded mb-2" />
								<div className="h-4 bg-muted rounded w-2/3" />
							</div>
						))}
					</div>
				) : isError ? (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<p className="text-sm text-destructive">
							Impossible de charger les produits. Veuillez réessayer plus tard.
						</p>
					</div>
				) : produits.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
							{displayedProduits.map((produit) => (
								<div
									key={produit.id}
									className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
								>
									{produit.image_url ? (
										<div className="aspect-square overflow-hidden bg-muted">
											<img
												src={produit.image_url}
												alt={produit.nom}
												className="h-full w-full object-cover hover:scale-105 transition-transform"
											/>
										</div>
									) : (
										<div className="aspect-square bg-muted flex items-center justify-center">
											<ShoppingCart className="h-8 w-8 text-muted-foreground" />
										</div>
									)}
									<div className="p-4">
										<h3 className="font-semibold text-foreground mb-1 line-clamp-2">
											{produit.nom}
										</h3>
										{produit.description && (
											<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
												{produit.description}
											</p>
										)}
										<div className="flex items-center justify-between">
											<span className="text-lg font-bold text-primary">
												{formatMontantFCFA(produit.prix_vente)}
											</span>
											<Button size="sm" asChild>
												<Link to="/login">Ajouter</Link>
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>

						{produits.length > 6 && (
							<div className="text-center">
								<Button size="lg" asChild>
									<Link to="/login">Voir tous les produits ({produits.length})</Link>
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
