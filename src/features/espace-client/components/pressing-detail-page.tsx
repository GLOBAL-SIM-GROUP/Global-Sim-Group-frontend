import { PressingCommandeDetailPage } from "#/features/portail/components/pressing-commande-detail-page";

/**
 * Détail d'une commande de pressing de l'espace client
 * (`/espace-client/pressing/$id`) — même page/API que le portail résident
 * (`PressingRecuButton`, suivi de progression, acompte / reste à payer).
 */
export function PressingDetailEspacePage({ id }: { id: string }) {
	return (
		<PressingCommandeDetailPage
			id={id}
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
			labelListe="Pressing"
			lienListe="/espace-client/pressing"
			labelRetour="Retour à la liste"
			className="w-full space-y-6 pt-6 pb-16"
		/>
	);
}
