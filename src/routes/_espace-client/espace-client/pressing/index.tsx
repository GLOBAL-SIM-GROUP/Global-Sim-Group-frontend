import { createFileRoute } from "@tanstack/react-router";

import { PressingPage } from "#/features/espace-client/components/pressing-page";

/**
 * Suivi Pressing de l'espace client (`/espace-client/pressing`) : mêmes
 * données/API que le portail résident (`GET /pressing/portail/commandes`).
 * Vérifié en direct 2026-09-27 (compte CLIENT fraîchement inscrit) :
 * l'endpoint répond 200, gardé par `PORTAIL.VOIR` (accordé au rôle CLIENT),
 * pas par `RESIDENT.VOIR` comme le supposait un commentaire précédent ici.
 */
export const Route = createFileRoute("/_espace-client/espace-client/pressing/")(
	{
		component: PressingPage,
	},
);
