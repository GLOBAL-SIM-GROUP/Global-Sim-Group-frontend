import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode, StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Plat } from "#/features/restaurant/models/plats";

import { usePanier } from "./use-panier";

const plat: Plat = {
	id: "1",
	nom: "Poulet braisé",
	id_categorie_plat: "cat-1",
	prix: "3500",
	disponible: true,
	description: null,
	image_url: null,
};

afterEach(() => {
	vi.restoreAllMocks();
	window.localStorage.clear();
});

describe("usePanier", () => {
	it("ajoute un plat puis incrémente sa quantité au réajout", async () => {
		const { result } = renderHook(() => usePanier());

		act(() => {
			result.current.ajouter(plat, null);
		});
		await waitFor(() => expect(result.current.lignes).toHaveLength(1));
		expect(result.current.lignes[0]).toMatchObject({
			platId: "1",
			quantite: 1,
		});

		act(() => {
			result.current.ajouter(plat, null);
		});
		expect(result.current.lignes[0]?.quantite).toBe(2);
		expect(result.current.nombreArticles).toBe(2);
		expect(result.current.total).toBe(7000);
	});

	it("retire la ligne quand la quantité tombe à zéro", async () => {
		const { result } = renderHook(() => usePanier());

		act(() => {
			result.current.ajouter(plat, null);
		});
		await waitFor(() => expect(result.current.lignes).toHaveLength(1));

		act(() => {
			result.current.definirQuantite("1", 0);
		});
		expect(result.current.lignes).toHaveLength(0);
		expect(result.current.total).toBe(0);
	});

	it("persiste le panier en localStorage entre deux montages", async () => {
		const premier = renderHook(() => usePanier());
		act(() => {
			premier.result.current.ajouter(plat, null);
		});
		await waitFor(() =>
			expect(
				window.localStorage.getItem("espace-client.panier.restaurant"),
			).toContain("Poulet braisé"),
		);

		const second = renderHook(() => usePanier());
		await waitFor(() => expect(second.result.current.lignes).toHaveLength(1));
	});

	// Régression réelle du bug « panier vide » : au montage, l'effet de
	// persistance écrivait le `lignes` initial (`[]`) avant que la lecture de
	// `localStorage` ne soit appliquée — sous StrictMode (navigateur), le
	// second passage de l'effet de lecture relisait alors un stockage vidé.
	it("n'écrase jamais le panier stocké avec un état vide au montage", async () => {
		window.localStorage.setItem(
			"espace-client.panier.restaurant",
			JSON.stringify([
				{
					id: "1",
					nom: "Poulet braisé",
					prix: "3500",
					imageUrl: null,
					quantite: 2,
				},
			]),
		);
		const setItem = vi.spyOn(Storage.prototype, "setItem");

		const { result } = renderHook(() => usePanier());
		await waitFor(() => expect(result.current.lignes).toHaveLength(1));

		const ecrituresVides = setItem.mock.calls.filter(
			([cle, valeur]) =>
				cle === "espace-client.panier.restaurant" && valeur === "[]",
		);
		expect(ecrituresVides).toHaveLength(0);
	});

	it("restaure le panier stocké sans l'écraser au montage (StrictMode)", async () => {
		window.localStorage.setItem(
			"espace-client.panier.restaurant",
			JSON.stringify([
				{
					id: "1",
					nom: "Poulet braisé",
					prix: "3500",
					imageUrl: null,
					quantite: 2,
				},
			]),
		);

		const wrapper = ({ children }: { children: ReactNode }) =>
			createElement(StrictMode, null, children);
		const { result } = renderHook(() => usePanier(), { wrapper });

		await waitFor(() => expect(result.current.lignes).toHaveLength(1));
		expect(result.current.lignes[0]).toMatchObject({
			platId: "1",
			quantite: 2,
		});
		expect(
			window.localStorage.getItem("espace-client.panier.restaurant"),
		).toContain("Poulet braisé");
	});
});
