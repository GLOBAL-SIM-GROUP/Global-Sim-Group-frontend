import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChargeFilters } from "./charge-filters";

function renderFiltres() {
	return render(
		<ChargeFilters
			statut="tous"
			logement=""
			periode=""
			categorie=""
			onStatutChange={vi.fn()}
			onLogementChange={vi.fn()}
			onPeriodeChange={vi.fn()}
			onCategorieChange={vi.fn()}
		/>,
	);
}

/**
 * Correctif responsive (320px et en-dessous) : les 4 filtres avaient une
 * largeur fixe `w-40` (160px) qui ne s'adaptait jamais — passés en pleine
 * largeur sous `sm`, largeur fixe conservée au-delà.
 */
describe("ChargeFilters — responsive", () => {
	it("passe chaque filtre en pleine largeur sous `sm`", () => {
		renderFiltres();

		const champLogement = screen.getByLabelText("Filtrer par logement");
		expect(champLogement.className).toContain("w-full");
		expect(champLogement.className).toContain("sm:w-40");

		const champPeriode = screen.getByLabelText("Filtrer par période");
		expect(champPeriode.className).toContain("w-full");
		expect(champPeriode.className).toContain("sm:w-40");

		const champCategorie = screen.getByLabelText("Filtrer par catégorie");
		expect(champCategorie.className).toContain("w-full");
		expect(champCategorie.className).toContain("sm:w-40");

		const selectStatut = screen.getByLabelText("Statut");
		expect(selectStatut.className).toContain("w-full");
		expect(selectStatut.className).toContain("sm:w-40");
	});
});
