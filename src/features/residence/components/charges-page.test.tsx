import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Charge } from "../models/charges";
import { ChargesPage } from "./charges-page";

/** Dialogues/tableau stubbés : hors périmètre de ce correctif responsive. */
vi.mock("./charge-form-dialog", () => ({ ChargeFormDialog: () => null }));
vi.mock("./payer-charge-form-dialog", () => ({
	PayerChargeFormDialog: () => null,
}));
vi.mock("./charge-table", () => ({
	ChargeTable: () => <div data-testid="tableau-charges" />,
}));

vi.mock("#/core/auth", () => ({ useCan: () => true }));

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

const charge: Charge = {
	id: "1",
	id_logement: "l1",
	id_categorie_charge: "cat1",
	periode: "2026-08",
	compteur_numero: null,
	lecture_debut: null,
	lecture_fin: null,
	consommation: null,
	montant: "25000.00",
	montant_paye: "0.00",
	reste_a_payer: "25000.00",
	statut: "IMPAYEE",
	numero_logement: "A-101",
	categorie_libelle: "Électricité",
};

vi.mock("../hooks/use-charges", () => ({
	useCharges: () => ({ data: [charge], isLoading: false, isError: false }),
	useCategoriesCharges: () => ({ data: [] }),
}));
vi.mock("../hooks/use-moyens-paiement", () => ({
	useMoyensPaiement: () => ({ data: [] }),
}));

function renderPage() {
	return render(<ChargesPage initialSearch={{}} onSearchChange={() => {}} />);
}

/**
 * Correctif responsive (320px et en-dessous) : les 3 boutons d'en-tête
 * (« Catégories de charges », « Abonnements », « Nouvelle charge »)
 * restaient côte à côte sans jamais s'empiler. jsdom n'évalue pas les media
 * queries — on verrouille donc la présence des classes Tailwind
 * responsables du comportement.
 */
describe("ChargesPage — responsive", () => {
	it("empile les boutons d'en-tête sous `sm`", () => {
		renderPage();

		const boutonAbonnements = screen.getByRole("link", {
			name: "Abonnements",
		});
		const conteneur = boutonAbonnements.parentElement;
		expect(conteneur?.className).toContain("flex-col");
		expect(conteneur?.className).toContain("sm:flex-row");
		expect(boutonAbonnements.className).toContain("w-full");
		expect(boutonAbonnements.className).toContain("sm:w-auto");

		const boutonNouvelle = screen.getByRole("button", {
			name: /Nouvelle charge/,
		});
		expect(boutonNouvelle.className).toContain("w-full");
		expect(boutonNouvelle.className).toContain("sm:w-auto");
	});

	it("réduit le padding de la page sous `sm`", () => {
		const { container } = renderPage();

		const racine = container.firstElementChild;
		expect(racine?.className).toContain("p-4");
		expect(racine?.className).toContain("sm:p-6");
	});

	it("affiche toujours la page (non-régression fonctionnelle)", () => {
		renderPage();

		expect(
			screen.getByRole("heading", { name: "Charges facturées" }),
		).toBeInTheDocument();
		expect(screen.getByTestId("tableau-charges")).toBeInTheDocument();
	});
});
