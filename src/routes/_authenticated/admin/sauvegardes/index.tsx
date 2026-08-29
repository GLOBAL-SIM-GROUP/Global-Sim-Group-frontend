import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SauvegardesPage } from "#/features/admin/components/sauvegardes-page";

export const Route = createFileRoute("/_authenticated/admin/sauvegardes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	component: SauvegardesPageComponent,
	head: () => ({ meta: [{ title: "Sauvegardes — Administration" }] }),
});

function SauvegardesPageComponent() {
	return <SauvegardesPage />;
}
