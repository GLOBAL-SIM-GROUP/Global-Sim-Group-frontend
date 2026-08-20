import { createFileRoute } from "@tanstack/react-router";

import { SauvegardesPage } from "#/features/admin/components/sauvegardes-page";

export const Route = createFileRoute("/_authenticated/admin/sauvegardes/")({
	component: SauvegardesPageComponent,
	meta: () => [{ title: "Sauvegardes — Administration" }],
});

function SauvegardesPageComponent() {
	return <SauvegardesPage />;
}
