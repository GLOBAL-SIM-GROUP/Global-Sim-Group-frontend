import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LandingPage } from "./landing-page";

/**
 * Sections alimentées par TanStack Query remplacées par des stubs : hors du
 * périmètre de ce test (elles nécessiteraient un QueryClient complet) et
 * déjà couvertes par leurs propres pages.
 */
vi.mock("./landing-dishes", () => ({
	LandingDishes: () => <section data-testid="section-carte" />,
}));
vi.mock("./landing-products", () => ({
	LandingProducts: () => <section data-testid="section-boutique" />,
}));

vi.mock("#/core/auth", () => ({
	useAuth: () => ({ isAuthenticated: false, restore: vi.fn() }),
	useCurrentUser: () => null,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		// Rendu en simple <a> : pas de RouterProvider dans ce test isolé.
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
		useNavigate: () => vi.fn(),
		useRouter: () => ({ invalidate: vi.fn() }),
	};
});

describe("LandingPage", () => {
	it("affiche les sections principales et les CTAs d'inscription", () => {
		render(<LandingPage />);

		// Hero : proposition de valeur client externe.
		expect(
			screen.getByRole("heading", { level: 1, name: /un seul compte/i }),
		).toBeInTheDocument();
		expect(
			screen.getAllByRole("button", { name: /créer mon compte/i }).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByRole("button", { name: /s'inscrire/i }).length,
		).toBeGreaterThan(0);

		// Sections d'ancrage : services, carte, boutique, fonctionnement.
		// (« Nos services » apparaît aussi dans le footer → getAllByRole.)
		expect(
			screen.getAllByRole("heading", { name: /nos services/i }).length,
		).toBeGreaterThan(0);
		expect(screen.getByTestId("section-carte")).toBeInTheDocument();
		expect(screen.getByTestId("section-boutique")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /comment ça marche/i }),
		).toBeInTheDocument();
	});

	it("expose les cinq usages transactionnels", () => {
		render(<LandingPage />);

		for (const titre of [
			"Restaurant",
			"Boutique",
			"Pressing",
			"Salle de fête",
			"Résidence",
		]) {
			expect(
				screen.getAllByRole("heading", { name: titre }).length,
			).toBeGreaterThan(0);
		}
	});
});
