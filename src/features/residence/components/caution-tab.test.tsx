import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Caution } from "../models/contrats";
import { CautionTab } from "./caution-tab";

vi.mock("./restituer-caution-form-dialog", () => ({
	RestituerCautionFormDialog: () => null,
}));

vi.mock("#/core/auth", () => ({ useCan: () => false }));

const caution: Caution = {
	id: "1",
	id_contrat: "1",
	montant: "150000.00",
	date_versement: "2026-01-01",
	payee: true,
	date_restitution: null,
	montant_restitue: null,
	retenue: null,
	motif_retenue: null,
	statut: "PAYEE",
	historique: [],
};

vi.mock("../hooks/use-contrats", () => ({
	useCaution: () => ({ data: caution, isLoading: false, isError: false }),
}));

/**
 * Même correctif que contrat-fiche-page.tsx (colonnes label/valeur empilées
 * sous `sm`, padding réduit) — `CautionTab` a sa propre copie locale de
 * `Ligne`.
 */
describe("CautionTab — responsive", () => {
	it("empile chaque ligne label/valeur sous `sm`", () => {
		render(<CautionTab idContrat="1" />);

		const montant = screen.getByText("Montant");
		const ligne = montant.parentElement;
		expect(ligne?.className).toContain("grid-cols-1");
		expect(ligne?.className).toContain("sm:grid-cols-[10rem_1fr]");
	});

	it("réduit le padding de la carte sous `sm`", () => {
		render(<CautionTab idContrat="1" />);

		const carte = screen.getByText("Montant").closest("section");
		expect(carte?.className).toContain("p-4");
		expect(carte?.className).toContain("sm:p-5");
	});

	it("affiche toujours les informations de la caution (non-régression fonctionnelle)", () => {
		render(<CautionTab idContrat="1" />);

		expect(screen.getByText("150 000 FCFA")).toBeInTheDocument();
		expect(screen.getByText("Payée")).toBeInTheDocument();
	});
});
