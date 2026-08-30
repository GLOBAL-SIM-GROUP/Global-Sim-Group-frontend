import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PortailEtatDesLieuxPhoto } from "../models/portail";
import { PortailEtatDesLieuxPage } from "./portail-etat-des-lieux-page";

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

const photos: PortailEtatDesLieuxPhoto[] = [
	{
		id: "1",
		id_contrat: "c1",
		numero_contrat: "CT-2026-001",
		type: "ENTREE",
		piece: "Chambre",
		cle_objet: "etat-lieux/1.jpg",
		commentaire: "RAS",
		date_ajout: "2026-01-01T10:00:00Z",
	},
];

vi.mock("../hooks/use-portail", () => ({
	usePortailEtatDesLieux: () => ({
		data: photos,
		isLoading: false,
		isError: false,
		refetch: vi.fn(),
	}),
}));

const getPortailEtatDesLieuxPhotoMock = vi.fn();
vi.mock("../api/portail", () => ({
	getPortailEtatDesLieuxPhoto: (id: string) =>
		getPortailEtatDesLieuxPhotoMock(id),
}));

describe("PortailEtatDesLieuxPage", () => {
	beforeEach(() => {
		getPortailEtatDesLieuxPhotoMock.mockReset();
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL: vi.fn(() => "blob:mock-url"),
			revokeObjectURL: vi.fn(),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("liste les photos du résident avec contrat, pièce et type", () => {
		render(<PortailEtatDesLieuxPage />);

		expect(screen.getByText("Chambre")).toBeInTheDocument();
		expect(screen.getByText("Contrat CT-2026-001")).toBeInTheDocument();
		expect(screen.getByText("Entrée")).toBeInTheDocument();
	});

	it("charge l'image à la demande via la route dédiée du portail à l'ouverture", async () => {
		const blob = new Blob(["image"], { type: "image/jpeg" });
		getPortailEtatDesLieuxPhotoMock.mockResolvedValue(blob);
		const user = userEvent.setup();
		render(<PortailEtatDesLieuxPage />);

		expect(getPortailEtatDesLieuxPhotoMock).not.toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: /Voir la photo/ }));

		expect(getPortailEtatDesLieuxPhotoMock).toHaveBeenCalledWith("1");
		expect(await screen.findByAltText("Chambre")).toBeInTheDocument();
	});
});
