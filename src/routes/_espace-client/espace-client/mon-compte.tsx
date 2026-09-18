import { createFileRoute } from "@tanstack/react-router";

import { MonComptePage } from "#/features/espace-client/components/mon-compte-page";

/**
 * « Mon compte » de l'espace client (`/espace-client/mon-compte`) : fiche
 * de compte en lecture seule (login, rôle — seuls champs exposés par
 * `/auth/me`), cf. `MonComptePage`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/mon-compte",
)({
	component: MonComptePage,
});
