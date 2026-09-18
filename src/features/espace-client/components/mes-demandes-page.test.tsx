import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PressingCommande } from "#/features/portail/models/pressing";

import { enregistrerDemande } from "../models/demandes";
import { MesDemandesPage } from "./mes-demandes-page";

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

describe("MesDemandesPage", () => {
	beforeEach(() => {
		localStorage.clear();
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: [],
		});
	});

	it("affiche les demandes enregistrées localement avec leur statut", () => {
		enregistrerDemande({
			service: "residence",
			resume: "Chambre — du 2027-01-10 au 2027-01-17, 2 personne(s)",
		});

		render(<MesDemandesPage />);

		expect(screen.getByText("Résidence — séjour court")).toBeInTheDocument();
		expect(
			screen.getByText("Chambre — du 2027-01-10 au 2027-01-17, 2 personne(s)"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Envoyée — en attente de réponse"),
		).toBeInTheDocument();
	});

	it("propose les formulaires quand aucune demande n'est enregistrée", () => {
		render(<MesDemandesPage />);

		expect(
			screen.getByText(/aucune demande pour le moment/i),
		).toBeInTheDocument();
	});

	it("liste les dépôts pressing", () => {
		mocks.usePressingCommandes.mockReturnValue({
			isLoading: false,
			isError: false,
			data: commandes,
		});

		render(<MesDemandesPage />);

		expect(screen.getByText("PR-0001")).toBeInTheDocument();
		expect(screen.getByText("En traitement")).toBeInTheDocument();
	});
});
