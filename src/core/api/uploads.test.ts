import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "./http";
import { createApiClient } from "./http";
import { downloadUploadedFile, uploadImage } from "./uploads";

// Mock de l'API client
let mockApiClient: Partial<ApiClient>;

vi.mock("./client", () => ({
	getApiClient: () => mockApiClient,
}));

describe("uploadImage", () => {
	beforeEach(() => {
		mockApiClient = {
			uploadForm: vi.fn(),
			download: vi.fn(),
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("validation côté client", () => {
		it("rejette les fichiers > 5 Mo", async () => {
			const largeFile = new File(
				[new ArrayBuffer(6 * 1024 * 1024)],
				"large.jpg",
				{ type: "image/jpeg" },
			);

			await expect(uploadImage(largeFile, "client-photo")).rejects.toThrow(
				"L'image ne doit pas dépasser 5 Mo",
			);
		});

		it("rejette les formats invalides", async () => {
			const invalidFile = new File([new ArrayBuffer(1000)], "invalid.exe", {
				type: "application/octet-stream",
			});

			await expect(uploadImage(invalidFile, "client-photo")).rejects.toThrow(
				"Format non supporté",
			);
		});

		it("accepte les formats valides (JPG, PNG, WebP, PDF)", async () => {
			const validFormats = [
				{ type: "image/jpeg", name: "test.jpg" },
				{ type: "image/png", name: "test.png" },
				{ type: "image/webp", name: "test.webp" },
				{ type: "application/pdf", name: "test.pdf" },
			];

			for (const format of validFormats) {
				const file = new File([new ArrayBuffer(1000)], format.name, {
					type: format.type,
				});

				(mockApiClient.uploadForm as any).mockResolvedValueOnce({
					key: `client-photo/3-uuid.${format.name.split(".").pop()}`,
				});

				const result = await uploadImage(file, "client-photo");
				expect(result).toBeDefined();
			}
		});
	});

	describe("upload réussi", () => {
		it("retourne la clé MinIO après upload", async () => {
			const file = new File([new ArrayBuffer(1000)], "photo.jpg", {
				type: "image/jpeg",
			});

			const expectedKey = "client-photo/3-abc123-uuid.jpg";
			(mockApiClient.uploadForm as any).mockResolvedValueOnce({
				key: expectedKey,
			});

			const result = await uploadImage(file, "client-photo");

			expect(result).toBe(expectedKey);
			expect(mockApiClient.uploadForm).toHaveBeenCalledWith(
				"/api/v1/uploads",
				expect.objectContaining({
					method: "POST",
				}),
			);
		});

		it("envoie FormData avec le fichier et la catégorie", async () => {
			const file = new File([new ArrayBuffer(500)], "piece.pdf", {
				type: "application/pdf",
			});

			(mockApiClient.uploadForm as any).mockResolvedValueOnce({
				key: "piece-identite/3-def456.pdf",
			});

			await uploadImage(file, "piece-identite");

			const call = (mockApiClient.uploadForm as any).mock.calls[0];
			expect(call[0]).toBe("/api/v1/uploads");
			expect(call[1].body).toBeInstanceOf(FormData);
		});
	});

	describe("gestion des erreurs", () => {
		it("propage les erreurs API 403 (permission manquante)", async () => {
			const file = new File([new ArrayBuffer(1000)], "photo.jpg", {
				type: "image/jpeg",
			});

			const error = new Error("403 Forbidden");
			(mockApiClient.uploadForm as any).mockRejectedValueOnce(error);

			await expect(uploadImage(file, "client-photo")).rejects.toBe(error);
		});

		it("propage les erreurs API 400 (fichier invalide serveur)", async () => {
			const file = new File([new ArrayBuffer(1000)], "photo.jpg", {
				type: "image/jpeg",
			});

			const error = new Error("400 Bad Request");
			(mockApiClient.uploadForm as any).mockRejectedValueOnce(error);

			await expect(uploadImage(file, "client-photo")).rejects.toBe(error);
		});
	});
});

describe("downloadUploadedFile", () => {
	beforeEach(() => {
		mockApiClient = {
			uploadForm: vi.fn(),
			download: vi.fn(),
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("retourne null si key est undefined", async () => {
		const result = await downloadUploadedFile(undefined);
		expect(result).toBeNull();
		expect(mockApiClient.download).not.toHaveBeenCalled();
	});

	it("retourne null si key est null", async () => {
		const result = await downloadUploadedFile(null);
		expect(result).toBeNull();
		expect(mockApiClient.download).not.toHaveBeenCalled();
	});

	it("télécharge le fichier avec la clé correcte", async () => {
		const mockBlob = new Blob(["image data"], { type: "image/jpeg" });
		(mockApiClient.download as any).mockResolvedValueOnce(mockBlob);

		const result = await downloadUploadedFile("client-photo/3-uuid.jpg");

		expect(result).toBe(mockBlob);
		expect(mockApiClient.download).toHaveBeenCalledWith(
			expect.stringContaining("client-photo%2F3-uuid.jpg"),
		);
	});

	it("retourne null si le téléchargement échoue (404 ou permission)", async () => {
		(mockApiClient.download as any).mockRejectedValueOnce(
			new Error("404 Not Found"),
		);

		const result = await downloadUploadedFile("client-photo/3-uuid.jpg");

		expect(result).toBeNull();
	});
});
