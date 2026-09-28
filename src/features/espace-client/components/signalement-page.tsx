import { SignalementFormPage } from "#/features/portail/components/signalement-form-page";

/**
 * Signalement de l'espace client (`/espace-client/signalement`) — déclare un
 * vrai signalement via `POST /signalements/portail` (backend 091,
 * `PORTAIL.VOIR`) ; suivi dans « Mes demandes » et sur la fiche
 * `/espace-client/signalement/$id`. Le formulaire est partagé avec le
 * portail résident (`SignalementFormPage`).
 */
export function SignalementPage() {
	return (
		<SignalementFormPage
			lienDetailBase="/espace-client/signalement"
			lienListe="/espace-client/mes-demandes"
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
		/>
	);
}
