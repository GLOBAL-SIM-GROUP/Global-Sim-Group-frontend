import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LogementCascadeField } from "./logement-cascade-field";

const useLogementsMock = vi.fn((..._args: unknown[]) => ({ data: [] }));
vi.mock("../hooks/use-logements", () => ({
	useLogements: (batiment: string | undefined, type: string, statut: string) =>
		useLogementsMock(batiment, type, statut),
}));

vi.mock("../hooks/use-batiments", () => ({
	useBatiments: () => ({
		data: [{ id: "1", code: "A", nom: "Bâtiment A" }],
	}),
}));

/**
 * `disponibleUniquement` restreint le lister logements au statut DISPONIBLE
 * (ex. création de contrat : impossible de louer un logement déjà occupé).
 * Par défaut, tous les statuts sont proposés (ex. ajout d'une charge, qui
 * doit pouvoir cibler un logement occupé).
 */
describe("LogementCascadeField", () => {
	it("filtre sur DISPONIBLE quand disponibleUniquement est activé", () => {
		render(
			<LogementCascadeField value="" onChange={vi.fn()} disponibleUniquement />,
		);

		expect(useLogementsMock).toHaveBeenCalledWith(
			expect.any(String),
			"tous",
			"DISPONIBLE",
		);
	});

	it("ne filtre pas par statut par défaut", () => {
		render(<LogementCascadeField value="" onChange={vi.fn()} />);

		expect(useLogementsMock).toHaveBeenCalledWith(
			expect.any(String),
			"tous",
			"tous",
		);
	});
});
