import { AbonnementDetailPage } from "#/features/portail/components/abonnement-detail-page";

/**
 * Détail d'un abonnement de l'espace client — même page/API que le portail
 * résident ; les liens de commandes pointent vers les fiches
 * `/espace-client/...`.
 */
export function AbonnementDetailEspacePage({ id }: { id: string }) {
	return (
		<AbonnementDetailPage
			id={id}
			lienListe="/espace-client/abonnements"
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
			lienCommandePressing="/espace-client/pressing"
			lienCommandeRestaurant="/espace-client/restaurant"
		/>
	);
}
