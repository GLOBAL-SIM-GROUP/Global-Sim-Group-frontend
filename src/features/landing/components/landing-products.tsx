import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { AccordionGallery } from "#/components/accordion-gallery";
import { AnimatedContent } from "#/components/animated-content";
import { SplitText } from "#/components/split-text";
import { produitImagePublicUrl } from "#/core/api/uploads";
import { listProduits } from "#/features/marchandise/api/produits";

export function LandingProducts() {
	const {
		data: produits,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["market", "produits", "public"],
		queryFn: () => listProduits(),
	});

	const produitsActifs = produits?.filter((p) => p.actif) ?? [];

	if (isLoading) {
		return (
			<section
				id="boutique"
				className="scroll-mt-16 bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Boutique
						</h2>
						<p className="text-lg text-muted-foreground">
							Découvrez nos produits disponibles
						</p>
					</div>
					<div className="flex justify-center py-12">
						<Loader2 className="size-8 animate-spin text-lagoon" />
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section
				id="boutique"
				className="scroll-mt-16 bg-destructive/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Boutique
						</h2>
					</div>
					<div className="flex flex-col items-center justify-center gap-4 py-8">
						<AlertCircle className="size-8 text-destructive" />
						<p className="text-center text-muted-foreground">
							Erreur lors du chargement des produits
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			id="boutique"
			className="scroll-mt-16 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
		>
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 space-y-4 text-center">
					<SplitText
						tag="h2"
						text="La boutique"
						className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
						splitType="words"
						delay={60}
						duration={0.6}
					/>
					<p className="text-lg text-muted-foreground">
						Un aperçu des articles disponibles
					</p>
				</div>

				{produitsActifs.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							Aucun produit disponible pour le moment.
						</p>
					</div>
				) : (
					<AnimatedContent distance={60} threshold={0.15}>
						<AccordionGallery
							items={produitsActifs.slice(0, 6).map((produit) => ({
								image: produit.image_url
									? produitImagePublicUrl(produit.id)
									: null,
								label: produit.nom,
								link: "/marchandise/produits",
								alt: produit.nom,
							}))}
							defaultIndex={0}
							accentColor="#E67E22"
							overlayColor="#1A2B4C"
							height={420}
							radius={12}
						/>
					</AnimatedContent>
				)}
			</div>
		</section>
	);
}
