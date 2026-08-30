import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientSimpleFormDialog } from "./client-simple-form-dialog";

const mutateAsyncMock = vi.fn();
vi.mock("../hooks/use-clients", () => ({
	useCreerClient: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

function ouvrir() {
	const onOpenChange = vi.fn();
	const onSaved = vi.fn();
	render(
		<ClientSimpleFormDialog
			open
			onOpenChange={onOpenChange}
			onSaved={onSaved}
		/>,
	);
	return { onOpenChange, onSaved };
}

/**
 * Formulaire minimal « Ajouter un client » (type PASSAGE) : nom + téléphone
 * requis, prénoms optionnel — le strict nécessaire pour attacher une
 * commande (pressing, restaurant, boutique), sans les champs du dossier
 * locataire complet (naissance, pièce d'identité, adresse…).
 */
describe("ClientSimpleFormDialog", () => {
	beforeEach(() => {
		mutateAsyncMock.mockReset();
	});

	it("n'affiche que Nom, Prénom(s) et Téléphone", () => {
		ouvrir();

		expect(screen.getByLabelText("Nom")).toBeInTheDocument();
		expect(screen.getByLabelText(/Prénom\(s\)/)).toBeInTheDocument();
		expect(screen.getByLabelText("Téléphone")).toBeInTheDocument();
		expect(
			screen.queryByLabelText(/Date de naissance/),
		).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/Adresse/)).not.toBeInTheDocument();
	});

	it("refuse la soumission sans nom ni téléphone", async () => {
		const user = userEvent.setup();
		ouvrir();

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(await screen.findAllByText("Ce champ est requis.")).toHaveLength(2);
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});

	it("crée un client de type PASSAGE avec juste nom et téléphone", async () => {
		mutateAsyncMock.mockResolvedValue(undefined);
		const user = userEvent.setup();
		const { onSaved } = ouvrir();

		await user.type(screen.getByLabelText("Nom"), "Kouassi");
		await user.type(screen.getByLabelText("Téléphone"), "+2250700000000");
		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			nom: "Kouassi",
			prenoms: "",
			telPrincipal: "+2250700000000",
			typeClient: "PASSAGE",
		});
		expect(onSaved).toHaveBeenCalled();
	});

	it("inclut les prénoms quand ils sont saisis", async () => {
		mutateAsyncMock.mockResolvedValue(undefined);
		const user = userEvent.setup();
		ouvrir();

		await user.type(screen.getByLabelText("Nom"), "Kouassi");
		await user.type(screen.getByLabelText(/Prénom\(s\)/), "Awa");
		await user.type(screen.getByLabelText("Téléphone"), "0700000000");
		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(mutateAsyncMock).toHaveBeenCalledWith(
			expect.objectContaining({ prenoms: "Awa" }),
		);
	});
});
