import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tabs, Toast } from "radix-ui";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { produitImagePublicUrl } from "#/core/api/uploads";
import {
	listCategoriesProduits,
	listProduits,
} from "#/features/marchandise/api/produits";
import {
	estEpuise,
	type Produit,
} from "#/features/marchandise/models/produits";

import { usePanierArticles } from "../hooks/use-panier-articles";
import { CLE_PANIER_BOUTIQUE } from "../models/panier-articles";
import { PanierBar } from "./panier-bar";
import { ProduitCarte } from "./produit-carte";

const TOUTES_CATEGORIES = "tous";

function imageDuProduit(produit: Produit): string | null {
	return produit.image_url ? produitImagePublicUrl(produit.id) : null;
}

export function BoutiquePage() {
	const produitsQuery = useQuery({
		queryKey: ["espace-client", "boutique", "produits"],
		queryFn: () => listProduits(),
	});
	const categoriesQuery = useQuery({
		queryKey: ["espace-client", "boutique", "categories"],
		queryFn: () => listCategoriesProduits(),
	});
	const [categorieActive, setCategorieActive] = useState(TOUTES_CATEGORIES);
	const [toast, setToast] = useState<{ id: number; message: string } | null>(
		null,
	);
	// Panier indépendant de celui du restaurant (clé de stockage dédiée) :
	// pas de panier partagé entre services.
	const panier = usePanierArticles(CLE_PANIER_BOUTIQUE);

	const produitsActifs = useMemo(
		() =>
			(produitsQuery.data ?? []).filter(
				(produit) => produit.actif && !estEpuise(produit),
			),
		[produitsQuery.data],
	);
	const produitsAffiches = useMemo(
		() =>
			categorieActive === TOUTES_CATEGORIES
				? produitsActifs
				: produitsActifs.filter(
						(produit) => produit.id_categorie_produit === categorieActive,
					),
		[produitsActifs, categorieActive],
	);

	const quantiteDe = (produitId: string) =>
		panier.lignes.find((ligne) => ligne.id === produitId)?.quantite ?? 0;

	const ajouterAuPanier = (produit: Produit) => {
		panier.ajouter(
			{ id: produit.id, nom: produit.nom, prix: produit.prix_vente },
			imageDuProduit(produit),
		);
		setToast({ id: Date.now(), message: `${produit.nom} ajouté au panier` });
	};

	if (produitsQuery.isLoading) {
		return (
			<div className="flex justify-center py-24">
				<Loader2 className="size-8 animate-spin text-lagoon" aria-hidden />
			</div>
		);
	}

	if (produitsQuery.error) {
		return (
			<div className="flex flex-col items-center gap-4 py-24 text-center">
				<AlertCircle className="size-8 text-destructive" aria-hidden />
				<p className="text-muted-foreground">
					Impossible de charger la boutique pour le moment.
				</p>
			</div>
		);
	}

	return (
		<Toast.Provider swipeDirection="right" duration={2500}>
			<div className="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-28 sm:px-6 lg:px-8">
				<Breadcrumb
					items={[
						{ label: "Espace client", to: "/espace-client" },
						{ label: "Boutique" },
					]}
				/>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Boutique</h1>
					<p className="text-sm text-muted-foreground">
						Parcourez le catalogue et composez votre commande.
					</p>
				</div>

				<Tabs.Root value={categorieActive} onValueChange={setCategorieActive}>
					<Tabs.List
						aria-label="Catégories"
						className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						<Tabs.Trigger
							value={TOUTES_CATEGORIES}
							className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none data-[state=active]:border-lagoon data-[state=active]:bg-lagoon data-[state=active]:text-white"
						>
							Tous
						</Tabs.Trigger>
						{(categoriesQuery.data ?? []).map((categorie) => (
							<Tabs.Trigger
								key={categorie.id}
								value={categorie.id}
								className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none data-[state=active]:border-lagoon data-[state=active]:bg-lagoon data-[state=active]:text-white"
							>
								{categorie.libelle}
							</Tabs.Trigger>
						))}
					</Tabs.List>
				</Tabs.Root>

				{produitsAffiches.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						Aucun produit disponible dans cette catégorie.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{produitsAffiches.map((produit) => (
							<ProduitCarte
								key={produit.id}
								produit={produit}
								imageUrl={imageDuProduit(produit)}
								quantiteAuPanier={quantiteDe(produit.id)}
								onAjouter={() => ajouterAuPanier(produit)}
								onRetirer={() =>
									panier.definirQuantite(produit.id, quantiteDe(produit.id) - 1)
								}
							/>
						))}
					</div>
				)}

				<PanierBar
					nombreArticles={panier.nombreArticles}
					total={panier.total}
				/>
			</div>

			{toast ? (
				<Toast.Root
					key={toast.id}
					className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
					onOpenChange={(open) => {
						if (!open) setToast(null);
					}}
				>
					<Toast.Description className="text-sm font-medium text-foreground">
						{toast.message}
					</Toast.Description>
				</Toast.Root>
			) : null}
			<Toast.Viewport className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0" />
		</Toast.Provider>
	);
}
