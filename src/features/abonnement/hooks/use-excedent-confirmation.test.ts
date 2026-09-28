import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "#/core/api";

import { CODE_EXCEDENT } from "../models/abonnements";
import {
	messageSiExcedent,
	useExcedentConfirmation,
} from "./use-excedent-confirmation";

const erreurExcedent = (message = "Dépassement de quota.") =>
	new ApiError({ status: 409, code: CODE_EXCEDENT, message });

describe("messageSiExcedent", () => {
	it("renvoie le message serveur pour un 409 ABONNEMENT_EXCEDENT", () => {
		expect(messageSiExcedent(erreurExcedent("Quota dépassé."))).toBe(
			"Quota dépassé.",
		);
	});

	it("retombe sur un message générique si le 409 n'a pas de message", () => {
		expect(messageSiExcedent(erreurExcedent(""))).toBe(
			"Dépassement de quota abonnement.",
		);
	});

	it("renvoie null pour un 409 d'un autre code", () => {
		const autre = new ApiError({
			status: 409,
			code: "AUTRE_CONFLIT",
			message: "Conflit.",
		});
		expect(messageSiExcedent(autre)).toBeNull();
	});

	it("renvoie null pour une erreur non-409", () => {
		const validation = new ApiError({
			status: 400,
			code: CODE_EXCEDENT,
			message: "Ne devrait pas matcher hors 409.",
		});
		expect(messageSiExcedent(validation)).toBeNull();
	});

	it("renvoie null pour une erreur réseau générique", () => {
		expect(messageSiExcedent(new Error("network down"))).toBeNull();
	});
});

describe("useExcedentConfirmation", () => {
	it("démarre non confirmé", () => {
		const { result } = renderHook(() => useExcedentConfirmation());
		expect(result.current.confirme).toBe(false);
	});

	it("detecter arme confirme et renvoie le message sur un 409 excédent", () => {
		const { result } = renderHook(() => useExcedentConfirmation());

		let message: string | null = null;
		act(() => {
			message = result.current.detecter(erreurExcedent("Quota dépassé."));
		});

		expect(message).toBe("Quota dépassé.");
		expect(result.current.confirme).toBe(true);
	});

	it("detecter n'arme pas confirme et renvoie null sur une erreur générique", () => {
		const { result } = renderHook(() => useExcedentConfirmation());

		let message: string | null = null;
		act(() => {
			message = result.current.detecter(new Error("boom"));
		});

		expect(message).toBeNull();
		expect(result.current.confirme).toBe(false);
	});

	it("accepterExcedent est true si confirme, même sans excédent d'aperçu", () => {
		const { result } = renderHook(() => useExcedentConfirmation());
		act(() => {
			result.current.detecter(erreurExcedent());
		});
		expect(result.current.accepterExcedent(false)).toBe(true);
		expect(result.current.accepterExcedent(undefined)).toBe(true);
	});

	it("accepterExcedent est true si l'aperçu signale déjà un excédent, sans 409 préalable", () => {
		const { result } = renderHook(() => useExcedentConfirmation());
		expect(result.current.accepterExcedent(true)).toBe(true);
	});

	it("accepterExcedent est false sans confirmation ni excédent d'aperçu", () => {
		const { result } = renderHook(() => useExcedentConfirmation());
		expect(result.current.accepterExcedent(false)).toBe(false);
		expect(result.current.accepterExcedent(undefined)).toBe(false);
	});

	it("reinitialiser remet confirme à false", () => {
		const { result } = renderHook(() => useExcedentConfirmation());
		act(() => {
			result.current.detecter(erreurExcedent());
		});
		expect(result.current.confirme).toBe(true);

		act(() => {
			result.current.reinitialiser();
		});
		expect(result.current.confirme).toBe(false);
	});
});
