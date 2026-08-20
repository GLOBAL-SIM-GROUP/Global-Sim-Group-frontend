import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	AuditPage,
	type AuditSearch,
} from "#/features/admin/components/audit-page";

/**
 * Historique des opérations (M11). Filtres et page dans l'URL, envoyés au
 * journal. Page gated par `ADMIN.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/admin/journal/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	validateSearch: z.object({
		utilisateur: z.string().optional(),
		module: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		recherche: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: AuditRoutePage,
});

function AuditRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: AuditSearch) => AuditSearch) => void = (
		maj,
	) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<AuditPage initialSearch={initialSearch} onSearchChange={onSearchChange} />
	);
}
