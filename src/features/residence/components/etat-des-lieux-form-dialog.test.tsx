import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EtatDesLieuxFormDialog } from "./etat-des-lieux-form-dialog";

const uploadImageMock = vi.fn();
vi.mock("#/core/api/uploads", () => ({
	uploadImage: (file: File, categorie: string) =>
		uploadImageMock(file, categorie),
}));

const mutateAsyncMock = vi.fn();
vi.mock("../hooks/use-etat-des-lieux", () => ({
	useAjouterEtatDesLieux: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

function ouvrir() {
	const onOpenChange = vi.fn();
	const onSaved = vi.fn();
	render(
		<EtatDesLieuxFormDialog
			open
			idContrat="c1"
			onOpenChange={onOpenChange}
			onSaved={onSaved}
		/>,
	);
	return { onOpenChange, onSaved };
}

describe("EtatDesLieuxFormDialog", () => {
	beforeEach(() => {
		uploadImageMock.mockReset();
		mutateAsyncMock.mockReset();
	});

	it("refuse la soumission sans fichier sélectionné", async () => {
		const user = userEvent.setup();
		ouvrir();

		await user.click(screen.getByRole("button", { name: /Ajouter/ }));

		expect(
			await screen.findByText("Veuillez sélectionner un fichier."),
		).toBeInTheDocument();
		expect(uploadImageMock).not.toHaveBeenCalled();
	});

	it("uploade le fichier puis lie la photo au contrat", async () => {
		uploadImageMock.mockResolvedValue("etat-lieux/abc.jpg");
		mutateAsyncMock.mockResolvedValue(undefined);
		const user = userEvent.setup();
		const { onSaved } = ouvrir();

		const fichier = new File(["contenu"], "photo.jpg", {
			type: "image/jpeg",
		});
		await user.upload(screen.getByLabelText("Fichier"), fichier);

		await user.type(screen.getByLabelText(/Pièce/), "Chambre");
		await user.type(screen.getByLabelText(/Commentaire/), "RAS");

		await user.click(screen.getByRole("button", { name: /Ajouter/ }));

		expect(uploadImageMock).toHaveBeenCalledWith(fichier, "etat-lieux");
		expect(mutateAsyncMock).toHaveBeenCalledWith({
			idContrat: "c1",
			type: "ENTREE",
			piece: "Chambre",
			cle_objet: "etat-lieux/abc.jpg",
			commentaire: "RAS",
		});
		expect(onSaved).toHaveBeenCalled();
	});

	it("affiche une erreur de validation si la pièce dépasse 100 caractères", async () => {
		const user = userEvent.setup();
		ouvrir();

		const fichier = new File(["contenu"], "photo.jpg", {
			type: "image/jpeg",
		});
		await user.upload(screen.getByLabelText("Fichier"), fichier);
		await user.type(screen.getByLabelText(/Pièce/), "a".repeat(101));
		await user.click(screen.getByRole("button", { name: /Ajouter/ }));

		expect(
			await screen.findByText("100 caractères maximum."),
		).toBeInTheDocument();
		expect(uploadImageMock).not.toHaveBeenCalled();
	});

	it("affiche le message d'erreur d'`uploadImage` si l'upload échoue", async () => {
		uploadImageMock.mockRejectedValue(
			new Error("L'image ne doit pas dépasser 5 Mo."),
		);
		const user = userEvent.setup();
		ouvrir();

		const fichier = new File(["contenu"], "photo.jpg", {
			type: "image/jpeg",
		});
		await user.upload(screen.getByLabelText("Fichier"), fichier);
		await user.click(screen.getByRole("button", { name: /Ajouter/ }));

		expect(
			await screen.findByText("L'image ne doit pas dépasser 5 Mo."),
		).toBeInTheDocument();
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});
});
