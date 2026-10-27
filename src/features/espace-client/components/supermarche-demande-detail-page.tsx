import { BoutiqueDemandePortailDetailPage } from "#/features/portail/components/boutique-demande-detail-page";

/**
 * Détail d'une demande boutique de l'espace client
 * (`/espace-client/boutique/$id`) — même page/API que le portail résident ;
 * le retour renvoie vers « Mes demandes ».
 */
export function BoutiqueDemandeDetailEspacePage({ id }: { id: string }) {
	return (
		<BoutiqueDemandePortailDetailPage
			id={id}
			breadcrumbAccueil={{ label: "Espace client", to: "/espace-client" }}
			labelListe="Boutique"
			lienListe="/espace-client/boutique"
			labelRetour="Retour à mes demandes"
			lienRetour="/espace-client/mes-demandes"
			className="w-full space-y-6 pt-6 pb-16"
		/>
	);
}
