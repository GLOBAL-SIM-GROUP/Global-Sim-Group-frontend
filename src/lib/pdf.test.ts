import { describe, expect, it } from "vitest";

import { construirePdf } from "./pdf";

function decode(octets: Uint8Array): string {
	return new TextDecoder("latin1").decode(octets);
}

describe("construirePdf", () => {
	it("produit un PDF d'une page valide (en-tête, xref, EOF)", () => {
		const octets = construirePdf(
			[
				["Référence", "REF-1"],
				["Montant", "35000.00"],
			],
			"Reçu de paiement",
		);
		const contenu = decode(octets);
		expect(contenu.startsWith("%PDF-1.4")).toBe(true);
		expect(contenu.endsWith("%%EOF\n")).toBe(true);
		expect(contenu).toContain("Reçu de paiement");
		expect(contenu).toContain("REF-1");
		// Chaque offset du xref pointe sur « N 0 obj ».
		const offsets = [...contenu.matchAll(/^(\d{10}) 00000 n/gm)].map((m) =>
			Number(m[1]),
		);
		expect(offsets.length).toBeGreaterThanOrEqual(6);
		for (const offset of offsets) {
			expect(contenu.slice(offset, offset + 8)).toMatch(/^\d+ 0 obj/);
		}
	});

	it("encode les accents en WinAnsi (Latin-1)", () => {
		const contenu = decode(construirePdf([["Échéance de loyer"]], "Reçu"));
		expect(contenu).toContain("Échéance de loyer");
	});

	it("échappe les parenthèses et les barres obliques", () => {
		const contenu = decode(construirePdf([["(a)\\b"]], "t"));
		expect(contenu).toContain("\\(a\\)\\\\b");
	});
});
