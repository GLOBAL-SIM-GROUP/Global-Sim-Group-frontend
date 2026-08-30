import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { imprimerPdfBlob, imprimerPdfOctets } from "./print-pdf";

/**
 * jsdom ne charge pas réellement un `<iframe src="blob:...">` (pas de moteur
 * de rendu PDF) — on simule la fin du chargement à la main (`iframe.onload`)
 * avec un `contentWindow` mocké, pour vérifier que l'impression est bien
 * déclenchée sur LA FENÊTRE DE L'IFRAME (pas `window.print()`, qui
 * imprimerait la page HTML de l'app).
 */
describe("imprimerPdfBlob", () => {
	let createObjectURLMock: ReturnType<typeof vi.fn>;
	let revokeObjectURLMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.useFakeTimers();
		createObjectURLMock = vi.fn(() => "blob:mock-url");
		revokeObjectURLMock = vi.fn();
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL: createObjectURLMock,
			revokeObjectURL: revokeObjectURLMock,
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
		document.body.innerHTML = "";
	});

	function declencherChargement(printMock: ReturnType<typeof vi.fn>) {
		const iframe = document.body.querySelector("iframe");
		expect(iframe).not.toBeNull();
		Object.defineProperty(iframe, "contentWindow", {
			value: { focus: vi.fn(), print: printMock },
			configurable: true,
		});
		iframe?.onload?.(new Event("load"));
		return iframe as HTMLIFrameElement;
	}

	it("charge le blob dans un iframe caché", () => {
		imprimerPdfBlob(new Blob(["%PDF"]));

		expect(createObjectURLMock).toHaveBeenCalledTimes(1);
		const iframe = document.body.querySelector("iframe");
		expect(iframe?.src).toBe("blob:mock-url");
	});

	it("imprime la fenêtre de l'iframe (pas window.print())", () => {
		const printMock = vi.fn();
		const windowPrintSpy = vi.spyOn(window, "print");

		imprimerPdfBlob(new Blob(["%PDF"]));
		declencherChargement(printMock);

		expect(printMock).toHaveBeenCalledTimes(1);
		expect(windowPrintSpy).not.toHaveBeenCalled();
	});

	it("nettoie l'iframe et révoque l'URL au retour du focus", () => {
		imprimerPdfBlob(new Blob(["%PDF"]));
		declencherChargement(vi.fn());

		expect(document.body.querySelector("iframe")).not.toBeNull();

		window.dispatchEvent(new Event("focus"));

		expect(document.body.querySelector("iframe")).toBeNull();
		expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-url");
	});

	it("nettoie via le filet de sécurité si le focus ne revient jamais", () => {
		imprimerPdfBlob(new Blob(["%PDF"]));
		declencherChargement(vi.fn());

		vi.advanceTimersByTime(60_000);

		expect(document.body.querySelector("iframe")).toBeNull();
	});
});

describe("imprimerPdfOctets", () => {
	it("enveloppe les octets dans un Blob PDF avant d'imprimer", () => {
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL: vi.fn((blob: Blob) => {
				expect(blob.type).toBe("application/pdf");
				return "blob:mock-url";
			}),
			revokeObjectURL: vi.fn(),
		});

		imprimerPdfOctets(Uint8Array.from([1, 2, 3]));

		expect(document.body.querySelector("iframe")?.src).toBe("blob:mock-url");
		vi.unstubAllGlobals();
		document.body.innerHTML = "";
	});
});
