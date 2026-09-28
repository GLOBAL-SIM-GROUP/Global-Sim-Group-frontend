import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Signalement } from "#/core/api/signalements";
import type { VentePortail } from "#/features/portail/models/market";
import type { PressingCommande } from "#/features/portail/models/pressing";
import type { CommandeRestaurantPortail } from "#/features/portail/models/restaurant";
import type { ReservationPortail } from "#/features/portail/models/salle-fete";
import type { SejourPortail } from "#/features/portail/models/sejours";

import { MesDemandesPage } from "./mes-demandes-page";

const commandesPressing: PressingCommande[] = [
	{
		id: "1",
		numero_commande: "PR-0001",
		date_depot: "2026-09-01T00:00:00.000Z",
		date_retrait_prevue: "2026-09-04T00:00:00.000Z",
		date_retrait_reelle: null,
		montant_total: "5000",
		acompte: "2000",
		reste_a_payer: "3000",
		statut: "EN_TRAITEMENT",
	},
];

const commandesResto: CommandeRestaurantPortail[] = [
	{
		id: "7",
		date: "2026-09-02T12:30:00.000Z",
		type: "A_EMPORTER",
		statut: "EN_ATTENTE",
		total: "5000.00",
		notes: null,
		adresse_livraison: null,
		motif_annulation: null,
	},
];

const reservations: ReservationPortail[] = [
	{
		id: "3",
		date_evenement: "2026-12-24",
		heure_debut: "18:00",
		duree: "5",
		type_manifestation: "Mariage",
		statut: "CONFIRMEE",
		observations: null,
		motif_annulation: null,
		tarif: "150000.00",
		solde: "150000.00",
	},
];

const ventes: VentePortail[] = [
	{
		id: "9",
		date: "2026-09-03T09:15:00.000Z",
		statut: "EN_ATTENTE",
		origine: "PORTAIL",
		total: "1500.00",
		remise: "0",
		note: null,
		motif_annulation: null,
	},
];

const sejours: SejourPortail[] = [
	{
		id: "21",
		type_prestation: "NUITEE",
		id_logement: "4",
		logement: { id: "4", numero: "CH-102", type: "CHAMBRE" },
		numero_logement: "CH-102",
		date_heure_arrivee: "2026-10-02 14:00:00",
		date_heure_depart_prevue: "2026-10-05 11:00:00",
		date_heure_depart_reelle: null,
		duree: null,
		tarif: null,
		montant_total: null,
		montant_paye: "0.00",
		reste_a_payer: null,
		statut: "EN_ATTENTE",
		type_logement: "CHAMBRE",
		nombre_personnes: 2,
		observations: null,
		motif_annulation: null,
		origine: "PORTAIL",
	},
];

const signalements: Signalement[] = [
	{
		id: "33",
		titre: "Fuite d'eau — couloir B",
		description: "Flaques d'eau devant la chambre 12.",
		cible_type: "MODULE",
		id_activite: null,
		module_cible: "RESIDENCE",
		lieu: "Couloir B",
		statut: "EN_COURS",
		id_utilisateur_declarant: "9",
		id_utilisateur_traitant: "2",
		note_resolution: null,
		date_signalement: "2026-09-10T08:30:00.000Z",
		date_resolution: null,
	},
	{
		id: "34",
		titre: "Bruit nocturne",
		description: "Musique forte dans le hall après 23h.",
		cible_type: "GENERAL",
		id_activite: null,
		module_cible: null,
		lieu: null,
		statut: "RESOLU",
		id_utilisateur_declarant: "9",
		id_utilisateur_traitant: "2",
		note_resolution: "Rappel du règlement intérieur effectué.",
		date_signalement: "2026-09-05T23:10:00.000Z",
		date_resolution: "2026-09-06T09:00:00.000Z",
	},
];

const mocks = vi.hoisted(() => ({
	usePressingCommandes: vi.fn(),
	useMesCommandesRestaurant: vi.fn(),
	useMesReservationsSalleFete: vi.fn(),
	useMesVentesPortail: vi.fn(),
	useMesSejoursPortail: vi.fn(),
	useMesSignalements: vi.fn(),
}));

vi.mock("#/features/portail/hooks/use-pressing", () => ({
	usePressingCommandes: mocks.usePressingCommandes,
}));

vi.mock("#/features/portail/hooks/use-restaurant", () => ({
	useMesCommandesRestaurant: mocks.useMesCommandesRestaurant,
}));

vi.mock("#/features/portail/hooks/use-salle-fete", () => ({
	useMesReservationsSalleFete: mocks.useMesReservationsSalleFete,
}));

