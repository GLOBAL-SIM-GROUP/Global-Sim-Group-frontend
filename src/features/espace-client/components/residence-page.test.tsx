import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResidencePage } from "./residence-page";

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({
			to,
			children,
			...props
		}: {
			to: string;
			children?: React.ReactNode;
		}) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
	};
});

function remplirChampsValides() {
	return {
		dateArrivee: "2027-01-10",
		dateDepart: "2027-01-17",
		nombrePersonnes: "2",
	};
}

/** `fireEvent.change` plutôt que `userEvent.type` : évite les soucis de saisie
    caractère par caractère sur les champs `date`/`number` en jsdom. */
function saisirFormulaire(valeurs: Record<string, string>) {
	for (const [name, valeur] of Object.entries(valeurs)) {
		const champ = document.getElementsByName(name)[0] as HTMLElement;
		fireEvent.change(champ, { target: { value: valeur } });
	}
}

/** Choisit « Chambre » dans le Select Radix (combobox, pas un input). */
async function choisirTypeLogement(user: ReturnType<typeof userEvent.setup>) {
	await user.click(screen.getByRole("combobox", { name: /type de logement/i }));
	await user.click(screen.getByRole("option", { name: "Chambre" }));
}

describe("ResidencePage", () => {
	let fetchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		fetchSpy = vi.spyOn(global, "fetch");
		// jsdom n'implémente pas les APIs pointer utilisées par Radix Select.
		if (!Element.prototype.hasPointerCapture) {
			Element.prototype.hasPointerCapture = () => false;
		}
		if (!Element.prototype.releasePointerCapture) {
			Element.prototype.releasePointerCapture = () => {};
		}
		if (!Element.prototype.scrollIntoView) {
			Element.prototype.scrollIntoView = () => {};
		}
	});

	afterEach(() => {
		fetchSpy.mockRestore();
	});

	it("affiche une erreur par champ obligatoire manquant à la soumission", async () => {
		const user = userEvent.setup();
		render(<ResidencePage />);

		await user.click(
			screen.getByRole("button", { name: /envoyer ma demande/i }),
		);

		expect(
			await screen.findByText("Le type de logement est requis."),
		).toBeInTheDocument();
		expect(
			screen.getByText("La date d'arrivée est requis."),
		).toBeInTheDocument();
		expect(
			screen.getByText("La date de départ est requis."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Le nombre de personnes est requis."),
		).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("affiche la confirmation et désactive le bouton après une soumission valide, sans appel réseau", async () => {
		const user = userEvent.setup();
		render(<ResidencePage />);

		await choisirTypeLogement(user);
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
