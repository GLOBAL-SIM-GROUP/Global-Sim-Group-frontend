import { PortailComptePage } from "#/features/portail/components/portail-compte-page";

/**
 * « Mon compte » de l'espace client (`/espace-client/mon-compte`) — même
 * page que celle du portail résident (`PortailComptePage`) en variante
 * client : identité `/auth/me`, services accessibles, mot de passe, sans le
 * bloc locatif ni le résumé portail (`RESIDENT.VOIR` absent côté client).
 */
export function MonComptePage() {
	return <PortailComptePage variant="client" />;
}
