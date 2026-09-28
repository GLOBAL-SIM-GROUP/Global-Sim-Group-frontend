import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SignalementFormPage } from "#/features/portail/components/signalement-form-page";

/**
 * Déclaration d'un signalement par le résident
 * (`/residence/portail/signalements/nouveau`) — `POST /signalements/portail`
 * (`PORTAIL.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/signalements/nouveau",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: SignalementNouveauRoutePage,
});

function SignalementNouveauRoutePage() {
	return (
		<SignalementFormPage
			lienDetailBase="/residence/portail/signalements"
			lienListe="/residence/portail/signalements"
			breadcrumbAccueil={{
				label: "Mon espace résident",
				to: "/residence/portail",
			}}
		/>
	);
}
