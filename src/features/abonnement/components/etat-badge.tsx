import { cn } from "#/lib/utils";

import {
	ETAT_BADGE_CLASSES,
	ETAT_LABELS,
	type EtatSouscription,
} from "../models/abonnements";

/**
 * Badge de l'`etat` calculé d'une souscription (jamais `statut` seul : une
 * souscription `ACTIVE` peut être `EPUISEE`/`EXPIREE` en pratique).
 */
export function EtatBadge({ etat }: { etat: EtatSouscription }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
				ETAT_BADGE_CLASSES[etat] ?? ETAT_BADGE_CLASSES.A_VENIR,
			)}
		>
			{ETAT_LABELS[etat] ?? etat}
		</span>
	);
}
