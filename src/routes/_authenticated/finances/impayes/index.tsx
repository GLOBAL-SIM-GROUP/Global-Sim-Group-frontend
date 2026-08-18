import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	ImpayesPage,
	type ImpayesSearch,
} from "#/features/finances/components/impayes-page";

/**
 * Impayés (M8). Le type vit dans l'URL. Page gated par `FINANCES.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/finances/impayes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	validateSearch: z.object({
		type: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ImpayesRoutePage,
});

function ImpayesRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: ImpayesSearch) => ImpayesSearch) => void =
		(maj) => {
			void navigate({ search: (prev) => maj(prev) });
		};
	return (
		<ImpayesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
