import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CategoriePlat, Plat } from "#/features/restaurant/models/plats";

import { RestaurantCataloguePage } from "./restaurant-catalogue-page";

const plats: Plat[] = [
	{
		id: "1",
		nom: "Poulet braisé",
		id_categorie_plat: "cat-plats",
		prix: "3500",
		disponible: true,
		description: "Servi avec attiéké",
		image_url: null,
	},
	{
		id: "2",
		nom: "Jus de gingembre",
		id_categorie_plat: "cat-boissons",
		prix: "1000",
		disponible: true,
		description: null,
		image_url: null,
	},
	{
		id: "3",
		nom: "Plat épuisé",
		id_categorie_plat: "cat-plats",
		prix: "2000",
		disponible: false,
		description: null,
		image_url: null,
	},
	{
		id: "4",
		nom: "Dessert épuisé",
		id_categorie_plat: "cat-desserts",
		prix: "1500",
		disponible: false,
		description: null,
		image_url: null,
	},
];

const categories: CategoriePlat[] = [
	{ id: "cat-plats", libelle: "Plats" },
	{ id: "cat-boissons", libelle: "Boissons" },
	{ id: "cat-desserts", libelle: "Desserts" },
];

vi.mock("#/features/restaurant/api/plats", () => ({
	listPlats: () => Promise.resolve(plats),
	listCategoriesPlats: () => Promise.resolve(categories),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({
			to,
			children,
			...props
		}: {
			to: string;
			children?: React.ReactNode;
		}) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
	};
});

const PROPS = {
	breadcrumb: [{ label: "Restaurant" }],
	panierTo: "/espace-client/panier",
	variant: "client" as const,
};

function renderAvecQueryClient(ui: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
}

afterEach(() => {
	window.localStorage.clear();
});

describe("RestaurantCataloguePage", () => {
	it("affiche uniquement les plats disponibles", async () => {
		renderAvecQueryClient(<RestaurantCataloguePage {...PROPS} />);

		expect(await screen.findByText("Poulet braisé")).toBeInTheDocument();
		expect(screen.getByText("Jus de gingembre")).toBeInTheDocument();
		expect(screen.queryByText("Plat épuisé")).not.toBeInTheDocument();
		expect(screen.queryByText("Dessert épuisé")).not.toBeInTheDocument();
	});

	it("masque l'onglet d'une catégorie sans plat disponible", async () => {
		renderAvecQueryClient(<RestaurantCataloguePage {...PROPS} />);
		await screen.findByText("Poulet braisé");

		expect(screen.getByRole("tab", { name: "Plats" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Boissons" })).toBeInTheDocument();
		expect(
			screen.queryByRole("tab", { name: "Desserts" }),
		).not.toBeInTheDocument();
	});

	it("filtre par catégorie via les onglets", async () => {
		const user = userEvent.setup();
		renderAvecQueryClient(<RestaurantCataloguePage {...PROPS} />);
		await screen.findByText("Poulet braisé");

		await user.click(screen.getByRole("tab", { name: "Boissons" }));

		expect(screen.queryByText("Poulet braisé")).not.toBeInTheDocument();
		expect(screen.getByText("Jus de gingembre")).toBeInTheDocument();
	});

	it("ajoute un plat au panier et mène la barre vers la page panier de l'espace", async () => {
		const user = userEvent.setup();
		renderAvecQueryClient(<RestaurantCataloguePage {...PROPS} />);
		const carte = (await screen.findByText("Poulet braisé")).closest(
			"article",
		) as HTMLElement;

		// Le bouton panier ouvre la modale de quantité — on monte à 3 via le
		// stepper puis on confirme, sans clics répétés sur la carte.
		await user.click(within(carte).getByRole("button", { name: /ajouter/i }));
		const modale = await screen.findByRole("dialog");
		const plus = within(modale).getByRole("button", {
			name: /augmenter la quantité/i,
		});
		await user.click(plus);
		await user.click(plus);
		await user.click(
			within(modale).getByRole("button", { name: /ajouter au panier/i }),
		);

		await waitFor(() =>
			expect(
				screen.getByText(/3 articles · 10\s?500 FCFA/),
			).toBeInTheDocument(),
		);
		expect(
			screen.getByRole("link", { name: /voir le panier/i }),
		).toHaveAttribute("href", "/espace-client/panier");
	});
});
