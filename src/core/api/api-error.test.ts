import { describe, expect, it } from "vitest";

import {
	ApiError,
	ApiErrorCode,
	buildApiError,
	getFieldErrors,
	isApiError,
	isValidationErrorDetail,
	toApiError,
} from "./api-error";

describe("ApiError", () => {
	it("conserve les champs de l’enveloppe", () => {
		const error = new ApiError({
			status: 400,
			code: "VALIDATION_ERROR",
			message: "Échec",
			requestId: "req-1",
			path: "/api/v1/auth/login",
			details: [{ property: "login", messages: ["Requis"] }],
		});

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("ApiError");
		expect(error.status).toBe(400);
		expect(error.code).toBe("VALIDATION_ERROR");
		expect(error.requestId).toBe("req-1");
		expect(error.path).toBe("/api/v1/auth/login");
		expect(error.details).toEqual([
			{ property: "login", messages: ["Requis"] },
		]);
	});
});

describe("isApiError / toApiError", () => {
	it("reconnaît une ApiError et la renvoie telle quelle", () => {
		const error = new ApiError({
			status: 401,
			code: "UNAUTHORIZED",
			message: "x",
		});
		expect(isApiError(error)).toBe(true);
		expect(toApiError(error)).toBe(error);
	});

	it("normalise une erreur native en NETWORK_ERROR", () => {
		const normalized = toApiError(new Error("boom"));
		expect(isApiError(normalized)).toBe(true);
		expect(normalized.code).toBe(ApiErrorCode.NETWORK_ERROR);
		expect(normalized.status).toBe(0);
	});

	it("normalise une valeur non-Error", () => {
		const normalized = toApiError("nope");
		expect(normalized.code).toBe(ApiErrorCode.NETWORK_ERROR);
		expect(normalized.message).toBe("Erreur inconnue");
	});
});

describe("buildApiError", () => {
	it("conserve une enveloppe backend valide", () => {
		const error = buildApiError(422, {
			success: false,
			code: "VALIDATION_ERROR",
			message: "Erreur de validation",
			details: [{ property: "mot_de_passe", messages: ["Trop court"] }],
		});

		expect(error.status).toBe(422);
		expect(error.code).toBe("VALIDATION_ERROR");
		expect(error.message).toBe("Erreur de validation");
		expect(error.details).toEqual([
			{ property: "mot_de_passe", messages: ["Trop court"] },
		]);
	});

	it("dérive code et message du statut si le corps n’est pas une enveloppe", () => {
		const error = buildApiError(500, "oops");
		expect(error.status).toBe(500);
		expect(error.code).toBe("500");
		expect(error.message).toBe("Erreur HTTP 500");
	});
});

describe("getFieldErrors", () => {
	it("extrait les détails de validation champ par champ", () => {
		const error = new ApiError({
			status: 422,
			code: "VALIDATION_ERROR",
			message: "x",
			details: [{ property: "login", messages: ["Requis"] }],
		});

		expect(getFieldErrors(error)).toEqual([
			{ property: "login", messages: ["Requis"] },
		]);
	});

	it("retourne [] pour une erreur sans details", () => {
		expect(
			getFieldErrors(new ApiError({ status: 500, code: "X", message: "x" })),
		).toEqual([]);
	});

	it("retourne [] pour une valeur qui n’est pas une ApiError", () => {
		expect(getFieldErrors(null)).toEqual([]);
		expect(getFieldErrors(new Error("boom"))).toEqual([]);
	});

	it("ignore les entrées qui ne sont pas des ValidationErrorDetail", () => {
		const error = new ApiError({
			status: 400,
			code: "X",
			message: "x",
			details: [{ property: "login", messages: ["a"] }, { foo: 1 }, "nope"],
		});

		expect(getFieldErrors(error)).toEqual([
			{ property: "login", messages: ["a"] },
		]);
	});
});

describe("isValidationErrorDetail", () => {
	it("accepte { property: string, messages: array }", () => {
		expect(isValidationErrorDetail({ property: "login", messages: [] })).toBe(
			true,
		);
	});

	it("refuse les valeurs invalides", () => {
		expect(isValidationErrorDetail(null)).toBe(false);
		expect(isValidationErrorDetail({ property: "login" })).toBe(false);
		expect(isValidationErrorDetail({ property: 1, messages: ["a"] })).toBe(
			false,
		);
		expect(isValidationErrorDetail({ messages: ["a"] })).toBe(false);
	});
});
