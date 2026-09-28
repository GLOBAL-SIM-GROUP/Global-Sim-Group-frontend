import { SignalementDetailPage } from "#/features/portail/components/signalement-detail-page";

/**
 * Fiche d'un signalement de l'espace client
 * (`/espace-client/signalement/$id`) — lecture seule : statut, suivi, note
 * de résolution et photos. 404 backend si le signalement appartient à un
 * autre client.
 */
export function SignalementDetailEspacePage({ id }: { id: string }) {
	return (
		<SignalementDetailPage
			id={id}
			lienListe="/espace-client/mes-demandes"
			labelRetour="Retour à mes demandes"
			breadcrumbAccueil={{
				label: "Espace client",
				to: "/espace-client",
			}}
			className="w-full space-y-6 pt-6 pb-16"
		/>
	);
}
