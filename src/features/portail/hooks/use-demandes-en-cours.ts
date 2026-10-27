import { usePressingCommandes } from "./use-pressing";
import { useMesCommandesRestaurant } from "./use-restaurant";
import { useMesReservationsSalleFete } from "./use-salle-fete";
import { useMesSejoursPortail } from "./use-sejours";
import { useMesVentesPortail } from "./use-supermarche";

/**
 * Demandes portail encore en cours, tous services confondus (les
 * signalements sont suivis à part dans « Mes demandes ») :
 * restaurant/super-marché tant que ni payée ni annulée, pressing tant que
 * ni retiré ni annulé, salle de fête tant que ni réalisée ni annulée,
 * séjour tant que ni terminé ni annulé. Partagé par l'accueil de
 * l'espace client et les cartes du portail résident — mêmes filtres
 * que la vue agrégée « Mes demandes ».
 */
export function useDemandesEnCours() {
	const commandesPressing = usePressingCommandes().data ?? [];
	const commandesResto = useMesCommandesRestaurant().data ?? [];
	const ventesBoutique = useMesVentesPortail().data ?? [];
	const reservationsSalleFete = useMesReservationsSalleFete().data ?? [];
	const sejours = useMesSejoursPortail().data ?? [];

	const pressingEnCours = commandesPressing.filter(
		(c) => c.statut !== "RETIRE" && c.statut !== "ANNULEE",
	);
	const totalEnCours =
		pressingEnCours.length +
		commandesResto.filter((c) => c.statut !== "PAYEE" && c.statut !== "ANNULEE")
			.length +
		ventesBoutique.filter((v) => v.statut !== "PAYEE" && v.statut !== "ANNULEE")
			.length +
		reservationsSalleFete.filter(
			(r) => r.statut !== "REALISEE" && r.statut !== "ANNULEE",
		).length +
		sejours.filter((s) => s.statut !== "TERMINE" && s.statut !== "ANNULE")
			.length;

	return { pressingEnCours, totalEnCours };
}
