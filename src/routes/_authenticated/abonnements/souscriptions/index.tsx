import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	SouscriptionsPage,
	type SouscriptionsSearch,
} from "#/features/abonnement/components/souscriptions-page";

/**
 * Souscriptions — Abonnements : quotas vendus, filtres dans l'URL
 * (`?reliquat=a_decider` = file des reliquats à décider, lien direct depuis
 * la sidebar). Page gated par `ABONNEMENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/abonnements/souscriptions/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ABONNEMENT.VOIR");
	},
	validateSearch: z.object({
		recherche: z.string().optional(),
		activite: z.enum(["toutes", "PRESSING", "RESTAURATION"]).optional(),
		etat: z
			.enum([
				"tous",
				"ACTIVE",
				"A_VENIR",
				"EPUISEE",
				"EXPIREE",
				"RESILIEE",
				"ANNULEE",
			])
			.optional(),
		reliquat: z.enum(["a_decider"]).optional(),
	}),
	component: SouscriptionsRoutePage,
});

function SouscriptionsRoutePage() {
	// La page feature ne connaît pas la route : valeurs initiales de l'URL +
	// moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: SouscriptionsSearch) => SouscriptionsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<SouscriptionsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
