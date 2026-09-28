import { Badge } from "#/components/ui/badge";

import {
	ETAT_LABELS,
	ETAT_VARIANT,
	type EtatSouscription,
} from "../models/abonnements";

/**
 * Badge de l'`etat` calculé d'une souscription (jamais `statut` seul : une
 * souscription `ACTIVE` peut être `EPUISEE`/`EXPIREE` en pratique).
 */
export function EtatBadge({ etat }: { etat: EtatSouscription }) {
	return (
		<Badge variant={ETAT_VARIANT[etat]}>{ETAT_LABELS[etat] ?? etat}</Badge>
	);
}
