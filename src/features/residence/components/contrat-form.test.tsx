import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContratForm } from "./contrat-form";

vi.mock("./logement-cascade-field", () => ({
	LogementCascadeField: () => <div data-testid="logement-cascade" />,
}));

vi.mock("../hooks/use-contrats", () => ({
	useCreerContrat: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const clientRechercheFieldPropsMock = vi.fn();
vi.mock("./client-recherche-field", () => ({
	ClientRechercheField: (props: unknown) => {
		clientRechercheFieldPropsMock(props);
		return <div data-testid="recherche-client" />;
	},
}));

/**
 * Le formulaire de contrat de location doit proposer le formulaire complet
 * de création d'un locataire (pas le formulaire rapide) quand aucun client
 * ne correspond à la recherche — un locataire mérite un dossier complet.
 */
describe("ContratForm — création de client", () => {
	it("active le formulaire complet de création du locataire", () => {
		render(<ContratForm onCancel={vi.fn()} onSaved={vi.fn()} />);

		const props = clientRechercheFieldPropsMock.mock.calls.at(-1)?.[0] as {
			creationLocataireComplete?: boolean;
		};
		expect(props.creationLocataireComplete).toBe(true);
	});
});
