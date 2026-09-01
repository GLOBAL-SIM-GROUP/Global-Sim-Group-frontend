import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientsPage } from "./clients-page";

const clientFormDialogPropsMock = vi.fn();
vi.mock("./client-form-dialog", () => ({
	ClientFormDialog: (props: unknown) => {
		clientFormDialogPropsMock(props);
		return null;
	},
}));

const clientSimpleFormDialogPropsMock = vi.fn();
vi.mock("./client-simple-form-dialog", () => ({
	ClientSimpleFormDialog: (props: unknown) => {
		clientSimpleFormDialogPropsMock(props);
		return null;
	},
}));

vi.mock("#/core/auth", () => ({ useCan: () => true }));

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

const useClientsMock = vi.fn(() => ({
	data: [] as unknown[],
	isLoading: false,
	isError: false,
}));
vi.mock("../hooks/use-clients", () => ({
	useClients: () => useClientsMock(),
}));

function renderPage() {
	return render(<ClientsPage initialSearch={{}} onSearchChange={() => {}} />);
}

/**
 * Deux boutons de création distincts : « Ajouter un locataire » (formulaire
 * complet, `ClientFormDialog` avec `typeClientCree="LOCATAIRE"`) et
 * « Ajouter un client » (formulaire minimal `ClientSimpleFormDialog`, type
 * PASSAGE) — remplacent l'ancien bouton unique restreint au type AUTRE.
 */
describe("ClientsPage — deux flux de création", () => {
	it("affiche les deux boutons de création", () => {
		renderPage();

		expect(
			screen.getByRole("button", { name: /Ajouter un locataire/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Ajouter un client/ }),
		).toBeInTheDocument();
	});

	it("ouvre le formulaire complet avec typeClientCree=LOCATAIRE au clic sur « Ajouter un locataire »", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(
			screen.getByRole("button", { name: /Ajouter un locataire/ }),
		);

		const dernierAppel = clientFormDialogPropsMock.mock.calls[
			clientFormDialogPropsMock.mock.calls.length - 1
		][0] as { open: boolean; typeClientCree?: string };
		expect(dernierAppel.open).toBe(true);
		expect(dernierAppel.typeClientCree).toBe("LOCATAIRE");

		const dernierAppelSimple = clientSimpleFormDialogPropsMock.mock.calls[
			clientSimpleFormDialogPropsMock.mock.calls.length - 1
		][0] as { open: boolean };
		expect(dernierAppelSimple.open).toBe(false);
	});

	it("ouvre le formulaire minimal au clic sur « Ajouter un client »", async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole("button", { name: /Ajouter un client/ }));

		const dernierAppelSimple = clientSimpleFormDialogPropsMock.mock.calls[
			clientSimpleFormDialogPropsMock.mock.calls.length - 1
		][0] as { open: boolean };
		expect(dernierAppelSimple.open).toBe(true);

		const dernierAppel = clientFormDialogPropsMock.mock.calls[
			clientFormDialogPropsMock.mock.calls.length - 1
		][0] as { open: boolean };
		expect(dernierAppel.open).toBe(false);
	});
});

/** Colonne CODE : référence lisible du client (ex. GSG-CL-001, filtrable côté API via `?code=`). */
describe("ClientsPage — colonne Code", () => {
	it("affiche le code du client dans le tableau", () => {
		useClientsMock.mockReturnValueOnce({
			data: [
				{
					id: "1",
					code: "GSG-CL-001",
					nom: "Kouassi",
					prenoms: "Awa",
					type_client: "LOCATAIRE",
					tel_principal: "0700000000",
					ville: "Abidjan",
					date_enregistrement: "2026-01-01T00:00:00Z",
				},
			],
			isLoading: false,
			isError: false,
		});

		renderPage();

		expect(screen.getByText("GSG-CL-001")).toBeInTheDocument();
		expect(
			screen.getByRole("columnheader", { name: "CODE" }),
		).toBeInTheDocument();
	});
});
