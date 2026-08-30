import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CategoriesAbonnementsPage } from "#/features/residence/components/categories-abonnements-page";

/**
 * Liste des catégories d'abonnement. Pas de search param. Page gated par
 * `RESIDENCE.VOIR` (même garde que les autres pages du module Résidence —
 * l'abonnement lui-même est un sous-module de Résidence côté UI, même si le
 * backend expose ses catégories sous un préfixe `/abonnement/` distinct).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/categories-abonnements/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	component: CategoriesAbonnementsRoutePage,
});

function CategoriesAbonnementsRoutePage() {
	return <CategoriesAbonnementsPage />;
}
