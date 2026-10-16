import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, UtensilsCrossed } from "lucide-react";
import { Tabs, Toast } from "radix-ui";
import { useMemo, useState } from "react";

import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
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

/**
 * Carte du restaurant — catalogue des plats disponibles avec panier
 * persisté en `localStorage`. Partagée entre l'espace client
 * (`/espace-client/restaurant`) et le portail résident
 * (`/residence/portail/restaurant`) : `breadcrumb` et `panierTo` portent
 * les liens propres à l'espace ; `variant` fixe le conteneur (`p-6`
 * résident, `pt-6 pb-16` client) et décale la barre de panier au-dessus
 * de la tab bar mobile de l'espace client.
 */
export function RestaurantCataloguePage({
	breadcrumb,
	panierTo,
	variant,
}: {
	breadcrumb: { label: string; to?: string }[];
	panierTo: string;
	variant: "client" | "resident";
}) {
	const platsQuery = useQuery({
		queryKey: ["portail", "restaurant", "plats"],
		queryFn: () => listPlats(),
	});
	const categoriesQuery = useQuery({
		queryKey: ["portail", "restaurant", "categories"],
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
	// Onglets dérivés des plats disponibles : une catégorie dont tous les
	// plats sont indisponibles ne propose qu'un état vide — on ne la montre pas.
	const categoriesVisibles = useMemo(() => {
		const idsAvecDisponibles = new Set(
			platsDisponibles.map((plat) => plat.id_categorie_plat),
		);
		return (categoriesQuery.data ?? []).filter((categorie) =>
			idsAvecDisponibles.has(categorie.id),
		);
	}, [platsDisponibles, categoriesQuery.data]);
	// Onglet actif retombé sur « Tous » si sa catégorie n'a plus de plat
	// disponible (un plat passé indisponible entre deux refetches).
	const categorieCourante =
		categorieActive === TOUTES_CATEGORIES ||
		categoriesVisibles.some((categorie) => categorie.id === categorieActive)
			? categorieActive
			: TOUTES_CATEGORIES;
	const platsAffiches = useMemo(
		() =>
			categorieCourante === TOUTES_CATEGORIES
				? platsDisponibles
				: platsDisponibles.filter(
						(plat) => plat.id_categorie_plat === categorieCourante,
					),
		[platsDisponibles, categorieCourante],
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
			<div
				className={
					variant === "resident"
						? // `pb-28` dégage la `PanierBar` flottante (pas de tab
							// bar dans le shell résident).
							"w-full space-y-6 p-6 pb-28"
						: "w-full space-y-6 pt-6 pb-40 sm:pb-16"
				}
			>
				<PageHeader
					breadcrumb={breadcrumb}
					title="Restaurant"
					description="Parcourez la carte et composez votre commande."
				/>

				<Tabs.Root value={categorieCourante} onValueChange={setCategorieActive}>
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
						{categoriesVisibles.map((categorie) => (
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
					<EmptyState
						icon={UtensilsCrossed}
						title="Aucun plat disponible dans cette catégorie"
					/>
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
					panierTo={panierTo}
					auDessusTabBar={variant === "client"}
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
