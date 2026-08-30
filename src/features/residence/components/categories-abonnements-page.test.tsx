import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AbonnementCategorie } from "../models/abonnement-categories";
import { CategoriesAbonnementsPage } from "./categories-abonnements-page";

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

vi.mock("#/core/auth", () => ({ useCan: () => true }));

const categories: AbonnementCategorie[] = [
	{ id: "1", code: "INTERNET", libelle: "Internet fibre" },
	{ id: "2", code: "EAU", libelle: "Eau" },
];

const supprimerMock = vi.fn();
vi.mock("../hooks/use-abonnement-categories", () => ({
	useAbonnementCategories: () => ({
		data: categories,
		isLoading: false,
		isError: false,
	}),
	useSupprimerAbonnementCategorie: () => ({
		mutate: supprimerMock,
		isPending: false,
	}),
	useCreerAbonnementCategorie: () => ({
		mutateAsync: vi.fn(),
		isPending: false,
	}),
	useModifierAbonnementCategorie: () => ({
		mutateAsync: vi.fn(),
		isPending: false,
	}),
}));

describe("CategoriesAbonnementsPage", () => {
	it("affiche les catégories existantes", () => {
		render(<CategoriesAbonnementsPage />);

		expect(screen.getByText("Internet fibre")).toBeInTheDocument();
		expect(screen.getByText("Eau")).toBeInTheDocument();
	});

	it("ouvre la confirmation de suppression puis appelle la mutation", async () => {
		const user = userEvent.setup();
		render(<CategoriesAbonnementsPage />);

		await user.click(screen.getAllByTitle("Supprimer")[0]);

		expect(screen.getByText("Supprimer la catégorie")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Voulez-vous vraiment supprimer la catégorie « Internet fibre » ?",
			),
		).toBeInTheDocument();

		const dialogue = screen.getByRole("dialog");
		await user.click(
			within(dialogue).getByRole("button", { name: "Supprimer" }),
		);
		expect(supprimerMock).toHaveBeenCalledWith(
			"1",
			expect.objectContaining({ onSettled: expect.any(Function) }),
		);
	});

	it("propose le bouton « Ajouter une catégorie »", () => {
		render(<CategoriesAbonnementsPage />);

		expect(
			screen.getByRole("button", { name: /Ajouter une catégorie/ }),
		).toBeInTheDocument();
	});
});
