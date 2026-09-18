import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PressingCommande } from "#/features/portail/models/pressing";

import { PressingPage } from "./pressing-page";

const commandes: PressingCommande[] = [
	{
		id: "1",
		numero_commande: "PR-0001",
		date_depot: "2026-09-01T00:00:00.000Z",
		date_retrait_prevue: "2026-09-04T00:00:00.000Z",
		date_retrait_reelle: null,
		montant_total: "5000",
		acompte: "2000",
		reste_a_payer: "3000",
		statut: "EN_TRAITEMENT",
	},
];

const mocks = vi.hoisted(() => ({
	usePressingCommandes: vi.fn(),
}));

vi.mock("#/features/portail/hooks/use-pressing", () => ({
	usePressingCommandes: mocks.usePressingCommandes,
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

describe("PressingPage", () => {
	it("affiche la liste des commandes avec statut et progression", () => {
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: commandes,
		});

		render(<PressingPage />);

		expect(screen.getByText("PR-0001")).toBeInTheDocument();
		expect(screen.getByText("En traitement")).toBeInTheDocument();
		expect(screen.getByText("50%")).toBeInTheDocument();
	});

	it("affiche un message quand il n'y a aucune commande", () => {
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: [],
		});

		render(<PressingPage />);

		expect(
			screen.getByText("Aucune commande de pressing pour le moment."),
		).toBeInTheDocument();
	});

	it("affiche une erreur avec un bouton réessayer", () => {
		const refetch = vi.fn();
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: true,
			data: undefined,
			refetch,
		});

		render(<PressingPage />);

		expect(
			screen.getByText("Impossible de charger vos commandes de pressing."),
		).toBeInTheDocument();
	});
});
