import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { Client } from "../models/clients";
import { ClientForm } from "./client-form";

const mutateAsyncClient = vi.fn();
const mutateAsyncPiece = vi.fn();
const mutateAsyncModifierPiece = vi.fn();
const mutateAsyncContact = vi.fn();

vi.mock("../hooks/use-clients", () => ({
	useCreerClient: () => ({ mutateAsync: mutateAsyncClient, isPending: false }),
	useModifierClient: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useCreerPiece: () => ({ mutateAsync: mutateAsyncPiece, isPending: false }),
	useModifierPiece: () => ({
		mutateAsync: mutateAsyncModifierPiece,
		isPending: false,
	}),
	useCreerContact: () => ({
		mutateAsync: mutateAsyncContact,
		isPending: false,
	}),
}));

const uploadImageMock = vi.fn();
vi.mock("#/core/api/uploads", () => ({
	uploadImage: (file: File, categorie: string) =>
		uploadImageMock(file, categorie),
}));

const listClientsMock = vi.fn();
vi.mock("../api/clients", () => ({
	listClients: (params: unknown) => listClientsMock(params),
}));

vi.mock("#/core/api/use-upload-blob", () => ({
	useUploadBlobUrl: (cle: string | undefined) => ({
		blobUrl: cle ? `blob:${cle}` : null,
		isLoading: false,
		error: null,
	}),
}));

// Polyfills requis par les interactions radix Select en jsdom (non
// implémentées nativement : ni hasPointerCapture ni scrollIntoView).
beforeAll(() => {
	if (!Element.prototype.hasPointerCapture) {
		Element.prototype.hasPointerCapture = () => false;
	}
	if (!Element.prototype.scrollIntoView) {
		Element.prototype.scrollIntoView = () => {};
	}
});

