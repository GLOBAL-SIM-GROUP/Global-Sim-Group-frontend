import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CategoriePlat, Plat } from "#/features/restaurant/models/plats";

import { RestaurantPage } from "./restaurant-page";

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
];

const categories: CategoriePlat[] = [
	{ id: "cat-plats", libelle: "Plats" },
	{ id: "cat-boissons", libelle: "Boissons" },
];

vi.mock("#/features/restaurant/api/plats", () => ({
	listPlats: () => Promise.resolve(plats),
	listCategoriesPlats: () => Promise.resolve(categories),
}));

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

describe("RestaurantPage", () => {
	it("affiche uniquement les plats disponibles", async () => {
		renderAvecQueryClient(<RestaurantPage />);

		expect(await screen.findByText("Poulet braisé")).toBeInTheDocument();
		expect(screen.getByText("Jus de gingembre")).toBeInTheDocument();
		expect(screen.queryByText("Plat épuisé")).not.toBeInTheDocument();
	});

	it("filtre par catégorie via les onglets", async () => {
		const user = userEvent.setup();
		renderAvecQueryClient(<RestaurantPage />);
		await screen.findByText("Poulet braisé");

		await user.click(screen.getByRole("tab", { name: "Boissons" }));

		expect(screen.queryByText("Poulet braisé")).not.toBeInTheDocument();
		expect(screen.getByText("Jus de gingembre")).toBeInTheDocument();
	});

	it("ajoute un plat au panier et met à jour la barre de panier", async () => {
		const user = userEvent.setup();
		renderAvecQueryClient(<RestaurantPage />);
		const carte = (await screen.findByText("Poulet braisé")).closest(
			"article",
		) as HTMLElement;

		await user.click(within(carte).getByRole("button", { name: /ajouter/i }));

		await waitFor(() =>
			expect(screen.getByText(/1 article · 3\s?500 FCFA/)).toBeInTheDocument(),
		);
		expect(
			screen.getByRole("button", { name: /bientôt disponible/i }),
		).toBeDisabled();
	});
});
