import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientNavbar } from "./client-navbar";

vi.mock("#/core/auth", () => ({
	useAuth: () => ({ logout: vi.fn() }),
	useCurrentUser: () => ({ login: "aya.kouassi", role: "CLIENT" }),
}));

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
		useRouter: () => ({ navigate: vi.fn() }),
	};
});

describe("ClientNavbar", () => {
	it("affiche la marque et un lien vers chaque service", () => {
		render(<ClientNavbar />);

		expect(
			screen.getByRole("link", { name: /global sim group/i }),
		).toHaveAttribute("href", "/");

		for (const link of screen.getAllByRole("link", { name: /restaurant/i })) {
			expect(link).toHaveAttribute("href", "/espace-client/restaurant");
		}
		for (const link of screen.getAllByRole("link", { name: /boutique/i })) {
			expect(link).toHaveAttribute("href", "/espace-client/boutique");
		}
		for (const link of screen.getAllByRole("link", { name: /pressing/i })) {
			expect(link).toHaveAttribute("href", "/espace-client/pressing");
		}
		for (const link of screen.getAllByRole("link", {
			name: /salle de fête/i,
		})) {
			expect(link).toHaveAttribute("href", "/espace-client/salle-fete");
		}
		for (const link of screen.getAllByRole("link", { name: /résidence/i })) {
			expect(link).toHaveAttribute("href", "/espace-client/residence");
		}
	});

	it("affiche le compte utilisateur connecté", () => {
		render(<ClientNavbar />);
		expect(screen.getAllByText("aya.kouassi").length).toBeGreaterThan(0);
	});

	it("bascule le menu mobile au clic sur le bouton hamburger", async () => {
		const user = userEvent.setup();
		render(<ClientNavbar />);

		const toggle = screen.getByRole("button", { name: /ouvrir le menu/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");

		await user.click(toggle);
		expect(
			screen.getByRole("button", { name: /fermer le menu/i }),
		).toHaveAttribute("aria-expanded", "true");
	});
});
