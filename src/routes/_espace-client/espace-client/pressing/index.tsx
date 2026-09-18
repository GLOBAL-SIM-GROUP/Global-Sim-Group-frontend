import { createFileRoute } from "@tanstack/react-router";

import { PressingPage } from "#/features/espace-client/components/pressing-page";

/**
 * Suivi Pressing de l'espace client (`/espace-client/pressing`) : mêmes
 * données/API que le portail résident (`GET /pressing/portail/commandes`) —
 * cet endpoint est documenté comme gardé par `RESIDENT.VOIR` côté backend,
 * pas encore ouvert à un compte CLIENT. La page fonctionnera dès que le
 * backend accordera cet accès ; en attendant elle peut renvoyer une erreur
 * 403 (gérée par l'état d'erreur de `PressingPage`).
 */
export const Route = createFileRoute("/_espace-client/espace-client/pressing/")(
	{
		component: PressingPage,
	},
);
