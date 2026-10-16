import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	CLE_PANIER_BOUTIQUE,
	CLE_PANIER_RESTAURANT,
} from "../models/panier-articles";
import { PanierPage } from "./panier-page";

const mocks = vi.hoisted(() => ({
	useCan: vi.fn(),
	creerCommande: { mutate: vi.fn(), isPending: false },
	creerVente: { mutate: vi.fn(), isPending: false },
}));

vi.mock("#/core/auth", async (importOriginal) => {
	const actual = await importOriginal<typeof import("#/core/auth")>();
	return { ...actual, useCan: mocks.useCan };
});

vi.mock("../hooks/use-restaurant", () => ({
	useCreerCommandeRestaurant: () => mocks.creerCommande,
}));

vi.mock("../hooks/use-market", () => ({
	useCreerVentePortail: () => mocks.creerVente,
}));

// Catalogues vivants consommés par la revalidation des lignes : les fixtures
// ci-dessous (plat "12", produit "7") restent disponibles pour les tests.
vi.mock("#/features/restaurant/api/plats", () => ({
	listPlats: vi.fn(async () => [
		{ id: "12", nom: "Poulet braisé", prix: "2500", disponible: true },
	]),
}));

vi.mock("#/features/marchandise/api/produits", () => ({
	listProduits: vi.fn(async () => [
		{
			id: "7",
			nom: "Savon",
			prix_vente: "500",
			actif: true,
			quantite_stock: "10",
		},
	]),
}));

function renderAvecQueryClient(ui: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
}

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
	breadcrumb: [{ label: "Mon panier" }],
	liens: {
		restaurant: "/espace-client/restaurant",
		boutique: "/espace-client/boutique",
		mesDemandes: "/espace-client/mes-demandes",
	},
	variant: "client" as const,
};

const PANIER_RESTO = [
	{
		id: "12",
		nom: "Poulet braisé",
		prix: "2500",
		imageUrl: null,
		quantite: 2,
	},
];

describe("PanierPage", () => {
	beforeEach(() => {
		localStorage.clear();
		mocks.useCan.mockReturnValue(true);
		mocks.creerCommande.mutate.mockReset();
		mocks.creerCommande.isPending = false;
		mocks.creerVente.mutate.mockReset();
		mocks.creerVente.isPending = false;
	});

	it("affiche les deux paniers vides avec les liens catalogue", async () => {
		renderAvecQueryClient(<PanierPage {...PROPS} />);

		expect(await screen.findAllByText(/panier vide/i)).toHaveLength(2);
	});

	it("liste les lignes du panier restaurant avec le total", async () => {
		localStorage.setItem(CLE_PANIER_RESTAURANT, JSON.stringify(PANIER_RESTO));

		renderAvecQueryClient(<PanierPage {...PROPS} />);

		expect(await screen.findByText("Poulet braisé")).toBeInTheDocument();
		expect(screen.getAllByText(/5 000 FCFA/).length).toBeGreaterThan(0);
	});

	it("ouvre le dialogue de commande (type/livraison/note) avant envoi réseau", async () => {
		localStorage.setItem(CLE_PANIER_RESTAURANT, JSON.stringify(PANIER_RESTO));
		const user = userEvent.setup();
		renderAvecQueryClient(<PanierPage {...PROPS} />);

		await screen.findByText("Poulet braisé");
		await user.click(
			screen.getByRole("button", { name: /envoyer ma commande/i }),
		);

		// La commande part via POST /restaurant/portail/commandes : le dialogue
		// collecte le type avant l'appel à la mutation.
		expect(await screen.findByText("Type de commande")).toBeInTheDocument();
		expect(mocks.creerCommande.mutate).not.toHaveBeenCalled();
	});

	it("masque le bouton de commande sans RESTAURANT.COMMANDER", async () => {
		mocks.useCan.mockReturnValue(false);
		localStorage.setItem(CLE_PANIER_RESTAURANT, JSON.stringify(PANIER_RESTO));

		renderAvecQueryClient(<PanierPage {...PROPS} />);

		await screen.findByText("Poulet braisé");
		expect(
			screen.queryByRole("button", { name: /envoyer ma commande/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByText(/commande en ligne n'est pas activée/i),
		).toBeInTheDocument();
	});

	it("le panier boutique ouvre le dialogue avant envoi via POST portail", async () => {
		localStorage.setItem(
			CLE_PANIER_BOUTIQUE,
			JSON.stringify([
				{
					id: "7",
					nom: "Savon",
					prix: "500",
					imageUrl: null,
					quantite: 3,
				},
			]),
		);
		const user = userEvent.setup();
		renderAvecQueryClient(<PanierPage {...PROPS} />);

		await screen.findByText("Savon");
		await user.click(
			screen.getByRole("button", { name: /envoyer ma demande/i }),
		);

		// La demande part via POST /market/portail/ventes : le dialogue affiche
		// le récapitulatif avant l'appel à la mutation.
		expect(await screen.findByText("Total estimé")).toBeInTheDocument();
		expect(mocks.creerVente.mutate).not.toHaveBeenCalled();

		await user.click(
			screen.getByRole("button", { name: /envoyer la demande/i }),
		);

		expect(mocks.creerVente.mutate).toHaveBeenCalledWith(
			{ lignes: [{ id_produit: "7", quantite: "3" }], note: undefined },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
	});

	it("masque le bouton boutique sans MARCHANDISE.COMMANDER", async () => {
		mocks.useCan.mockReturnValue(false);
		localStorage.setItem(
			CLE_PANIER_BOUTIQUE,
			JSON.stringify([
				{
					id: "7",
					nom: "Savon",
					prix: "500",
					imageUrl: null,
					quantite: 3,
				},
			]),
		);

		renderAvecQueryClient(<PanierPage {...PROPS} />);

		await screen.findByText("Savon");
		expect(
			screen.queryByRole("button", { name: /envoyer ma demande/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByText(/présentez-vous à la boutique/i),
		).toBeInTheDocument();
	});
});
