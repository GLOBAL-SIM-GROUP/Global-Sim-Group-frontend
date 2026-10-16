import { RestaurantCommandeDetailPage } from "#/features/portail/components/restaurant-commande-detail-page";

/**
 * Détail d'une commande restaurant de l'espace client
 * (`/espace-client/restaurant/$id`) — même page/API que le portail résident
 * ; le retour renvoie vers « Mes demandes ».
 */
export function RestaurantCommandeDetailEspacePage({ id }: { id: string }) {
	return (
		<RestaurantCommandeDetailPage
			id={id}
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
			labelListe="Restaurant"
			lienListe="/espace-client/restaurant"
			labelRetour="Retour à mes demandes"
			lienRetour="/espace-client/mes-demandes"
			className="w-full space-y-6 pt-6 pb-16"
		/>
	);
}
