import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listerDemandes } from "../models/demandes";
import { SignalementPage } from "./signalement-page";

function saisirFormulaire(valeurs: Record<string, string>) {
	for (const [name, valeur] of Object.entries(valeurs)) {
		const champ = document.getElementsByName(name)[0] as HTMLElement;
		fireEvent.change(champ, { target: { value: valeur } });
	}
}

describe("SignalementPage", () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		fetchSpy = vi.spyOn(global, "fetch");
		localStorage.clear();
	});

	afterEach(() => {
		fetchSpy.mockRestore();
	});

	it("affiche une erreur par champ obligatoire manquant à la soumission", async () => {
		const user = userEvent.setup();
		render(<SignalementPage />);

		await user.click(
			screen.getByRole("button", { name: /envoyer mon signalement/i }),
		);

		expect(await screen.findByText("Le sujet est requis.")).toBeInTheDocument();
		expect(screen.getByText("La description est requis.")).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("enregistre le signalement et désactive le formulaire, sans appel réseau", async () => {
		const user = userEvent.setup();
		render(<SignalementPage />);

		saisirFormulaire({
			sujet: "Climatiseur en panne",
			lieu: "Chambre 12",
			description: "Le climatiseur ne s'allume plus depuis hier.",
		});
		await user.click(
			screen.getByRole("button", { name: /envoyer mon signalement/i }),
		);

		expect(
			await screen.findByText("Signalement enregistré"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /signalement envoyé/i }),
		).toBeDisabled();
		const demandes = listerDemandes();
		expect(demandes).toHaveLength(1);
		expect(demandes[0].service).toBe("signalement");
		expect(demandes[0].resume).toContain("Chambre 12");
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
