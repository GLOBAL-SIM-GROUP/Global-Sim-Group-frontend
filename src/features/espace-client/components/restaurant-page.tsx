import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tabs, Toast } from "radix-ui";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { platImagePublicUrl } from "#/core/api/uploads";
import {
	listCategoriesPlats,
	listPlats,
} from "#/features/restaurant/api/plats";
import type { Plat } from "#/features/restaurant/models/plats";

import { usePanier } from "../hooks/use-panier";
import { PanierBar } from "./panier-bar";
import { PlatCarte } from "./plat-carte";

const TOUTES_CATEGORIES = "tous";

function imageDuPlat(plat: Plat): string | null {
	return plat.image_url ? platImagePublicUrl(plat.id) : null;
}

export function RestaurantPage() {
	const platsQuery = useQuery({
		queryKey: ["espace-client", "restaurant", "plats"],
		queryFn: () => listPlats(),
	});
	const categoriesQuery = useQuery({
		queryKey: ["espace-client", "restaurant", "categories"],
		queryFn: () => listCategoriesPlats(),
	});
	const [categorieActive, setCategorieActive] = useState(TOUTES_CATEGORIES);
	const [toast, setToast] = useState<{ id: number; message: string } | null>(
		null,
	);
	const panier = usePanier();

	const platsDisponibles = useMemo(
		() => (platsQuery.data ?? []).filter((plat) => plat.disponible),
		[platsQuery.data],
	);
	const platsAffiches = useMemo(
		() =>
			categorieActive === TOUTES_CATEGORIES
				? platsDisponibles
				: platsDisponibles.filter(
						(plat) => plat.id_categorie_plat === categorieActive,
					),
		[platsDisponibles, categorieActive],
	);

	const quantiteDe = (platId: string) =>
		panier.lignes.find((ligne) => ligne.platId === platId)?.quantite ?? 0;

	const ajouterAuPanier = (plat: Plat) => {
		panier.ajouter(plat, imageDuPlat(plat));
		setToast({ id: Date.now(), message: `${plat.nom} ajouté au panier` });
	};

	if (platsQuery.isLoading) {
		return (
			<div className="flex justify-center py-24">
				<Loader2 className="size-8 animate-spin text-lagoon" aria-hidden />
			</div>
		);
	}

	if (platsQuery.error) {
		return (
			<div className="flex flex-col items-center gap-4 py-24 text-center">
				<AlertCircle className="size-8 text-destructive" aria-hidden />
				<p className="text-muted-foreground">
					Impossible de charger le menu pour le moment.
				</p>
			</div>
		);
	}

	return (
		<Toast.Provider swipeDirection="right" duration={2500}>
			<div className="w-full space-y-6 pt-6 pb-28">
				<Breadcrumb
					items={[
						{ label: "Espace client", to: "/espace-client" },
						{ label: "Restaurant" },
					]}
				/>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Restaurant</h1>
					<p className="text-sm text-muted-foreground">
						Parcourez la carte et composez votre commande.
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

				{platsAffiches.length === 0 ? (
					<p className="py-12 text-center text-muted-foreground">
						Aucun plat disponible dans cette catégorie.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{platsAffiches.map((plat) => (
							<PlatCarte
								key={plat.id}
								plat={plat}
								imageUrl={imageDuPlat(plat)}
								quantiteAuPanier={quantiteDe(plat.id)}
								onAjouter={() => ajouterAuPanier(plat)}
								onRetirer={() =>
									panier.definirQuantite(plat.id, quantiteDe(plat.id) - 1)
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
