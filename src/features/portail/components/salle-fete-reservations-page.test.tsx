import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreneauOccupe } from "#/features/portail/models/salle-fete";

import { SalleFetePage } from "./salle-fete-page";

const mocks = vi.hoisted(() => ({
	useCan: vi.fn(),
	navigate: vi.fn(),
	demander: { mutate: vi.fn(), isPending: false },
	disponibilites: vi.fn(),
	reservations: vi.fn(),
}));

vi.mock("#/core/auth", async (importOriginal) => {
	const actual = await importOriginal<typeof import("#/core/auth")>();
	return { ...actual, useCan: mocks.useCan };
});

vi.mock("#/features/portail/hooks/use-salle-fete", () => ({
	useMesReservationsSalleFete: mocks.reservations,
	useDisponibilitesSalleFete: mocks.disponibilites,
	useCreerReservationSalleFete: () => mocks.demander,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		useNavigate: () => mocks.navigate,
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

function champParLabel(label: string): HTMLElement {
	const champ = document.querySelector(
		`[id="${CSS.escape(label)}"]`,
	) as HTMLElement;
	return champ;
}

function saisir(id: string, valeur: string) {
	fireEvent.change(champParLabel(id), { target: { value: valeur } });
}

function demainISO(): string {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	const mois = String(d.getMonth() + 1).padStart(2, "0");
	const jour = String(d.getDate()).padStart(2, "0");
	return `${d.getFullYear()}-${mois}-${jour}`;
}

describe("SalleFetePage", () => {
	beforeEach(() => {
		mocks.useCan.mockReturnValue(true);
		mocks.navigate.mockReset();
		mocks.demander.mutate.mockReset();
		mocks.demander.isPending = false;
		mocks.disponibilites.mockReturnValue({
			isLoading: false,
			isError: false,
			data: [],
		});
		mocks.reservations.mockReturnValue({
			isLoading: false,
			isError: false,
			data: [],
		});
	});

	it("affiche les créneaux fermes du jour comme occupés", () => {
		const creneaux: CreneauOccupe[] = [
			{
				date_evenement: "2026-12-24",
				heure_debut: "14:00",
				duree: "4",
				statut: "CONFIRMEE",
			},
		];
		mocks.disponibilites.mockReturnValue({
			isLoading: false,
			isError: false,
			data: creneaux,
		});

		render(<SalleFetePage />);

		expect(screen.getByText(/14:00 → 18:00/)).toBeInTheDocument();
		expect(screen.getByText("Occupée")).toBeInTheDocument();
	});

	it("annonce la salle libre quand aucun créneau ferme n'existe", () => {
		render(<SalleFetePage />);

		expect(screen.getByText(/la salle est libre/i)).toBeInTheDocument();
	});

	it("bloque la soumission sans heure de début", async () => {
		render(<SalleFetePage />);

		const formulaire = document.querySelector("form") as HTMLFormElement;
		fireEvent.submit(formulaire);

		expect(
			await screen.findByText(/indiquez l'heure de début/i),
		).toBeInTheDocument();
		expect(mocks.demander.mutate).not.toHaveBeenCalled();
	});

	it("envoie la demande en hors_catalogue et redirige vers le détail", async () => {
		mocks.demander.mutate.mockImplementation((_body, options) => {
			options?.onSuccess?.({ id: "42" });
		});
		render(<SalleFetePage />);

		saisir("sf-date", demainISO());
		saisir("sf-heure", "18:00");
		saisir("sf-duree", "5");
		saisir("sf-type", "Mariage");
		const formulaire = document.querySelector("form") as HTMLFormElement;
		fireEvent.submit(formulaire);

		expect(mocks.demander.mutate).toHaveBeenCalledWith(
			expect.objectContaining({
				dateEvenement: demainISO(),
				heureDebut: "18:00",
				duree: "5",
				typeManifestation: "Mariage",
			}),
			expect.anything(),
		);
		expect(mocks.navigate).toHaveBeenCalledWith({
			to: "/espace-client/salle-fete/$id",
			params: { id: "42" },
		});
	});

	it("masque le formulaire sans SALLE_FETE.DEMANDER", () => {
		mocks.useCan.mockReturnValue(false);

		render(<SalleFetePage />);

		expect(
			screen.queryByRole("button", { name: /envoyer la demande/i }),
		).not.toBeInTheDocument();
		// La consultation des créneaux reste disponible (PORTAIL.VOIR).
		expect(screen.getByText("Occupation du jour")).toBeInTheDocument();
	});
});
