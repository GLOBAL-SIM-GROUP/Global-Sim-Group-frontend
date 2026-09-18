import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MonComptePage } from "./mon-compte-page";

const mocks = vi.hoisted(() => ({
	useCurrentUser: vi.fn(),
}));

vi.mock("#/core/auth", () => ({
	useCurrentUser: mocks.useCurrentUser,
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
	};
});

describe("MonComptePage", () => {
	it("affiche le login du compte et les raccourcis", () => {
		mocks.useCurrentUser.mockReturnValue({
			login: "aya.kouassi",
			role: "CLIENT",
		});

		render(<MonComptePage />);

		expect(screen.getByText("aya.kouassi")).toBeInTheDocument();
		expect(screen.getByText("Compte client")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /mes demandes/i })).toHaveAttribute(
			"href",
			"/espace-client/mes-demandes",
		);
		expect(screen.getByRole("link", { name: /mon panier/i })).toHaveAttribute(
			"href",
			"/espace-client/panier",
		);
	});
});
