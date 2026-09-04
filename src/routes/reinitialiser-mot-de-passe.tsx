import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ReinitialiserMotDePassePage } from "#/features/auth/components/reinitialiser-mot-de-passe-page";

/**
 * Route publique (hors `_authenticated`) : accessible sans être connecté,
 * atteinte via le lien envoyé par email (`?token=...`). `token` est
 * `.optional()` plutôt que requis : un lien incomplet/mal copié ne doit pas
 * planter le routeur, la page gère elle-même le cas absent avec un message
 * dédié (cf. `ReinitialiserMotDePassePage`).
 */
export const Route = createFileRoute("/reinitialiser-mot-de-passe")({
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	component: ReinitialiserMotDePassePage,
});
