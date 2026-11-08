import { SuperMarcheDemandePortailDetailPage } from "#/features/portail/components/supermarche-demande-detail-page";

/**
 * Détail d'une demande Supermarché de l'espace client
 * (`/espace-client/supermarche/$id`) — même page/API que le portail résident ;
 * le retour renvoie vers « Mes demandes ».
 */
export function SuperMarcheDemandeDetailEspacePage({ id }: { id: string }) {
	return (
		<SuperMarcheDemandePortailDetailPage
			id={id}
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
			labelListe="Supermarché"
			lienListe="/espace-client/supermarche"
			labelRetour="Retour à mes demandes"
			lienRetour="/espace-client/mes-demandes"
			className="w-full space-y-6 pt-6 pb-16"
		/>
	);
}
