import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	ClientsPage,
	type ClientsSearch,
} from "#/features/clients/components/clients-page";

/**
 * Locataires et clients (3.1). Filtres et page dans l'URL (filtrage côté
 * client). Page gated par `CLIENT.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/client/clients/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "CLIENT.VOIR");
	},
	validateSearch: z.object({
		recherche: z.string().optional(),
		type: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ClientsRoutePage,
});

function ClientsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: ClientsSearch) => ClientsSearch) => void =
		(maj) => {
			void navigate({ search: (prev) => maj(prev) });
		};
	return (
		<ClientsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
