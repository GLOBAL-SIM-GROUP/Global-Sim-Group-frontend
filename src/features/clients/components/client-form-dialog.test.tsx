import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Client } from "../models/clients";
import { ClientFormDialog } from "./client-form-dialog";

vi.mock("../hooks/use-clients", () => ({
	useCreerClient: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useModifierClient: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useCreerPiece: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useModifierPiece: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useCreerContact: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const clientExistant: Client = {
	id: "1",
	code: "GSG-CL-001",
	nom: "Kouassi",
	prenoms: "Awa",
	date_naissance: "1990-01-01",
	lieu_naissance: "Abidjan",
	sexe: "F",
	nationalite: "Ivoirienne",
	profession: "Commerçante",
	photo: null,
	tel_principal: "0700000000",
	tel_secondaire: null,
	email: null,
	adresse: null,
	ville: null,
	pays: null,
	date_enregistrement: "2026-01-01T00:00:00Z",
	type_client: "LOCATAIRE",
};

/**
 * Le formulaire complet reste inchangé, mais à la création il n'affiche
 * plus le sélecteur « Type de client » quand le type est imposé par le
 * bouton d'origine (`typeClientCree`, « Ajouter un locataire ») — le type
 * est implicite, non éditable dans ce flux. En édition, rien ne change.
 */
describe("ClientFormDialog — type imposé à la création", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("masque le sélecteur de type à la création avec typeClientCree", () => {
		render(
			<ClientFormDialog
				open
				client={null}
				typeClientCree="LOCATAIRE"
				onOpenChange={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);

		expect(screen.queryByLabelText("Type de client")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Téléphone principal")).toBeInTheDocument();
	});

	it("affiche le titre « Nouveau locataire »", () => {
		render(
			<ClientFormDialog
				open
				client={null}
				typeClientCree="LOCATAIRE"
				onOpenChange={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);

		expect(screen.getByText("Nouveau locataire")).toBeInTheDocument();
	});

	it("n'exige plus de sélectionner un type quand il est imposé", async () => {
		const user = userEvent.setup();
		render(
			<ClientFormDialog
				open
				client={null}
				typeClientCree="LOCATAIRE"
				onOpenChange={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(
			await screen.findByText("Sélectionnez une option."),
		).toBeInTheDocument();
		expect(screen.queryByText("Sélectionnez un type.")).not.toBeInTheDocument();
	});

	it("affiche toujours le sélecteur de type en édition", () => {
		render(
			<ClientFormDialog
				open
				client={clientExistant}
				onOpenChange={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);

		expect(screen.getByLabelText("Type de client")).toBeInTheDocument();
		expect(screen.getByText("Modifier le client")).toBeInTheDocument();
	});
});
