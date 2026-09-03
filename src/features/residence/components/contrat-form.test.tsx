import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContratForm } from "./contrat-form";

vi.mock("./logement-cascade-field", () => ({
	LogementCascadeField: ({ onChange }: { onChange: (id: string) => void }) => (
		<button type="button" onClick={() => onChange("logement-1")}>
			choisir logement
		</button>
	),
}));

const creerContratMock = vi.fn(async () => ({
	id: "contrat-1",
	numeroContrat: "GSG-CON-2026-001",
	compteResident: null,
}));
const creerCautionMock = vi.fn(async () => ({}) as unknown);

vi.mock("../hooks/use-contrats", () => ({
	useCreerContrat: () => ({ mutateAsync: creerContratMock, isPending: false }),
	useCreerCaution: () => ({ mutateAsync: creerCautionMock, isPending: false }),
}));

const clientRechercheFieldPropsMock = vi.fn();
vi.mock("./client-recherche-field", () => ({
	ClientRechercheField: (props: { onChange: (id: string) => void }) => {
		clientRechercheFieldPropsMock(props);
		return (
			<button type="button" onClick={() => props.onChange("client-1")}>
				choisir client
			</button>
		);
	},
}));

/** Remplit les champs requis puis soumet ; `caution` optionnel. */
async function remplirEtSoumettre(caution?: string) {
	fireEvent.click(screen.getByRole("button", { name: "choisir client" }));
	fireEvent.click(screen.getByRole("button", { name: "choisir logement" }));
	fireEvent.change(screen.getByLabelText("Date de début"), {
		target: { value: "2026-09-01" },
	});
	fireEvent.change(screen.getByLabelText("Montant du loyer (FCFA)"), {
		target: { value: "60000" },
	});
	if (caution !== undefined) {
		fireEvent.change(screen.getByLabelText("Caution (FCFA)"), {
			target: { value: caution },
		});
	}
	fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
}

describe("ContratForm — création de client", () => {
	it("active le formulaire complet de création du locataire", () => {
		render(<ContratForm onCancel={vi.fn()} onSaved={vi.fn()} />);

		const props = clientRechercheFieldPropsMock.mock.calls.at(-1)?.[0] as {
			creationLocataireComplete?: boolean;
		};
		expect(props.creationLocataireComplete).toBe(true);
	});
});

/**
 * La caution est optionnelle et créée par un second appel une fois le
 * contrat existant (POST /contrats/{id}/caution exige son id) : voir le
 * commentaire au-dessus de `ContratForm`.
 */
describe("ContratForm — caution", () => {
	it("ne crée pas de caution si le champ est laissé vide", async () => {
		const onSaved = vi.fn();
		creerContratMock.mockClear();
		creerCautionMock.mockClear();
		render(<ContratForm onCancel={vi.fn()} onSaved={onSaved} />);

		await remplirEtSoumettre();

		await waitFor(() => expect(onSaved).toHaveBeenCalled());
		expect(creerCautionMock).not.toHaveBeenCalled();
	});

	it("crée la caution avec l'id du contrat fraîchement créé", async () => {
		const onSaved = vi.fn();
		creerContratMock.mockClear();
		creerCautionMock.mockClear();
		render(<ContratForm onCancel={vi.fn()} onSaved={onSaved} />);

		await remplirEtSoumettre("50000");

		await waitFor(() => expect(onSaved).toHaveBeenCalled());
		expect(creerCautionMock).toHaveBeenCalledWith({
			idContrat: "contrat-1",
			montant: "50000",
		});
	});

	it("affiche un message dédié et ne ferme pas la modale si la caution échoue", async () => {
		const onSaved = vi.fn();
		creerContratMock.mockClear();
		creerCautionMock.mockClear();
		creerCautionMock.mockRejectedValueOnce(new Error("boom"));
		render(<ContratForm onCancel={vi.fn()} onSaved={onSaved} />);

		await remplirEtSoumettre("50000");

		await waitFor(() =>
			expect(
				screen.getByText(/créé, mais l'enregistrement de la caution a échoué/),
			).toBeInTheDocument(),
		);
		expect(onSaved).not.toHaveBeenCalled();
	});
});
