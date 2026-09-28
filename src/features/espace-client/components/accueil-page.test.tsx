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
	useMesCommandesRestaurant: vi.fn(),
	useMesVentesPortail: vi.fn(),
	useMesReservationsSalleFete: vi.fn(),
	useMesSejoursPortail: vi.fn(),
	useCurrentUser: vi.fn(),
}));

const AUCUNE_DONNEE = { isLoading: false, isError: false, data: [] };

vi.mock("#/features/portail/hooks/use-pressing", () => ({
	usePressingCommandes: mocks.usePressingCommandes,
}));

vi.mock("#/features/portail/hooks/use-restaurant", () => ({
	useMesCommandesRestaurant: mocks.useMesCommandesRestaurant,
}));

vi.mock("#/features/portail/hooks/use-market", () => ({
	useMesVentesPortail: mocks.useMesVentesPortail,
}));

vi.mock("#/features/portail/hooks/use-salle-fete", () => ({
	useMesReservationsSalleFete: mocks.useMesReservationsSalleFete,
}));

vi.mock("#/features/portail/hooks/use-sejours", () => ({
	useMesSejoursPortail: mocks.useMesSejoursPortail,
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
		mocks.usePressingCommandes.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesCommandesRestaurant.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesVentesPortail.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesReservationsSalleFete.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesSejoursPortail.mockReturnValue(AUCUNE_DONNEE);

		render(<AccueilPage />);

		expect(
			screen.getByRole("heading", { level: 1, name: /aya\.kouassi/i }),
		).toBeInTheDocument();
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

	it("met en avant la commande pressing active, hors retirées/annulées", () => {
		mocks.useCurrentUser.mockReturnValue({
			login: "aya.kouassi",
			role: "CLIENT",
		});
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: commandes,
		});
		mocks.useMesCommandesRestaurant.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesVentesPortail.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesReservationsSalleFete.mockReturnValue(AUCUNE_DONNEE);
		mocks.useMesSejoursPortail.mockReturnValue(AUCUNE_DONNEE);

		render(<AccueilPage />);

		expect(screen.getByText("Suivi en direct")).toBeInTheDocument();
		expect(screen.getByText(/PR-0001/)).toBeInTheDocument();
		expect(screen.getByText("En traitement")).toBeInTheDocument();
		expect(
			screen.getByText(/Vous avez 1 demande en cours/),
		).toBeInTheDocument();
	});
});
