import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AbonnementFilters } from "./abonnement-filters";

function renderFiltres() {
	return render(
		<AbonnementFilters
			statut="tous"
			locataire=""
			service=""
			onStatutChange={vi.fn()}
			onLocataireChange={vi.fn()}
			onServiceChange={vi.fn()}
		/>,
	);
}

/**
 * Correctif responsive (320px et en-dessous) : les 3 champs de filtre avaient
 * une largeur fixe (`w-40`/`w-48`/`w-44`) qui ne s'adaptait jamais à un écran
 * étroit. jsdom n'évalue pas les media queries — on verrouille donc la
 * présence des classes Tailwind responsables du comportement (cf.
 * charge-filters via charges-page.test.tsx).
 */
describe("AbonnementFilters — responsive", () => {
	it("étend le filtre Statut sur toute la largeur sous `sm`", () => {
		renderFiltres();

		const statut = screen.getByLabelText("Statut");
		expect(statut.className).toContain("w-full");
		expect(statut.className).toContain("sm:w-40");
	});

	it("étend le filtre Locataire sur toute la largeur sous `sm`", () => {
		renderFiltres();

		const locataire = screen.getByLabelText("Filtrer par locataire");
		expect(locataire.className).toContain("w-full");
		expect(locataire.className).toContain("sm:w-48");
	});

	it("étend le filtre Service sur toute la largeur sous `sm`", () => {
		renderFiltres();

		const service = screen.getByLabelText("Filtrer par service");
		expect(service.className).toContain("w-full");
		expect(service.className).toContain("sm:w-44");
	});
});
