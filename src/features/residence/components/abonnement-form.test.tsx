import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Abonnement } from "../models/abonnements";
import { AbonnementForm } from "./abonnement-form";

vi.mock("./client-recherche-field", () => ({
	ClientRechercheField: () => <div data-testid="recherche-client" />,
}));

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

vi.mock("../hooks/use-abonnements", () => ({
	useCreerAbonnement: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useModifierAbonnement: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const categoriesMock = vi.fn();
vi.mock("../hooks/use-abonnement-categories", () => ({
	useAbonnementCategories: () => categoriesMock(),
}));

const abonnementExistant: Abonnement = {
	id: "1",
	id_client: "c1",
	id_logement: null,
	service: "Internet fibre",
	type: "MENSUEL",
	montant: "15000.00",
	date_debut: "2026-01-01",
	date_fin: null,
	montant_paye: "0.00",
	statut: "ACTIF",
	client_nom: "KOUASSI",
	client_prenoms: "Awa",
	numero_logement: null,
};

/**
 * Le champ « Service » est passé d'une saisie libre à un sélecteur alimenté
 * par les catégories d'abonnement (module Abonnement, `/api/v1/abonnement/
 * categories`). jsdom ne simule pas fidèlement l'ouverture d'un Select radix
 * (portail, pointer capture) — on vérifie donc la structure (sélecteur
 * présent plutôt que champ texte, état vide) sans ouvrir le menu déroulant.
 */
describe("AbonnementForm — champ Service piloté par les catégories", () => {
	it("remplace le champ texte libre par un sélecteur", () => {
		categoriesMock.mockReturnValue({
			data: [{ id: "1", libelle: "Internet fibre" }],
			isLoading: false,
		});
		render(
			<AbonnementForm abonnement={null} onCancel={vi.fn()} onSaved={vi.fn()} />,
		);

		const champService = screen.getByLabelText("Service (catégorie)");
		expect(champService).toHaveAttribute("role", "combobox");
	});

	it("affiche une invite quand aucune catégorie n'est configurée", () => {
		categoriesMock.mockReturnValue({ data: [], isLoading: false });
		render(
			<AbonnementForm abonnement={null} onCancel={vi.fn()} onSaved={vi.fn()} />,
		);

		expect(screen.getByText(/Aucune catégorie configurée/)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "ajoutez-en une" }),
		).toHaveAttribute("href", "/residence/categories-abonnements");
	});

	it("n'affiche pas l'invite pendant le chargement des catégories", () => {
		categoriesMock.mockReturnValue({ data: undefined, isLoading: true });
		render(
			<AbonnementForm abonnement={null} onCancel={vi.fn()} onSaved={vi.fn()} />,
		);

		expect(
			screen.queryByText(/Aucune catégorie configurée/),
		).not.toBeInTheDocument();
	});

	it("n'affiche pas l'invite dès qu'au moins une catégorie existe", () => {
		categoriesMock.mockReturnValue({
			data: [{ id: "1", libelle: "Internet fibre" }],
			isLoading: false,
		});
		render(
			<AbonnementForm abonnement={null} onCancel={vi.fn()} onSaved={vi.fn()} />,
		);

		expect(
			screen.queryByText(/Aucune catégorie configurée/),
		).not.toBeInTheDocument();
	});

	it("édition : conserve un service qui ne correspond plus à aucune catégorie active", () => {
		// La catégorie liée à l'abonnement existant a été supprimée depuis.
		categoriesMock.mockReturnValue({
			data: [{ id: "2", libelle: "Eau" }],
			isLoading: false,
		});
		render(
			<AbonnementForm
				abonnement={abonnementExistant}
				onCancel={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);

		// La valeur d'origine reste affichée dans le trigger (Radix double le
		// rendu — span visible + <select> natif caché synchronisé — d'où
		// getAllByText plutôt que getByText).
		expect(screen.getAllByText("Internet fibre").length).toBeGreaterThan(0);
		expect(
			screen.getByRole("combobox", { name: "Service (catégorie)" }),
		).toHaveTextContent("Internet fibre");
	});
});
