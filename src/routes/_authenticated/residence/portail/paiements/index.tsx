import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	PortailPaiementsPage,
	type PortailPaiementsSearch,
} from "#/features/portail/components/portail-paiements-page";

/**
 * Mon historique de paiements (M2.5). Filtres période/type dans l'URL. Page
 * gated par `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/paiements/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
		type: z.string().optional(),
	}),
	component: PortailPaiementsRoutePage,
});

function PortailPaiementsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: PortailPaiementsSearch) => PortailPaiementsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<PortailPaiementsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
