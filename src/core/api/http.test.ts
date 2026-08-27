import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApiClient } from "./http";

describe("ApiClient HTTP methods", () => {
	let mockFetch: ReturnType<typeof vi.fn>;
	let apiClient: ReturnType<typeof createApiClient>;

	beforeEach(() => {
		mockFetch = vi.fn();
		global.fetch = mockFetch as any;

		apiClient = createApiClient({
			getAccessToken: () => "test-token",
			refresh: async () => true,
			onSessionExpired: vi.fn(),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("get() should make a GET request with correct headers", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ id: 1, name: "test" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const result = await apiClient.get<{ id: number; name: string }>("/test");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/test"),
			expect.objectContaining({
				method: "GET",
				headers: expect.any(Headers),
			}),
		);
		expect(result).toEqual({ id: 1, name: "test" });
	});

	it("post() should make a POST request with JSON body", async () => {
		const payload = { title: "New item", description: "Test" };

		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ id: 1, ...payload }), {
				status: 201,
				headers: { "content-type": "application/json" },
			}),
		);

		const result = await apiClient.post<typeof payload>("/items", payload);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/items"),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(payload),
				headers: expect.any(Headers),
			}),
		);
		expect(result).toEqual({ id: 1, ...payload });
	});

	it("post() without body should send null body", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({}), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		await apiClient.post<{}>("/trigger");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/trigger"),
			expect.objectContaining({
				method: "POST",
				body: undefined,
			}),
		);
	});

	it("patch() should make a PATCH request with JSON body", async () => {
		const payload = { name: "Updated" };

		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ id: 1, ...payload }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const result = await apiClient.patch<typeof payload>(
			"/items/1",
			payload,
		);

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/items/1"),
			expect.objectContaining({
				method: "PATCH",
				body: JSON.stringify(payload),
			}),
		);
		expect(result).toEqual({ id: 1, ...payload });
	});

	it("delete() should make a DELETE request", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({}), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const result = await apiClient.delete<{}>("/items/1");

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining("/items/1"),
			expect.objectContaining({
				method: "DELETE",
			}),
		);
		expect(result).toEqual({});
	});

	it("should include Bearer token in Authorization header", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({}), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		await apiClient.get("/protected");

		const callArgs = mockFetch.mock.calls[0];
		const headers = callArgs[1].headers as Headers;
		expect(headers.get("authorization")).toBe("Bearer test-token");
	});

	it("should set content-type to application/json", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({}), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		await apiClient.post("/items", { test: true });

		const callArgs = mockFetch.mock.calls[0];
		const headers = callArgs[1].headers as Headers;
		expect(headers.get("content-type")).toBe("application/json");
	});

	it("should throw ApiError on 400 response", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					statusCode: 400,
					message: "Bad request",
				}),
				{
					status: 400,
					headers: { "content-type": "application/json" },
				},
			),
		);

		await expect(apiClient.get("/invalid")).rejects.toThrow();
	});

	it("should throw ApiError on 401 and fail refresh", async () => {
		apiClient = createApiClient({
			getAccessToken: () => "test-token",
			refresh: async () => false,
			onSessionExpired: vi.fn(),
		});

		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ message: "Unauthorized" }),
				{
					status: 401,
					headers: { "content-type": "application/json" },
				},
			),
		);

		await expect(apiClient.get("/protected")).rejects.toThrow();
	});
});
