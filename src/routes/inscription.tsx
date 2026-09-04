import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { InscriptionPage } from "#/features/auth/components/inscription-page";

export const Route = createFileRoute("/inscription")({
	validateSearch: z.object({
		next: z.string().optional(),
	}),
	beforeLoad: () => {
		throw redirect({ to: "/login" });
	},
	component: InscriptionPage,
});
