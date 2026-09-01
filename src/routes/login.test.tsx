import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "#/core/api";
import { LoginPage } from "./login";

const mocks = vi.hoisted(() => ({
	auth: {
		isAuthenticated: false,
		login: vi.fn<() => Promise<void>>(),
		restore: vi.fn<() => Promise<void>>(),
	},
	navigate: vi.fn<() => Promise<void>>(),
	search: { next: undefined, expired: undefined } as {
		next?: string;
		expired?: "1";
	},
}));

// Le formulaire de login est testé hors du routeur complet : on mocke
// uniquement les hooks de navigation/route, TanStack Form reste réel
// (comportement du formulaire effectivement exercé).
vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		useRouteContext: () => ({ auth: mocks.auth }),
		useNavigate: () => mocks.navigate,
		useSearch: () => mocks.search,
	};
});

async function renderLogin() {
	render(<LoginPage />);
	// Attend la fin de la « Vérification de la session… » (restauration mockée)
	// avant d'interroger le formulaire.
	await screen.findByLabelText("Identifiant");
}

beforeEach(() => {
	mocks.auth.login.mockReset();
	mocks.navigate.mockReset();
	mocks.search.next = undefined;
	mocks.search.expired = undefined;
});

describe("LoginPage", () => {
	it("affiche le formulaire en français", async () => {
		await renderLogin();

		expect(screen.getByLabelText("Identifiant")).toBeInTheDocument();
		expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Se connecter" }),
		).toBeInTheDocument();
	});

	it("bloque l’envoi si un champ est vide", async () => {
		const user = userEvent.setup();
		await renderLogin();

		await user.click(screen.getByRole("button", { name: "Se connecter" }));

		expect(await screen.findAllByText("Ce champ est requis.")).toHaveLength(2);
		expect(mocks.auth.login).not.toHaveBeenCalled();
	});

	it("mappe les erreurs backend champ par champ (VALIDATION_ERROR)", async () => {
		mocks.auth.login.mockRejectedValueOnce(
			new ApiError({
				status: 422,
				code: "VALIDATION_ERROR",
				message: "Validation échouée",
				details: [{ property: "login", messages: ["Identifiant invalide."] }],
			}),
		);
		const user = userEvent.setup();
		await renderLogin();

		await user.type(screen.getByLabelText("Identifiant"), "admin");
		await user.type(screen.getByLabelText("Mot de passe"), "motdepasse");
		await user.click(screen.getByRole("button", { name: "Se connecter" }));

		expect(
			await screen.findByText("Identifiant invalide."),
		).toBeInTheDocument();
		expect(mocks.auth.login).toHaveBeenCalledWith("admin", "motdepasse");
	});

	it("traduit le code UNAUTHORIZED en message propre à l'échec de connexion", async () => {
		// Le backend renvoie ce même code pour un mot de passe erroné ou un
		// compte désactivé (impossible à distinguer côté frontend) — le mapping
		// générique de ce code ("Session expirée, veuillez vous reconnecter.")
		// n'a pas de sens à ce stade : pas de session existante à expirer.
		mocks.auth.login.mockRejectedValueOnce(
			new ApiError({
				status: 401,
				code: "UNAUTHORIZED",
				message: "Identifiants invalides",
			}),
		);
		const user = userEvent.setup();
		await renderLogin();

		await user.type(screen.getByLabelText("Identifiant"), "admin");
		await user.type(screen.getByLabelText("Mot de passe"), "motdepasse");
		await user.click(screen.getByRole("button", { name: "Se connecter" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Identifiants invalides, ou compte désactivé. Si le problème persiste, contactez l'administrateur.",
		);
	});

	it("affiche le message générique pour un code d’erreur inconnu", async () => {
		mocks.auth.login.mockRejectedValueOnce(
			new ApiError({ status: 500, code: "INTERNE", message: "Boom" }),
		);
		const user = userEvent.setup();
		await renderLogin();

		await user.type(screen.getByLabelText("Identifiant"), "admin");
		await user.type(screen.getByLabelText("Mot de passe"), "motdepasse");
		await user.click(screen.getByRole("button", { name: "Se connecter" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Connexion impossible.",
		);
	});

	it("affiche un message quand la session a expiré (?expired=1)", async () => {
		mocks.search.expired = "1";
		await renderLogin();

		expect(
			await screen.findByText(
				"Votre session a expiré. Veuillez vous reconnecter.",
			),
		).toBeInTheDocument();
	});

	it("n'affiche pas le message d'expiration sans ?expired=1", async () => {
		await renderLogin();

		expect(
			screen.queryByText("Votre session a expiré. Veuillez vous reconnecter."),
		).not.toBeInTheDocument();
	});

	it("se connecte puis navigue vers l’accueil", async () => {
		mocks.auth.login.mockResolvedValueOnce(undefined);
		const user = userEvent.setup();
		await renderLogin();

		await user.type(screen.getByLabelText("Identifiant"), "  admin  ");
		await user.type(screen.getByLabelText("Mot de passe"), "motdepasse");
		await user.click(screen.getByRole("button", { name: "Se connecter" }));

		await waitFor(() => {
			expect(mocks.auth.login).toHaveBeenCalledWith("admin", "motdepasse");
		});
		expect(mocks.navigate).toHaveBeenCalledWith({ href: "/home" });
	});
});
