import { SalleFeteReservationDetailPage } from "#/features/portail/components/salle-fete-reservation-detail-page";

/**
 * Détail d'une réservation de salle de fête de l'espace client
 * (`/espace-client/salle-fete/$id`) — même page/API que le portail résident
 * ; le retour renvoie vers « Mes demandes ».
 */
export function SalleFeteReservationDetailEspacePage({ id }: { id: string }) {
	return (
		<SalleFeteReservationDetailPage
			id={id}
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
			labelListe="Salle de fête"
			lienListe="/espace-client/salle-fete"
			labelRetour="Retour à mes demandes"
			lienRetour="/espace-client/mes-demandes"
			className="w-full space-y-6 pt-6 pb-16"
		/>
	);
}
