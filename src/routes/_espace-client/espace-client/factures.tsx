import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
	MesFacturesPage,
	type MesFacturesSearch,
} from "#/features/portail/components/mes-factures-page";

/**
 * « Mes factures » de l'espace client (`/espace-client/factures`) — même
 * façade `/facturation/portail/factures` que le portail résident ; le rôle
 * CLIENT est déjà garanti par le layout `_espace-client`.
 */
export const Route = createFileRoute("/_espace-client/espace-client/factures")({
	validateSearch: z.object({
		statut: z.string().optional(),
		source: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: EspaceClientFacturesRoutePage,
});

function EspaceClientFacturesRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	return (
		<MesFacturesPage
			breadcrumb={[
				{ label: "Mon espace", to: "/espace-client" },
				{ label: "Mes factures" },
			]}
			retourTo="/espace-client"
			retourLabel="Retour à mon espace"
			initialSearch={initialSearch}
			onSearchChange={(maj) => {
				void navigate({ search: (prev: MesFacturesSearch) => maj(prev) });
			}}
		/>
	);
}
