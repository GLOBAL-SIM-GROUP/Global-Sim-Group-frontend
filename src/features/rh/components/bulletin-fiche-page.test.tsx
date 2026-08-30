import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PaieDetail } from "../models/paies";
import { BulletinFichePage } from "./bulletin-fiche-page";

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

vi.mock("#/core/auth", () => ({ useCan: () => false }));
vi.mock("#/features/residence/hooks/use-moyens-paiement", () => ({
	useMoyensPaiement: () => ({ data: [] }),
}));

const paieDetail: PaieDetail = {
	paie: {
		id: "1",
		id_employe: "e1",
		periode: "2026-08",
		salaire_base: "150000.00",
		total_elements: "0.00",
		total_retenues: "0.00",
		montant_a_payer: "150000.00",
		statut: "CALCULEE",
		id_paiement: null,
		employe_nom: "KOUASSI",
		employe_prenom: "Awa",
	},
	elements: [],
};

vi.mock("../hooks/use-paies", () => ({
	usePaie: () => ({ data: paieDetail, isLoading: false, isError: false }),
	useAjouterElementPaie: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useRecalculerPaie: () => ({ mutate: vi.fn(), isPending: false }),
	useValiderPaie: () => ({ mutate: vi.fn(), isPending: false }),
	usePayerPaie: () => ({ mutate: vi.fn(), isPending: false }),
	useAnnulerPaie: () => ({ mutate: vi.fn(), isPending: false }),
}));

const telechargerPaiePdfMock = vi.fn();
vi.mock("../api/paies", () => ({
	telechargerPaiePdf: (id: string) => telechargerPaiePdfMock(id),
}));

describe("BulletinFichePage — téléchargement PDF", () => {
	beforeEach(() => {
		telechargerPaiePdfMock.mockReset();
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL: vi.fn(() => "blob:mock-url"),
			revokeObjectURL: vi.fn(),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("propose le bouton « Télécharger le PDF »", () => {
		render(<BulletinFichePage id="1" />);

		expect(
			screen.getByRole("button", { name: /Télécharger le PDF/ }),
		).toBeInTheDocument();
	});

	it("appelle telechargerPaiePdf avec l'id du bulletin au clic", async () => {
		telechargerPaiePdfMock.mockResolvedValue(new Blob(["%PDF"]));
		const user = userEvent.setup();
		render(<BulletinFichePage id="1" />);

		await user.click(
			screen.getByRole("button", { name: /Télécharger le PDF/ }),
		);

		expect(telechargerPaiePdfMock).toHaveBeenCalledWith("1");
	});

	it("affiche un message d'erreur si le téléchargement échoue", async () => {
		telechargerPaiePdfMock.mockRejectedValue(new Error("boom"));
		const user = userEvent.setup();
		render(<BulletinFichePage id="1" />);

		await user.click(
			screen.getByRole("button", { name: /Télécharger le PDF/ }),
		);

		expect(
			await screen.findByText("Impossible de télécharger le bulletin."),
		).toBeInTheDocument();
	});
});
