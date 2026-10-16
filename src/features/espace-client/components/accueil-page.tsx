import { PortailPage } from "#/features/portail/components/portail-page";

/**
 * Accueil de l'espace client (`/espace-client`) — même page que le portail
 * résident en `variant="client"` : salutation, vignette « en direct »
 * (première demande pressing active) et bento des services. Le bloc
 * locatif (échéances/caution, `RESIDENT.VOIR`) n'est pas rendu — un compte
 * CLIENT n'a pas de contrat.
 */
export function AccueilPage() {
	return <PortailPage variant="client" />;
}
