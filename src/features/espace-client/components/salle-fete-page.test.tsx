import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SalleFetePage } from "./salle-fete-page";

function remplirChampsValides() {
	return {
		typeManifestation: "Mariage",
		dateEvenement: "2026-12-24",
		heureDebut: "18:00",
		duree: "5",
		nombreInvites: "80",
	};
}

/** `fireEvent.change` plutôt que `userEvent.type` : évite les soucis de saisie
    caractère par caractère sur les champs `date`/`time`/`number` en jsdom. */
function saisirFormulaire(valeurs: Record<string, string>) {
	for (const [name, valeur] of Object.entries(valeurs)) {
		const champ = document.getElementsByName(name)[0] as HTMLElement;
		fireEvent.change(champ, { target: { value: valeur } });
	}
}

describe("SalleFetePage", () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		fetchSpy = vi.spyOn(global, "fetch");
	});

	afterEach(() => {
		fetchSpy.mockRestore();
	});

	it("affiche une erreur par champ obligatoire manquant à la soumission", async () => {
		const user = userEvent.setup();
		render(<SalleFetePage />);

		await user.click(
			screen.getByRole("button", { name: /envoyer ma demande/i }),
		);

		expect(
			await screen.findByText("Le type de manifestation est requis."),
		).toBeInTheDocument();
		expect(screen.getByText("La date est requis.")).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("affiche la confirmation et désactive le bouton après une soumission valide, sans appel réseau", async () => {
		const user = userEvent.setup();
		render(<SalleFetePage />);

		saisirFormulaire(remplirChampsValides());
		await user.click(
			screen.getByRole("button", { name: /envoyer ma demande/i }),
		);

		expect(await screen.findByText("Demande enregistrée")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /demande envoyée/i }),
		).toBeDisabled();
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
