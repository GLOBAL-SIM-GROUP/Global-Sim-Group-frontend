import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listerDemandes } from "../models/demandes";
import {
	CLE_PANIER_BOUTIQUE,
	CLE_PANIER_RESTAURANT,
} from "../models/panier-articles";
import { PanierPage } from "./panier-page";

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

describe("PanierPage", () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		fetchSpy = vi.spyOn(global, "fetch");
		localStorage.clear();
	});

	afterEach(() => {
		fetchSpy.mockRestore();
	});

	it("affiche les deux paniers vides avec les liens catalogue", async () => {
		render(<PanierPage />);

		expect(await screen.findAllByText(/panier vide/i)).toHaveLength(2);
	});

	it("liste les lignes du panier restaurant avec le total", async () => {
		localStorage.setItem(
			CLE_PANIER_RESTAURANT,
			JSON.stringify([
				{
					id: "12",
					nom: "Poulet braisé",
					prix: "2500",
					imageUrl: null,
					quantite: 2,
				},
			]),
		);

		render(<PanierPage />);

		expect(await screen.findByText("Poulet braisé")).toBeInTheDocument();
		expect(screen.getAllByText(/5 000 FCFA/).length).toBeGreaterThan(0);
	});

	it("enregistre la demande, vide le panier et n'appelle pas le réseau", async () => {
		localStorage.setItem(
			CLE_PANIER_RESTAURANT,
			JSON.stringify([
				{
					id: "12",
					nom: "Poulet braisé",
					prix: "2500",
					imageUrl: null,
					quantite: 2,
				},
			]),
		);
		const user = userEvent.setup();
		render(<PanierPage />);

		await screen.findByText("Poulet braisé");
		await user.click(
			screen.getByRole("button", { name: /envoyer ma demande/i }),
		);

		expect(await screen.findByText("Demande enregistrée")).toBeInTheDocument();
		expect(
			JSON.parse(localStorage.getItem(CLE_PANIER_RESTAURANT) ?? "[]"),
		).toHaveLength(0);
		const demandes = listerDemandes();
		expect(demandes).toHaveLength(1);
		expect(demandes[0].service).toBe("commande-restaurant");
		expect(demandes[0].resume).toContain("2× Poulet braisé");
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("le panier boutique est indépendant du panier restaurant", async () => {
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

		render(<PanierPage />);

		expect(await screen.findByText("Savon")).toBeInTheDocument();
		expect(screen.getAllByText(/1 500 FCFA/).length).toBeGreaterThan(0);
	});
});
