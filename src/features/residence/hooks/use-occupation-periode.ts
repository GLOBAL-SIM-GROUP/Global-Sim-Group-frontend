import { useMemo } from "react";

import {
	idsLogementsDemandesSurPeriode,
	idsLogementsOccupesSurPeriode,
} from "../models/occupation";
import { useContrats } from "./use-contrats";
import { useSejours } from "./use-sejours";

/**
 * Occupation des logements sur `[debut, fin[` — reproduit côté staff le filtre
 * du catalogue portail : `GET /residence/logements` n'accepte pas de dates
 * (params ignorés, vérifié) et le staff n'a pas `PORTAIL.VOIR`, donc le même
 * résultat est recomposé depuis `GET /residence/sejours?statut=EN_COURS`,
 * `?statut=EN_ATTENTE` et `GET /residence/contrats` (statut `ACTIF`).
 *
 * `debut`/`fin` au format backend `YYYY-MM-DD HH:MM:SS` (ou datetime-local) ;
 * requêtes désactivées tant que la période est incomplète.
 */
export function useOccupationPeriode(
	debut: string | null | undefined,
	fin: string | null | undefined,
) {
	const actif = Boolean(debut && fin);
	const sejoursEnCours = useSejours({ statut: "EN_COURS" }, actif);
	const sejoursEnAttente = useSejours({ statut: "EN_ATTENTE" }, actif);
	const contrats = useContrats(actif);

	return useMemo(() => {
		if (!actif || !debut || !fin) {
			return { occupes: new Set<string>(), enAttente: new Set<string>() };
		}
		return {
			occupes: idsLogementsOccupesSurPeriode(
				sejoursEnCours.data ?? [],
				(contrats.data ?? []).filter((contrat) => contrat.statut === "ACTIF"),
				debut,
				fin,
			),
			enAttente: idsLogementsDemandesSurPeriode(
				sejoursEnAttente.data ?? [],
				debut,
				fin,
			),
		};
	}, [
		actif,
		debut,
		fin,
		sejoursEnCours.data,
		sejoursEnAttente.data,
		contrats.data,
	]);
}
