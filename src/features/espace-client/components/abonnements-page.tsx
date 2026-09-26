import { AbonnementsPage } from "#/features/portail/components/abonnements-page";

/**
 * « Mes abonnements » de l'espace client — même page/API que le portail
 * résident (`GET /abonnement/portail/souscriptions`, `PORTAIL.VOIR`, scopé
 * par le JWT) ; seuls les préfixes de navigation diffèrent.
 */
export function AbonnementsEspacePage() {
	return (
		<AbonnementsPage
			lienDetail="/espace-client/abonnements/$id"
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
		/>
	);
}
