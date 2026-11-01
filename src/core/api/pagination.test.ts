import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "./http";
import { fetchToutesPages } from "./pagination";

// Mock de l'API client — seule `apiFetch` est utilisée par fetchToutesPages.
let mockApiClient: Pick<ApiClient, "apiFetch">;

vi.mock("./client", () => ({
	getApiClient: () => mockApiClient,
}));

const page = (taille: number, debut: number) =>
	Array.from({ length: taille }, (_, i) => ({ id: `item-${debut + i}` }));

describe("fetchToutesPages", () => {
	beforeEach(() => {
		mockApiClient = { apiFetch: vi.fn() };
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("agrège plusieurs pages jusqu'à une page courte", async () => {
		const apiFetch = vi.mocked(mockApiClient.apiFetch);
		apiFetch
			.mockResolvedValueOnce(page(100, 0))
			.mockResolvedValueOnce(page(100, 100))
			.mockResolvedValueOnce(page(37, 200));

		const resultat = await fetchToutesPages<{ id: string }>("/api/v1/test");

		expect(resultat).toHaveLength(237);
		expect(resultat[236].id).toBe("item-236");
		expect(apiFetch).toHaveBeenCalledTimes(3);
		expect(apiFetch).toHaveBeenNthCalledWith(
			1,
			"/api/v1/test?limit=100&offset=0",
		);
		expect(apiFetch).toHaveBeenNthCalledWith(
			2,
			"/api/v1/test?limit=100&offset=100",
		);
		expect(apiFetch).toHaveBeenNthCalledWith(
			3,
			"/api/v1/test?limit=100&offset=200",
		);
	});

	it("s'arrête à la page vide qui suit un multiple exact de 100", async () => {
		const apiFetch = vi.mocked(mockApiClient.apiFetch);
		apiFetch
			.mockResolvedValueOnce(page(100, 0))
			.mockResolvedValueOnce(page(100, 100))
			.mockResolvedValueOnce([]);

		const resultat = await fetchToutesPages<{ id: string }>("/api/v1/test");

		expect(resultat).toHaveLength(200);
		expect(apiFetch).toHaveBeenCalledTimes(3);
	});

	it("renvoie [] sans requête supplémentaire sur une réponse vide", async () => {
		const apiFetch = vi.mocked(mockApiClient.apiFetch);
		apiFetch.mockResolvedValueOnce([]);

		const resultat = await fetchToutesPages<{ id: string }>("/api/v1/test");

		expect(resultat).toEqual([]);
		expect(apiFetch).toHaveBeenCalledTimes(1);
	});

	it("propage l'erreur d'une page intermédiaire", async () => {
		const apiFetch = vi.mocked(mockApiClient.apiFetch);
		const erreur = new Error("500 Internal Server Error");
		apiFetch.mockResolvedValueOnce(page(100, 0)).mockRejectedValueOnce(erreur);

		await expect(fetchToutesPages("/api/v1/test")).rejects.toBe(erreur);
		expect(apiFetch).toHaveBeenCalledTimes(2);
	});

	it("préserve les paramètres de requête existants (& avant limit/offset)", async () => {
		const apiFetch = vi.mocked(mockApiClient.apiFetch);
		apiFetch.mockResolvedValueOnce(page(12, 0));

		await fetchToutesPages("/api/v1/test?statut=ACTIF&sort=nom&order=asc");

		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/test?statut=ACTIF&sort=nom&order=asc&limit=100&offset=0",
		);
	});
});
