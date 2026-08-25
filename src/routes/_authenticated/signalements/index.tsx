import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { requirePermissions } from "#/core/auth";
import {
	SignalementsPage,
	type SignalementsSearch,
} from "#/features/signalements/components/signalements-page";

export const Route = createFileRoute("/_authenticated/signalements/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "SIGNALEMENT.VOIR");
	},
	validateSearch: z.object({
		recherche: z.string().optional(),
		statut: z.string().optional(),
		sort: z.string().optional(),
		order: z.enum(["asc", "desc"]).optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: SignalementsRoutePage,
});

function SignalementsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: SignalementsSearch) => SignalementsSearch) => void = (
		maj,
	) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<SignalementsPage initialSearch={initialSearch} onSearchChange={onSearchChange} />
	);
}
