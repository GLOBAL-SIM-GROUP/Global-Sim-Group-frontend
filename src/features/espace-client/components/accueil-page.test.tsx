import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PressingCommande } from "#/features/portail/models/pressing";

import { AccueilPage } from "./accueil-page";

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
	{
		id: "2",
		numero_commande: "PR-0002",
		date_depot: "2026-08-01T00:00:00.000Z",
		date_retrait_prevue: "2026-08-04T00:00:00.000Z",
		date_retrait_reelle: "2026-08-04T00:00:00.000Z",
		montant_total: "3000",
		acompte: "3000",
		reste_a_payer: "0",
		statut: "RETIRE",
	},
];

const mocks = vi.hoisted(() => ({
	usePressingCommandes: vi.fn(),
	useCurrentUser: vi.fn(),
}));

vi.mock("#/features/portail/hooks/use-pressing", () => ({
	usePressingCommandes: mocks.usePressingCommandes,
}));

vi.mock("#/core/auth", () => ({
	useCurrentUser: mocks.useCurrentUser,
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

describe("AccueilPage", () => {
	it("affiche le salut personnalisé et un raccourci vers chaque service", () => {
		mocks.useCurrentUser.mockReturnValue({
			login: "aya.kouassi",
			role: "CLIENT",
		});
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: [],
		});

		render(<AccueilPage />);

		expect(screen.getByText(/aya\.kouassi/i)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /^restaurant/i })).toHaveAttribute(
			"href",
			"/espace-client/restaurant",
		);
		expect(screen.getByRole("link", { name: /^boutique/i })).toHaveAttribute(
			"href",
			"/espace-client/boutique",
		);
		expect(screen.getByRole("link", { name: /^pressing/i })).toHaveAttribute(
			"href",
			"/espace-client/pressing",
		);
		expect(
			screen.getByRole("link", { name: /^salle de fête/i }),
		).toHaveAttribute("href", "/espace-client/salle-fete");
		expect(screen.getByRole("link", { name: /^résidence/i })).toHaveAttribute(
			"href",
			"/espace-client/residence",
		);
		expect(
			screen.getByRole("link", { name: /^mes demandes/i }),
		).toHaveAttribute("href", "/espace-client/mes-demandes");
	});

	it("résume les commandes pressing en cours, hors retirées/annulées", () => {
		mocks.useCurrentUser.mockReturnValue({
			login: "aya.kouassi",
			role: "CLIENT",
		});
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: commandes,
		});

		render(<AccueilPage />);

		expect(
			screen.getByText(/1 commande pressing en cours/),
		).toBeInTheDocument();
	});
});
