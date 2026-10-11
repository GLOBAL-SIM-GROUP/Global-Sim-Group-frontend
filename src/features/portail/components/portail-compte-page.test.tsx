import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PortailComptePage } from "./portail-compte-page";

const mocks = vi.hoisted(() => ({
	useCurrentUser: vi.fn(),
	usePortailResume: vi.fn(),
	motDePasseOublie: vi.fn(),
}));

vi.mock("#/core/auth", () => ({
	useCurrentUser: mocks.useCurrentUser,
}));

vi.mock("../hooks/use-portail", () => ({
	usePortailResume: mocks.usePortailResume,
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
	login: "k.mballa",
	role: "RESIDENT",
	idClient: "12",
	permissions: [
		"PORTAIL.VOIR",
		"RESIDENT.VOIR",
		"RESTAURANT.COMMANDER",
		"PRESSING.DECLARER",
		"ABONNEMENT.SOUCRIRE",
		"SIGNALEMENT.CREER",
	],
};

const RESUME = {
	client: { id: "12", nom: "Mballa", prenoms: "Kevin" },
	contrat_en_cours: {
		id: "7",
		numero_contrat: "CON-2026-012",
		date_debut: "2026-09-01",
		date_fin_prevue: null,
		montant_loyer: "250000",
		periodicite: "Mensuelle",
		logement: { numero: "A-12", nom: "Studio meublé", batiment: "A" },
	},
	prochaine_echeance: null,
	total_impayes: "0",
};

describe("PortailComptePage", () => {
	it("affiche l'identité, le logement et les services du compte", () => {
		mocks.useCurrentUser.mockReturnValue(USER);
		mocks.usePortailResume.mockReturnValue({
			data: RESUME,
			isLoading: false,
			isError: false,
		});

		renderAvecQueryClient(<PortailComptePage />);

		expect(screen.getByText("Kevin Mballa")).toBeInTheDocument();
		expect(
			screen.getByText(/compte résident · dossier n° 12/i),
		).toBeInTheDocument();
		expect(screen.getByText(/identifiant : k\.mballa/i)).toBeInTheDocument();
		expect(screen.getByText(/votre logement/i)).toBeInTheDocument();
		expect(
			screen.getByText(/A-12 — Studio meublé \(bât\. A\)/i),
		).toBeInTheDocument();
		expect(screen.getByText("CON-2026-012")).toBeInTheDocument();
		expect(screen.getByText(/services accessibles/i)).toBeInTheDocument();
		expect(screen.getByText("Restaurant")).toBeInTheDocument();
		expect(screen.getByText("Pressing")).toBeInTheDocument();
		expect(screen.getByText("Abonnements")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /mes échéances/i }),
		).toHaveAttribute("href", "/residence/portail/echeances");
		expect(screen.getByRole("link", { name: /ma caution/i })).toHaveAttribute(
			"href",
			"/residence/portail/caution",
		);
	});

	it("reste lisible quand le résumé portail est indisponible", () => {
		mocks.useCurrentUser.mockReturnValue(USER);
		mocks.usePortailResume.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
		});

		renderAvecQueryClient(<PortailComptePage />);

		expect(screen.getByText("k.mballa")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /modifier mon mot de passe/i }),
		).toBeInTheDocument();
	});

	it("envoie l'email de réinitialisation au clic sur « Modifier mon mot de passe »", async () => {
		mocks.useCurrentUser.mockReturnValue(USER);
		mocks.usePortailResume.mockReturnValue({
			data: RESUME,
			isLoading: false,
			isError: false,
		});
		mocks.motDePasseOublie.mockResolvedValue({ envoye: true });
		const user = userEvent.setup();

		renderAvecQueryClient(<PortailComptePage />);
		await user.click(
			screen.getByRole("button", { name: /modifier mon mot de passe/i }),
		);

		expect(mocks.motDePasseOublie).toHaveBeenCalledWith({
			login: "k.mballa",
		});
		expect(
			await screen.findByText(/un email de réinitialisation a été envoyé/i),
		).toBeInTheDocument();
	});
});
