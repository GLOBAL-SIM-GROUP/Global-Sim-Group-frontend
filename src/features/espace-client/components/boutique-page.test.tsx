import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
	CategorieProduit,
	Produit,
} from "#/features/marchandise/models/produits";

import { BoutiquePage } from "./boutique-page";

const produits: Produit[] = [
	{
		id: "1",
		reference: "REF-1",
		nom: "Eau minérale 1.5L",
		id_categorie_produit: "cat-boissons",
		prix_achat: "300",
		prix_vente: "500",
		quantite_stock: "20",
		seuil_alerte: "5",
		id_fournisseur: null,
		date_entree: null,
		actif: true,
		image_url: null,
		code_barre: null,
	},
	{
		id: "2",
		reference: "REF-2",
		nom: "Savon artisanal",
		id_categorie_produit: "cat-hygiene",
		prix_achat: "500",
		prix_vente: "1000",
		quantite_stock: "10",
		seuil_alerte: "3",
		id_fournisseur: null,
		date_entree: null,
		actif: true,
		image_url: null,
		code_barre: null,
	},
	{
		id: "3",
		reference: "REF-3",
		nom: "Produit inactif",
		id_categorie_produit: "cat-boissons",
		prix_achat: "100",
		prix_vente: "200",
		quantite_stock: "10",
		seuil_alerte: "2",
		id_fournisseur: null,
		date_entree: null,
		actif: false,
		image_url: null,
		code_barre: null,
	},
	{
		id: "4",
		reference: "REF-4",
		nom: "Produit épuisé",
		id_categorie_produit: "cat-boissons",
		prix_achat: "100",
		prix_vente: "200",
		quantite_stock: "0",
		seuil_alerte: "2",
		id_fournisseur: null,
		date_entree: null,
		actif: true,
		image_url: null,
		code_barre: null,
	},
];

const categories: CategorieProduit[] = [
	{ id: "cat-boissons", libelle: "Boissons" },
	{ id: "cat-hygiene", libelle: "Hygiène" },
];

vi.mock("#/features/marchandise/api/produits", () => ({
	listProduits: () => Promise.resolve(produits),
	listCategoriesProduits: () => Promise.resolve(categories),
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

describe("BoutiquePage", () => {
	it("affiche uniquement les produits actifs et en stock", async () => {
		renderAvecQueryClient(<BoutiquePage />);

		expect(await screen.findByText("Eau minérale 1.5L")).toBeInTheDocument();
		expect(screen.getByText("Savon artisanal")).toBeInTheDocument();
		expect(screen.queryByText("Produit inactif")).not.toBeInTheDocument();
		expect(screen.queryByText("Produit épuisé")).not.toBeInTheDocument();
	});

	it("filtre par catégorie via les onglets", async () => {
		const user = userEvent.setup();
		renderAvecQueryClient(<BoutiquePage />);
		await screen.findByText("Eau minérale 1.5L");

		await user.click(screen.getByRole("tab", { name: "Hygiène" }));

		expect(screen.queryByText("Eau minérale 1.5L")).not.toBeInTheDocument();
		expect(screen.getByText("Savon artisanal")).toBeInTheDocument();
	});

	it("ajoute un produit disponible au panier et met à jour la barre de panier", async () => {
		const user = userEvent.setup();
		renderAvecQueryClient(<BoutiquePage />);
		const carte = (await screen.findByText("Eau minérale 1.5L")).closest(
			"article",
		) as HTMLElement;

		await user.click(within(carte).getByRole("button", { name: /ajouter/i }));

		await waitFor(() =>
			expect(screen.getByText(/1 article · 500 FCFA/)).toBeInTheDocument(),
		);
	});
});
