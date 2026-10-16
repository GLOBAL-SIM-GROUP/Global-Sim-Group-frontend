import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	MesFacturesPage,
	type MesFacturesSearch,
} from "#/features/portail/components/mes-factures-page";

/**
 * « Mes factures » du portail résident : factures de tous les services du
 * client connecté (GET /facturation/portail/factures), avec documents PDF
 * et ticket. Gated par `RESIDENT.VOIR` comme le reste du portail résident.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/factures/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	validateSearch: z.object({
		statut: z.string().optional(),
		source: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: PortailFacturesRoutePage,
});

function PortailFacturesRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<MesFacturesPage
			breadcrumb={[
				{ label: "Accueil", to: "/" },
				{ label: "Mon espace résident", to: "/residence/portail" },
				{ label: "Mes factures" },
			]}
			retourTo="/residence/portail"
			retourLabel="Retour à mon espace"
			initialSearch={initialSearch}
			onSearchChange={(maj) => {
				void navigate({ search: (prev: MesFacturesSearch) => maj(prev) });
			}}
		/>
	);
}
