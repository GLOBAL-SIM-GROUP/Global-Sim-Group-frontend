import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EtatDesLieuxPhoto } from "../models/etat-des-lieux";
import { EtatDesLieuxTab } from "./etat-des-lieux-tab";

const permissions = vi.hoisted(() => ({
	"CLIENT.MODIFIER": true,
	"RESIDENCE.MODIFIER": true,
}));

vi.mock("#/core/auth", () => ({
	useCan: (code: keyof typeof permissions) => permissions[code] ?? false,
}));

vi.mock("#/core/api/use-upload-blob", () => ({
	useUploadBlobUrl: (key: string | null | undefined) => ({
		blobUrl: key ? `blob:${key}` : null,
		isLoading: false,
		error: null,
	}),
}));

vi.mock("./etat-des-lieux-form-dialog", () => ({
	EtatDesLieuxFormDialog: () => null,
}));

const photos: EtatDesLieuxPhoto[] = [
	{
		id: "1",
		id_contrat: "c1",
		type: "ENTREE",
		piece: "Chambre",
		cle_objet: "etat-lieux/1.jpg",
		commentaire: "RAS",
		id_utilisateur: "u1",
		date_ajout: "2026-01-01T10:00:00Z",
	},
];

const useEtatDesLieuxMock = vi.fn(
	(_idContrat: string, _type: string | undefined) => ({
		data: photos,
		isLoading: false,
		isError: false,
	}),
);
const supprimerMock = vi.fn();

vi.mock("../hooks/use-etat-des-lieux", () => ({
	useEtatDesLieux: (idContrat: string, type: string | undefined) =>
		useEtatDesLieuxMock(idContrat, type),
	useSupprimerEtatDesLieux: () => ({
		mutate: supprimerMock,
		isPending: false,
	}),
}));

describe("EtatDesLieuxTab", () => {
	beforeEach(() => {
		permissions["CLIENT.MODIFIER"] = true;
		permissions["RESIDENCE.MODIFIER"] = true;
		useEtatDesLieuxMock.mockClear();
		supprimerMock.mockReset();
	});

	it("affiche les photos avec pièce, type et date", () => {
		render(<EtatDesLieuxTab idContrat="c1" />);

		expect(screen.getByText("Chambre")).toBeInTheDocument();
		expect(screen.getByText("RAS")).toBeInTheDocument();
		const badges = screen.getAllByText("Entrée");
		expect(badges.length).toBeGreaterThan(1);
	});

	it("filtre par type au clic sur l'onglet Sortie", async () => {
		const user = userEvent.setup();
		render(<EtatDesLieuxTab idContrat="c1" />);

		expect(useEtatDesLieuxMock).toHaveBeenLastCalledWith("c1", undefined);

		await user.click(screen.getByRole("tab", { name: "Sortie" }));

		expect(useEtatDesLieuxMock).toHaveBeenLastCalledWith("c1", "SORTIE");
	});

	it("masque le bouton « Ajouter une photo » sans les deux permissions requises", () => {
		permissions["CLIENT.MODIFIER"] = false;
		render(<EtatDesLieuxTab idContrat="c1" />);

		expect(
			screen.queryByRole("button", { name: /Ajouter une photo/ }),
		).not.toBeInTheDocument();
	});

	it("affiche le bouton « Ajouter une photo » avec les deux permissions", () => {
		render(<EtatDesLieuxTab idContrat="c1" />);

		expect(
			screen.getByRole("button", { name: /Ajouter une photo/ }),
		).toBeInTheDocument();
	});

	it("supprime une photo après confirmation", async () => {
		const user = userEvent.setup();
		render(<EtatDesLieuxTab idContrat="c1" />);

		await user.click(
			screen.getByRole("button", { name: "Supprimer la photo" }),
		);

		await screen.findByText(
			"Voulez-vous vraiment supprimer cette photo d'état des lieux ? Cette action est irréversible.",
		);
		await user.click(screen.getByRole("button", { name: "Supprimer" }));

		expect(supprimerMock).toHaveBeenCalledWith(
			"1",
			expect.objectContaining({ onSettled: expect.any(Function) }),
		);
	});

	it("masque le bouton de suppression sans RESIDENCE.MODIFIER", () => {
		permissions["RESIDENCE.MODIFIER"] = false;
		render(<EtatDesLieuxTab idContrat="c1" />);

		expect(
			screen.queryByRole("button", { name: "Supprimer la photo" }),
		).not.toBeInTheDocument();
	});
});
