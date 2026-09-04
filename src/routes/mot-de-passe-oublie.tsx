import { createFileRoute } from "@tanstack/react-router";

import { MotDePasseOubliePage } from "#/features/auth/components/mot-de-passe-oublie-page";

/**
 * Route publique (hors `_authenticated`) : accessible sans être connecté,
 * comme `/login`/`/inscription`.
 */
export const Route = createFileRoute("/mot-de-passe-oublie")({
	component: MotDePasseOubliePage,
});
