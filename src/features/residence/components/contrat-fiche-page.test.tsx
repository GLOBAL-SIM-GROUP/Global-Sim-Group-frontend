import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContratDetail } from "../models/contrats";
import { ContratFichePage } from "./contrat-fiche-page";

/**
 * Onglets remplacés par des stubs triviaux : leur contenu n'est pas affecté
 * par ce correctif (responsive de la fiche contrat elle-même) et ils
 * entraîneraient sinon `useCan`/`useMoyensPaiement`/`useCaution` (contexte
 * auth + query client complets) hors du périmètre de ce test.
 */
vi.mock("./contrat-echeances-tab", () => ({
	ContratEcheancesTab: () => <div data-testid="onglet-echeances" />,
}));
vi.mock("./caution-tab", () => ({
	CautionTab: () => <div data-testid="onglet-caution" />,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		// Rendu en simple <a> : pas de RouterProvider dans ce test isolé.
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

const contrat: ContratDetail = {
	id: "1",
	numero_contrat: "CON-2026-042",
	id_client: "c1",
	id_logement: "l1",
	date_debut: "2026-01-01",
	date_fin_prevue: "2026-12-31",
	duree_mois: 12,
	type_location: "MENSUEL",
	montant_loyer: "150000.00",
	periodicite: "Mensuelle",
	statut: "ACTIF",
	date_signature: "2025-12-20",
	echeances: [],
};

vi.mock("../hooks/use-contrats", () => ({
	useContratDetail: () => ({ data: contrat, isLoading: false, isError: false }),
}));
vi.mock("../hooks/use-clients", () => ({
	useClientsDetails: () => ({
		data: new Map([["c1", { id: "c1", nom: "KOUASSI", prenoms: "Awa" }]]),
	}),
}));
vi.mock("../hooks/use-logements", () => ({
	useLogementsParId: () => ({
		data: new Map([["l1", { numero: "A-101", nom: "Studio" }]]),
	}),
}));

/**
 * Vérifie que le correctif responsive (écrans dès 320px) est bien présent
 * dans le DOM rendu : colonnes label/valeur empilées sous `sm`, boutons
 * d'en-tête empilés sous `sm`, padding réduit sous `sm`. jsdom n'évalue pas
 * les media queries — on verrouille donc la présence des classes Tailwind
 * responsables du comportement plutôt que le layout calculé.
 */
describe("ContratFichePage — responsive", () => {
	it("empile chaque ligne label/valeur sous `sm` (grid-cols-1 → sm:grid-cols-[10rem_1fr])", () => {
		render(<ContratFichePage id="1" />);

		const numero = screen.getByText("Numéro");
		const ligne = numero.parentElement;
		expect(ligne?.className).toContain("grid-cols-1");
		expect(ligne?.className).toContain("sm:grid-cols-[10rem_1fr]");
	});

	it("empile les boutons d'en-tête sous `sm` (flex-col → sm:flex-row, w-full → sm:w-auto)", () => {
		render(<ContratFichePage id="1" />);

		const boutonRetour = screen.getByRole("link", {
			name: "Retour aux contrats",
		});
		const conteneurBoutons = boutonRetour.parentElement;
		expect(conteneurBoutons?.className).toContain("flex-col");
		expect(conteneurBoutons?.className).toContain("sm:flex-row");
		expect(boutonRetour.className).toContain("w-full");
		expect(boutonRetour.className).toContain("sm:w-auto");
	});

	it("réduit le padding de la page et de la carte d'infos sous `sm`", () => {
		const { container } = render(<ContratFichePage id="1" />);

		const racine = container.firstElementChild;
		expect(racine?.className).toContain("p-4");
		expect(racine?.className).toContain("sm:p-6");

		const carteInfos = screen.getByText("Numéro").closest("section");
		expect(carteInfos?.className).toContain("p-4");
		expect(carteInfos?.className).toContain("sm:p-5");
	});

	it("affiche toujours les informations du contrat (non-régression fonctionnelle)", () => {
		render(<ContratFichePage id="1" />);

		expect(
			screen.getByRole("heading", { name: "Fiche contrat — CON-2026-042" }),
		).toBeInTheDocument();
		expect(screen.getByText("KOUASSI Awa")).toBeInTheDocument();
		expect(screen.getByText("A-101 — Studio")).toBeInTheDocument();
		expect(screen.getByTestId("onglet-echeances")).toBeInTheDocument();
	});
});