vi.mock("#/features/portail/hooks/use-market", () => ({
	useMesVentesPortail: mocks.useMesVentesPortail,
}));

vi.mock("#/features/portail/hooks/use-sejours", () => ({
	useMesSejoursPortail: mocks.useMesSejoursPortail,
}));

vi.mock("#/features/portail/hooks/use-signalements", () => ({
	useMesSignalements: mocks.useMesSignalements,
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

function mockQueries({
	pressing = [],
	restaurant = [],
	reservations: resas = [],
	ventes: vts = [],
	sejours: sjrs = [],
	signalements: sig = [],
}: {
	pressing?: PressingCommande[];
	restaurant?: CommandeRestaurantPortail[];
	reservations?: ReservationPortail[];
	ventes?: VentePortail[];
	sejours?: SejourPortail[];
	signalements?: Signalement[];
} = {}) {
	mocks.usePressingCommandes.mockReturnValue({
		isLoading: false,
		isError: false,
		data: pressing,
	});
	mocks.useMesCommandesRestaurant.mockReturnValue({
		isLoading: false,
		isError: false,
		data: restaurant,
	});
	mocks.useMesReservationsSalleFete.mockReturnValue({
		isLoading: false,
		isError: false,
		data: resas,
	});
	mocks.useMesVentesPortail.mockReturnValue({
		isLoading: false,
		isError: false,
		data: vts,
	});
	mocks.useMesSejoursPortail.mockReturnValue({
		isLoading: false,
		isError: false,
		data: sjrs,
	});
	mocks.useMesSignalements.mockReturnValue({
		isLoading: false,
		isError: false,
		data: sig,
	});
}

describe("MesDemandesPage", () => {
	beforeEach(() => {
		mockQueries();
	});

	it("liste les signalements avec leur statut en direct", () => {
		mockQueries({ signalements });

		render(<MesDemandesPage />);

		expect(screen.getByText("Signalements")).toBeInTheDocument();
		expect(screen.getByText("Fuite d'eau — couloir B")).toBeInTheDocument();
		expect(screen.getByText("En cours")).toBeInTheDocument();
		expect(screen.getByText("Bruit nocturne")).toBeInTheDocument();
		expect(screen.getByText("Résolu")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /fuite d'eau/i })).toHaveAttribute(
			"href",
			"/espace-client/signalement/$id",
		);
	});

	it("affiche l'état vide des signalements quand il n'y en a pas", () => {
		render(<MesDemandesPage />);

		expect(
			screen.getByText(/aucun signalement pour le moment/i),
		).toBeInTheDocument();
	});

	it("liste les commandes restaurant avec leur statut en direct", () => {
		mockQueries({ restaurant: commandesResto });

		render(<MesDemandesPage />);

		expect(screen.getByText("À emporter")).toBeInTheDocument();
		expect(screen.getByText("En attente de validation")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /à emporter/i })).toHaveAttribute(
			"href",
			"/espace-client/restaurant/$id",
		);
	});

	it("liste les dépôts pressing", () => {
		mockQueries({ pressing: commandesPressing });

		render(<MesDemandesPage />);

		expect(screen.getByText("PR-0001")).toBeInTheDocument();
		expect(screen.getByText("En traitement")).toBeInTheDocument();
	});

	it("liste les réservations de salle de fête", () => {
		mockQueries({ reservations });

		render(<MesDemandesPage />);

		expect(screen.getByText("Mariage")).toBeInTheDocument();
		expect(screen.getByText("Confirmée")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /mariage/i })).toHaveAttribute(
			"href",
			"/espace-client/salle-fete/$id",
		);
	});

	it("liste les demandes boutique avec leur statut en direct", () => {
		mockQueries({ ventes });

		render(<MesDemandesPage />);

		expect(screen.getByText("Demande n° 9")).toBeInTheDocument();
		expect(screen.getByText("En attente de validation")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /demande n° 9/i })).toHaveAttribute(
			"href",
			"/espace-client/boutique/$id",
		);
	});

	it("liste les demandes de séjour avec leur statut en direct", () => {
		mockQueries({ sejours });

		render(<MesDemandesPage />);

		expect(screen.getByText(/Nuitée — CH-102/)).toBeInTheDocument();
		expect(screen.getByText("En attente de validation")).toBeInTheDocument();
		expect(screen.getByText(/En attente de chiffrage/)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /nuitée/i })).toHaveAttribute(
			"href",
			"/espace-client/residence/$id",
		);
	});
});
