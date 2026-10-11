import { render, screen } from "@testing-library/react";
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

const useOccupationPeriodeMock = vi.fn(
	(..._args: (string | null | undefined)[]) => ({
		occupes: new Set<string>(),
		enAttente: new Set<string>(),
	}),
);
vi.mock("../hooks/use-occupation-periode", () => ({
	useOccupationPeriode: (
		debut: string | null | undefined,
		fin: string | null | undefined,
	) => useOccupationPeriodeMock(debut, fin),
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

	/**
	 * Le Select « Logement » doit rester monté (juste désactivé) tant qu'aucun
	 * bâtiment n'est choisi, plutôt que d'apparaître/disparaître : dans une
	 * Dialog Radix, un Select qui se monte pile quand un Select voisin se
	 * ferme peut rester bloqué (aria-hidden/pointer-events mal nettoyés),
	 * rendant le second Select impossible à ouvrir ensuite.
	 */
	it("garde le Select Logement monté (désactivé) avant tout choix de bâtiment", () => {
		render(<LogementCascadeField value="" onChange={vi.fn()} />);

		const declencheur = screen.getByRole("combobox", { name: "Logement" });
		expect(declencheur).toBeInTheDocument();
		expect(declencheur).toBeDisabled();
	});

	/**
	 * Filtre de période (création de séjour) : `GET /residence/logements`
	 * ignore les dates — l'occupation est recomposée en local via
	 * `useOccupationPeriode`, activé seulement avec `disponibleUniquement`.
	 */
	it("interroge l'occupation de la période quand disponibleUniquement + periode", () => {
		render(
			<LogementCascadeField
				value=""
				onChange={vi.fn()}
				disponibleUniquement
				periode={{ debut: "2026-10-10 14:00:00", fin: "2026-10-12 11:00:00" }}
			/>,
		);

		expect(useOccupationPeriodeMock).toHaveBeenCalledWith(
			"2026-10-10 14:00:00",
			"2026-10-12 11:00:00",
		);
	});

	it("n'interroge pas l'occupation sans periode ni disponibleUniquement", () => {
		render(<LogementCascadeField value="" onChange={vi.fn()} />);

		expect(useOccupationPeriodeMock).toHaveBeenCalledWith(null, null);
	});

	it("désélectionne un logement devenu occupé sur la période", () => {
		useOccupationPeriodeMock.mockReturnValueOnce({
			occupes: new Set(["42"]),
			enAttente: new Set<string>(),
		});
		const onChange = vi.fn();
		render(
			<LogementCascadeField
				value="42"
				onChange={onChange}
				disponibleUniquement
				periode={{ debut: "2026-10-10 14:00:00", fin: "2026-10-12 11:00:00" }}
			/>,
		);

		expect(onChange).toHaveBeenCalledWith("");
	});
});
