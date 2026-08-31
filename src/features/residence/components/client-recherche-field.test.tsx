import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientRechercheField } from "./client-recherche-field";

vi.mock("../hooks/use-clients", () => ({
	useRechercherClients: () => ({
		data: [],
		isLoading: false,
		isError: false,
	}),
}));

vi.mock("./creer-client-inline-form", () => ({
	CreerClientInlineForm: () => <div data-testid="formulaire-rapide" />,
}));

const clientFormPropsMock = vi.fn();
vi.mock("#/features/clients/components/client-form", () => ({
	ClientForm: (props: unknown) => {
		clientFormPropsMock(props);
		return <div data-testid="formulaire-complet" />;
	},
}));

async function rechercherSansResultat(
	user: ReturnType<typeof userEvent.setup>,
) {
	await user.type(screen.getByLabelText("Client"), "Introuvable");
	await screen.findByText("Aucun client trouvé.");
}

/**
 * Par défaut (formulaires pressing/restaurant/boutique/abonnement/séjour…),
 * la création inline reste le formulaire rapide minimal. Le formulaire de
 * contrat de location active `creationLocataireComplete` pour afficher le
 * formulaire complet à la place — un locataire mérite un dossier complet.
 */
describe("ClientRechercheField — création inline", () => {
	it("propose le formulaire rapide par défaut", async () => {
		const user = userEvent.setup();
		render(<ClientRechercheField value="" onChange={vi.fn()} />);
		await rechercherSansResultat(user);

		const bouton = screen.getByRole("button", { name: /Créer un client/ });
		await user.click(bouton);

		expect(screen.getByTestId("formulaire-rapide")).toBeInTheDocument();
		expect(screen.queryByTestId("formulaire-complet")).not.toBeInTheDocument();
	});

	it("propose le formulaire complet du locataire avec creationLocataireComplete", async () => {
		const user = userEvent.setup();
		render(
			<ClientRechercheField
				value=""
				onChange={vi.fn()}
				creationLocataireComplete
			/>,
		);
		await rechercherSansResultat(user);

		const bouton = screen.getByRole("button", { name: /Créer un locataire/ });
		await user.click(bouton);

		expect(screen.getByTestId("formulaire-complet")).toBeInTheDocument();
		expect(screen.queryByTestId("formulaire-rapide")).not.toBeInTheDocument();

		const props = clientFormPropsMock.mock.calls.at(-1)?.[0] as {
			client: unknown;
			typeClientCree?: string;
		};
		expect(props.client).toBeNull();
		expect(props.typeClientCree).toBe("LOCATAIRE");
	});

	it("sélectionne le client créé via le formulaire complet", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ClientRechercheField
				value=""
				onChange={onChange}
				creationLocataireComplete
			/>,
		);
		await rechercherSansResultat(user);
		await user.click(
			screen.getByRole("button", { name: /Créer un locataire/ }),
		);

		const props = clientFormPropsMock.mock.calls.at(-1)?.[0] as {
			onSaved: (id?: string, label?: string) => void;
		};
		act(() => {
			props.onSaved("42", "Kouassi Awa");
		});

		expect(onChange).toHaveBeenCalledWith("42", "Kouassi Awa");
		expect(await screen.findByText("Kouassi Awa")).toBeInTheDocument();
	});
});
