import { render, screen } from "@testing-library/react";
import { Building2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { ModuleTile } from "./module-tile";

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({
			to,
			search,
			children,
			...props
		}: {
			to: string;
			search?: Record<string, string>;
			children?: React.ReactNode;
		}) => (
			<a
				href={search ? `${to}?${new URLSearchParams(search).toString()}` : to}
				{...props}
			>
				{children}
			</a>
		),
	};
});

/**
 * Carte-menu du lanceur (accueil) : en-tête non cliquable (simple libellé de
 * section), chaque sous-page listée comme un lien direct — même comportement
 * qu'un module ait 1 ou plusieurs sous-pages, et repli `/en-cours` si aucune.
 */
describe("ModuleTile", () => {
	it("affiche l'en-tête sans en faire un lien", () => {
		render(
			<ModuleTile
				icon={Building2}
				title="Résidence"
				description="Gestion des locataires, baux et maintenance."
				subItems={[
					{ id: "batiments", label: "Bâtiments", path: "/residence/batiments" },
				]}
				moduleCode="RESIDENCE"
			/>,
		);

		expect(screen.getByText("Résidence")).toBeInTheDocument();
		expect(
			screen.getByText("Gestion des locataires, baux et maintenance."),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: "Résidence" }),
		).not.toBeInTheDocument();
	});

	it("liste chaque sous-page comme un lien direct", () => {
		render(
			<ModuleTile
				icon={Building2}
				title="Résidence"
				description="…"
				subItems={[
					{ id: "batiments", label: "Bâtiments", path: "/residence/batiments" },
					{
						id: "locations",
						label: "Contrats de location",
						path: "/residence/contrats",
					},
				]}
				moduleCode="RESIDENCE"
			/>,
		);

		expect(screen.getByRole("link", { name: "Bâtiments" })).toHaveAttribute(
			"href",
			"/residence/batiments",
		);
		expect(
			screen.getByRole("link", { name: "Contrats de location" }),
		).toHaveAttribute("href", "/residence/contrats");
	});

	it("affiche un repli vers /en-cours quand aucune sous-page n'est accessible", () => {
		render(
			<ModuleTile
				icon={Building2}
				title="Résidence"
				description="…"
				subItems={[]}
				moduleCode="RESIDENCE"
			/>,
		);

		expect(
			screen.getByRole("link", { name: "Bientôt disponible" }),
		).toHaveAttribute("href", "/en-cours?module=RESIDENCE");
	});
});
