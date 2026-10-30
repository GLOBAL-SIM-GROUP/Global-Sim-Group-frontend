import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { TarifKgPage } from "#/features/pressing/components/tarif-kg-page";

/**
 * Tarif au kilo — Pressing. Gated par `PRESSING.GERER_TARIFS` (pas
 * `PRESSING.VOIR` : réservé au Responsable pressing, pas à tout le personnel
 * du module — `PRESSING.SUPERVISER` existe au catalogue mais n'est vérifié
 * par aucun endpoint pressing, voir `core/permissions/types.ts`).
 */
export const Route = createFileRoute("/_authenticated/pressing/tarif-kg/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PRESSING.GERER_TARIFS");
	},
	component: TarifKgPage,
});
