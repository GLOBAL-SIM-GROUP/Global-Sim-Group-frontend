import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ClientDetail } from "../models/clients";
import { ClientFichePage } from "./client-fiche-page";

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

vi.mock("./client-form-dialog", () => ({ ClientFormDialog: () => null }));

vi.mock("../hooks/use-clients", () => ({
	useClient: () => ({ data: clientDetail, isLoading: false, isError: false }),
	useCreerContact: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useCreerPiece: () => ({ mutateAsync: vi.fn(), isPending: false }),
	useModifierPiece: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const blobUrlMock = vi.fn();
vi.mock("#/core/api/use-upload-blob", () => ({
	useUploadBlobUrl: (cle: string | null | undefined) => blobUrlMock(cle),
}));

const clientDetail: ClientDetail = {
	id: "1",
	code: "GSG-CL-001",
	nom: "Kouassi",
	prenoms: "Awa",
	date_naissance: null,
	lieu_naissance: null,
	sexe: null,
	nationalite: null,
	profession: null,
	photo: "client-photo/abc.jpg",
	tel_principal: "0700000000",
	tel_secondaire: null,
	email: null,
	adresse: null,
	ville: null,
	pays: null,
	date_enregistrement: "2026-01-01T00:00:00Z",
	type_client: "LOCATAIRE",
	contacts: [],
	pieces: [],
};

/**
 * Avatar du client (catégorie MinIO `client-photo`) affiché en tête de
 * fiche : image si une photo est enregistrée, silhouette par défaut sinon.
 */
describe("ClientFichePage — photo du client", () => {
	it("affiche la photo enregistrée", () => {
		blobUrlMock.mockReturnValue({
			blobUrl: "blob:mock-url",
			isLoading: false,
			error: null,
		});

		render(<ClientFichePage id="1" />);

		expect(blobUrlMock).toHaveBeenCalledWith("client-photo/abc.jpg");
		const image = screen.getByAltText("Awa Kouassi") as HTMLImageElement;
		expect(image.src).toContain("blob:mock-url");
	});

	it("affiche une silhouette par défaut sans photo enregistrée", () => {
		blobUrlMock.mockReturnValue({
			blobUrl: null,
			isLoading: false,
			error: null,
		});

		render(<ClientFichePage id="1" />);

		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});
});
