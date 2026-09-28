import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SignalementsPage } from "#/features/portail/components/signalements-page";

/**
 * « Mes signalements » du résident connecté (`/residence/portail/signalements`)
 * — `GET /signalements/portail`, scopé par le JWT (backend 091).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/signalements/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: SignalementsRoutePage,
});

function SignalementsRoutePage() {
	return (
		<SignalementsPage
			lienDetailBase="/residence/portail/signalements"
			lienNouveau="/residence/portail/signalements/nouveau"
			breadcrumbAccueil={{
				label: "Mon espace résident",
				to: "/residence/portail",
			}}
		/>
	);
}
