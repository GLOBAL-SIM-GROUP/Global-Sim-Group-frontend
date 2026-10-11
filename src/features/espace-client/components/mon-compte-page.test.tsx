import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { MonComptePage } from "./mon-compte-page";

const mocks = vi.hoisted(() => ({
	useCurrentUser: vi.fn(),
	motDePasseOublie: vi.fn(),
}));

vi.mock("#/core/auth", () => ({
	useCurrentUser: mocks.useCurrentUser,
}));

vi.mock("#/core/api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("#/core/api")>();
	return {
		...actual,
		authApi: {
			motDePasseOublie: mocks.motDePasseOublie,
		},
	};
});

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

function renderAvecQueryClient(ui: ReactNode) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
}

const USER = {
	login: "aya.kouassi",
	role: "CLIENT",
	idClient: "43",
	permissions: [
		"PORTAIL.VOIR",
		"RESTAURANT.COMMANDER",
		"PRESSING.DECLARER",
		"RESIDENCE.DEMANDER",
		"SIGNALEMENT.CREER",
	],
};

describe("MonComptePage", () => {
	it("affiche les informations du compte et les raccourcis", () => {
		mocks.useCurrentUser.mockReturnValue(USER);

		renderAvecQueryClient(<MonComptePage />);

		expect(screen.getByText("aya.kouassi")).toBeInTheDocument();
		expect(
			screen.getByText(/compte client · dossier n° 43/i),
		).toBeInTheDocument();
		expect(screen.getByText(/services accessibles/i)).toBeInTheDocument();
		expect(screen.getByText("Restaurant")).toBeInTheDocument();
		expect(screen.getByText("Pressing")).toBeInTheDocument();
		expect(screen.getByText("Séjours courts")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /mes demandes/i })).toHaveAttribute(
			"href",
			"/espace-client/mes-demandes",
		);
		expect(screen.getByRole("link", { name: /mon panier/i })).toHaveAttribute(
			"href",
			"/espace-client/panier",
		);
	});

	it("envoie l'email de réinitialisation au clic sur « Modifier mon mot de passe »", async () => {
		mocks.useCurrentUser.mockReturnValue(USER);
		mocks.motDePasseOublie.mockResolvedValue({ envoye: true });
		const user = userEvent.setup();

		renderAvecQueryClient(<MonComptePage />);
		await user.click(
			screen.getByRole("button", { name: /modifier mon mot de passe/i }),
		);

		expect(mocks.motDePasseOublie).toHaveBeenCalledWith({
			login: "aya.kouassi",
		});
		expect(
			await screen.findByText(/un email de réinitialisation a été envoyé/i),
		).toBeInTheDocument();
	});
});
