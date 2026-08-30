import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Abonnement } from "../models/abonnements";
import { AbonnementsPage } from "./abonnements-page";

/** Dialogues/tableau stubbés : hors périmètre de ce correctif responsive. */
vi.mock("./abonnement-form-dialog", () => ({
	AbonnementFormDialog: () => null,
}));
vi.mock("./abonnement-table", () => ({
	AbonnementTable: () => <div data-testid="tableau-abonnements" />,
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

const abonnement: Abonnement = {
	id: "1",
	id_client: "c1",
	id_logement: "l1",
	service: "Pressing",
	type: "MENSUEL",
	montant: "10000.00",
	date_debut: "2026-01-01",
	date_fin: null,
	montant_paye: "0.00",
	statut: "ACTIF",
	client_nom: "Koffi",
	client_prenoms: "Awa",
	numero_logement: "A-101",
};

vi.mock("../hooks/use-abonnements", () => ({
	useAbonnements: () => ({
		data: [abonnement],
		isLoading: false,
		isError: false,
	}),
	useResilierAbonnement: () => ({
		mutate: vi.fn(),
		isPending: false,
		isError: false,
		isSuccess: false,
		reset: vi.fn(),
	}),
}));

function renderPage() {
	return render(
		<AbonnementsPage initialSearch={{}} onSearchChange={() => {}} />,
	);
}

/**
 * Correctif responsive (320px et en-dessous) : les boutons d'en-tête
 * (« Catégories d'abonnement », « Nouvel abonnement ») restaient côte à côte
 * sans jamais s'empiler, et le padding de page ne se réduisait pas. jsdom
 * n'évalue pas les media queries — on verrouille donc la présence des
 * classes Tailwind responsables du comportement (cf. charges-page.test.tsx).
 */
describe("AbonnementsPage — responsive", () => {
	it("empile les boutons d'en-tête sous `sm`", () => {
		renderPage();

		const boutonCategories = screen.getByRole("link", {
			name: "Catégories d'abonnement",
		});
		const conteneur = boutonCategories.parentElement;
		expect(conteneur?.className).toContain("flex-col");
		expect(conteneur?.className).toContain("sm:flex-row");
		expect(boutonCategories.className).toContain("w-full");
		expect(boutonCategories.className).toContain("sm:w-auto");

		const boutonNouvel = screen.getByRole("button", {
			name: /Nouvel abonnement/,
		});
		expect(boutonNouvel.className).toContain("w-full");
		expect(boutonNouvel.className).toContain("sm:w-auto");
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
			screen.getByRole("heading", { name: "Abonnements" }),
		).toBeInTheDocument();
		expect(screen.getByTestId("tableau-abonnements")).toBeInTheDocument();
	});
});
