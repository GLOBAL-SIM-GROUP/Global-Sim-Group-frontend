import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { InscriptionPage } from "#/features/auth/components/inscription-page";

/**
 * Auto-inscription publique (POST /api/v1/auth/inscription — rôle CLIENT,
 * aucune permission de module). `InscriptionPage` gère elle-même la
 * restauration de session et le rebond vers `/home` si déjà connecté.
 */
export const Route = createFileRoute("/inscription")({
	validateSearch: z.object({
		next: z.string().optional(),
	}),
	component: InscriptionPage,
});
