import { createFileRoute } from "@tanstack/react-router";

import { PressingCommandesPage } from "#/features/portail/components/pressing-commandes-page";

/**
 * Suivi Pressing de l'espace client (`/espace-client/pressing`) : mêmes
 * données/API que le portail résident (`GET /pressing/portail/commandes`)
 * via le composant partagé en `variant="client"`. Vérifié en direct
 * 2026-09-27 (compte CLIENT fraîchement inscrit) : l'endpoint répond 200,
 * gardé par `PORTAIL.VOIR` (accordé au rôle CLIENT), pas par `RESIDENT.VOIR`
 * comme le supposait un commentaire précédent ici.
 */
export const Route = createFileRoute("/_espace-client/espace-client/pressing/")(
	{
		component: PressingRoutePage,
	},
);

function PressingRoutePage() {
	return <PressingCommandesPage variant="client" />;
}
