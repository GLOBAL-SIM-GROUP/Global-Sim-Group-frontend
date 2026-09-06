import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import {
	PointageConsultationPage,
	type PointageConsultationSearch,
} from "#/features/rh/components/pointage-consultation-page";

/**
 * Pointage — Consultation (M9.2). Masqué de la navigation et de l'accès
 * direct (redirection systématique) — fonctionnalité retirée de l'UI.
 */
export const Route = createFileRoute(
	"/_authenticated/rh/pointage/consultation/",
)({
	beforeLoad: () => {
		throw redirect({ to: "/rh/employes" });
	},
	validateSearch: z.object({
		employe: z.string().optional(),
		service: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: PointageConsultationRoutePage,
});

function PointageConsultationRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: PointageConsultationSearch) => PointageConsultationSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<PointageConsultationPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