const clientExistant: Client = {
	id: "1",
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

/** Remplit tous les champs obligatoires du dossier locataire (hors pièce/contact). */
async function remplirChampsObligatoires(
	user: ReturnType<typeof userEvent.setup>,
) {
	await user.type(screen.getByLabelText("Nom"), "Kouassi");
	await user.type(screen.getByLabelText("Prénom(s)"), "Awa");
	await user.type(screen.getByLabelText("Téléphone principal"), "0700000000");
	fireEvent.change(screen.getByLabelText("Date de naissance"), {
		target: { value: "1990-01-01" },
	});
	await user.type(screen.getByLabelText("Lieu de naissance"), "Abidjan");
	await user.click(screen.getByRole("combobox", { name: "Sexe" }));
	await user.click(await screen.findByRole("option", { name: "Féminin" }));
	await user.type(screen.getByLabelText("Nationalité"), "Ivoirienne");
	await user.type(
		screen.getByLabelText("Profession / activité"),
		"Commerçante",
	);
	await user.type(screen.getByLabelText("Téléphone secondaire"), "0100000000");
	await user.type(screen.getByLabelText("Adresse e-mail"), "awa@example.com");
	await user.type(screen.getByLabelText("Adresse habituelle"), "Rue 12");
	await user.type(screen.getByLabelText("Ville"), "Abidjan");
	await user.type(screen.getByLabelText("Pays"), "Côte d'Ivoire");
}

function renderCreation(onSaved = vi.fn()) {
	render(
		<ClientForm
			client={null}
			typeClientCree="LOCATAIRE"
			onCancel={vi.fn()}
			onSaved={onSaved}
		/>,
	);
	return { onSaved };
}

describe("ClientForm — pièce d'identité et contact d'urgence", () => {
	beforeEach(() => {
		mutateAsyncClient.mockReset().mockResolvedValue({ id_client: "42" });
		mutateAsyncPiece.mockReset().mockResolvedValue({ id_piece: "99" });
		mutateAsyncModifierPiece.mockReset().mockResolvedValue(undefined);
		mutateAsyncContact.mockReset().mockResolvedValue(undefined);
		uploadImageMock.mockReset();
		listClientsMock.mockReset();
	});

	it("masque les sections pièce/contact en édition", () => {
		render(
			<ClientForm
				client={clientExistant}
				onCancel={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);

		expect(
			screen.queryByText("Pièce d'identité (optionnel)"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText("Contact d'urgence (optionnel)"),
		).not.toBeInTheDocument();
	});

	it("affiche les sections pièce/contact à la création", () => {
		renderCreation();

		expect(
			screen.getByText("Pièce d'identité (optionnel)"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Contact d'urgence (optionnel)"),
		).toBeInTheDocument();
	});

	it("crée le client sans pièce ni contact quand les deux sections restent vides", async () => {
		const user = userEvent.setup();
		const { onSaved } = renderCreation();
		await remplirChampsObligatoires(user);

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		await vi.waitFor(() => expect(mutateAsyncClient).toHaveBeenCalledTimes(1));
		expect(mutateAsyncPiece).not.toHaveBeenCalled();
		expect(mutateAsyncContact).not.toHaveBeenCalled();
		expect(onSaved).toHaveBeenCalledWith("42", "Kouassi Awa");
	});

	it("bloque la soumission si le numéro de la pièce est manquant alors que la section est renseignée", async () => {
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);
		await user.type(
			screen.getByLabelText("Autorité de délivrance"),
			"Préfecture d'Abidjan",
		);

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(
			await screen.findByText("Le numéro de la pièce est requis."),
		).toBeInTheDocument();
		expect(mutateAsyncClient).not.toHaveBeenCalled();
	});

	it("bloque la soumission si le contact est partiellement renseigné (nom manquant)", async () => {
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);
		await user.type(screen.getByLabelText("Adresse du contact"), "Rue 5");

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(await screen.findAllByText("Ce champ est requis.")).not.toHaveLength(
			0,
		);
		expect(mutateAsyncClient).not.toHaveBeenCalled();
	});

	it("crée la pièce d'identité et uploade les photos après la création du client", async () => {
		uploadImageMock
			.mockResolvedValueOnce("piece-identite/recto.jpg")
			.mockResolvedValueOnce("piece-identite/verso.jpg");
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);

		await user.type(screen.getByLabelText("Numéro de la pièce"), "CI-123456");
		const recto = new File(["r"], "recto.jpg", { type: "image/jpeg" });
		const verso = new File(["v"], "verso.jpg", { type: "image/jpeg" });
		await user.upload(screen.getByLabelText("Recto (photo)"), recto);
		await user.upload(screen.getByLabelText("Verso (photo)"), verso);

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		await vi.waitFor(() => expect(mutateAsyncPiece).toHaveBeenCalledTimes(1));
		expect(mutateAsyncPiece).toHaveBeenCalledWith(
			expect.objectContaining({ idClient: "42", numero: "CI-123456" }),
		);
		expect(uploadImageMock).toHaveBeenNthCalledWith(1, recto, "piece-identite");
		expect(uploadImageMock).toHaveBeenNthCalledWith(2, verso, "piece-identite");
		await vi.waitFor(() =>
			expect(mutateAsyncModifierPiece).toHaveBeenCalledWith({
				idClient: "42",
				idPiece: "99",
				copieNum: "piece-identite/recto.jpg",
				copieNumVerso: "piece-identite/verso.jpg",
			}),
		);
	});

	it("crée le contact d'urgence après la création du client", async () => {
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);

		await user.type(screen.getByLabelText("Nom du contact"), "Koffi");
		await user.type(screen.getByLabelText("Lien avec le locataire"), "Frère");
		await user.type(
			screen.getByLabelText("Téléphone du contact"),
			"0102030405",
		);

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		await vi.waitFor(() => expect(mutateAsyncContact).toHaveBeenCalledTimes(1));
		expect(mutateAsyncContact).toHaveBeenCalledWith({
			idClient: "42",
			nom: "Koffi",
			lien: "Frère",
			telPrincipal: "0102030405",
			prenom: null,
			telSecondaire: null,
			adresse: null,
			email: null,
		});
	});

	it("signale un échec de la pièce/du contact sans bloquer la création déjà réussie", async () => {
		mutateAsyncPiece.mockRejectedValue(new Error("boom"));
		const user = userEvent.setup();
		const { onSaved } = renderCreation();
		await remplirChampsObligatoires(user);
		await user.type(screen.getByLabelText("Numéro de la pièce"), "CI-999");

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		expect(
			await screen.findByText(/Client créé, mais l'ajout de la pièce/),
		).toBeInTheDocument();
		expect(onSaved).toHaveBeenCalledWith("42", "Kouassi Awa");
	});
});

describe("ClientForm — photo du client", () => {
	beforeEach(() => {
		mutateAsyncClient.mockReset().mockResolvedValue({ id_client: "42" });
		uploadImageMock.mockReset();
	});

	it("affiche le champ Photo à la création", () => {
		renderCreation();
		expect(screen.getByLabelText("Photo (optionnel)")).toBeInTheDocument();
	});

	it("affiche le champ Photo en édition", () => {
		render(
			<ClientForm
				client={clientExistant}
				onCancel={vi.fn()}
				onSaved={vi.fn()}
			/>,
		);
		expect(screen.getByLabelText("Photo (optionnel)")).toBeInTheDocument();
	});

	it("uploade la photo au choix du fichier et l'envoie avec le formulaire", async () => {
		uploadImageMock.mockResolvedValue("client-photo/awa.jpg");
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);

		const fichier = new File(["p"], "photo.jpg", { type: "image/jpeg" });
		await user.upload(screen.getByLabelText("Photo (optionnel)"), fichier);

		expect(uploadImageMock).toHaveBeenCalledWith(fichier, "client-photo");
		expect(await screen.findByAltText("Aperçu")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		await vi.waitFor(() =>
			expect(mutateAsyncClient).toHaveBeenCalledWith(
				expect.objectContaining({ photo: "client-photo/awa.jpg" }),
			),
		);
	});

	it("envoie photo: null sans fichier choisi", async () => {
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		await vi.waitFor(() =>
			expect(mutateAsyncClient).toHaveBeenCalledWith(
				expect.objectContaining({ photo: null }),
			),
		);
	});

	it("permet de retirer la photo choisie avant l'enregistrement", async () => {
		uploadImageMock.mockResolvedValue("client-photo/awa.jpg");
		const user = userEvent.setup();
		renderCreation();
		await remplirChampsObligatoires(user);

		const fichier = new File(["p"], "photo.jpg", { type: "image/jpeg" });
		await user.upload(screen.getByLabelText("Photo (optionnel)"), fichier);
		await screen.findByAltText("Aperçu");

		await user.click(
			screen.getByRole("button", { name: "Supprimer la photo" }),
		);
		expect(screen.queryByAltText("Aperçu")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Enregistrer" }));

		await vi.waitFor(() =>
			expect(mutateAsyncClient).toHaveBeenCalledWith(
				expect.objectContaining({ photo: null }),
			),
		);
	});
});
