import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomePage } from "#/features/dashboard/components/home-page";

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

const mocks = vi.hoisted(() => ({
	can: new Set<string>(),
	permissions: [] as string[],
}));

vi.mock("#/core/auth", () => ({
	useCurrentUser: () => ({ login: "admin" }),
	useCan: (code: string) => mocks.can.has(code),
	usePermissions: () => mocks.permissions,
}));

/**
 * Accueil = menu global : chaque module accessible liste directement ses
 * sous-pages, en un clic, sans passer par la sidebar. Vérifie aussi que le
 * rendu ne plante pas (l'ancien code appelait `usePermissions()` dans un
 * `.map()`, une violation des règles des Hooks).
 */
describe("HomePage", () => {
	it("affiche une carte par module accessible, avec ses sous-pages en liens directs", () => {
		mocks.can.clear();
		mocks.permissions = ["RESIDENCE.VOIR", "CLIENT.VOIR"];

		render(<HomePage />);

		expect(screen.getByText("Résidence")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Bâtiments" })).toHaveAttribute(
			"href",
			"/residence/batiments",
		);
		expect(
			screen.getByRole("link", { name: "Contrats de location" }),
		).toHaveAttribute("href", "/residence/contrats");

		expect(screen.getByText("Clients")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Locataires et clients" }),
		).toHaveAttribute("href", "/client/clients");
	});

	it("n'affiche pas la carte résident sans RESIDENT.VOIR", () => {
		mocks.can.clear();
		mocks.permissions = ["RESIDENCE.VOIR"];

		render(<HomePage />);

		expect(screen.queryByText("Mon espace résident")).not.toBeInTheDocument();
	});

	it("affiche la carte résident avec ses sous-pages, Signalements inclus si accessible", () => {
		mocks.can.clear();
		mocks.can.add("RESIDENT.VOIR");
		mocks.can.add("SIGNALEMENT.VOIR");
		mocks.permissions = [];

		render(<HomePage />);

		expect(screen.getByText("Mon espace résident")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Mes échéances" })).toHaveAttribute(
			"href",
			"/residence/portail/echeances",
		);
		expect(screen.getByRole("link", { name: "Signalements" })).toHaveAttribute(
			"href",
			"/signalements",
		);
	});

	it("n'affiche pas Signalements sans SIGNALEMENT.VOIR", () => {
		mocks.can.clear();
		mocks.can.add("RESIDENT.VOIR");
		mocks.permissions = [];

		render(<HomePage />);

		expect(
			screen.queryByRole("link", { name: "Signalements" }),
		).not.toBeInTheDocument();
	});

	it("pointe la facturation ponctuelle vers la page réellement routée", () => {
		mocks.can.clear();
		mocks.permissions = ["FACTURATION.VOIR"];

		render(<HomePage />);

		expect(
			screen.getByRole("link", { name: "Facturation ponctuelle" }),
		).toHaveAttribute("href", "/facturation/factures");
	});
});
