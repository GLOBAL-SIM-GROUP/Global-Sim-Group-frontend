import { Eye, X } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { VenteJoin } from "../models/ventes";

interface VenteActionsProps {
	vente: VenteJoin;
	/** Voir la facture → ouvre la modale du détail. */
	onVoirFacture: (vente: VenteJoin) => void;
	/** Annuler → confirmé par la page (POST annuler, administrateur). */
	onAnnuler: (vente: VenteJoin) => void;
}

/**
 * Actions d'une ligne vente. « Voir la facture » toujours visible ; « Annuler »
 * gated par le verbe réel `MARCHANDISE.SUPPRIMER` (réservé à l'administrateur)
 * et masqué pour une vente déjà annulée. « Export PDF/Excel » omis (aucun
 * endpoint).
 */
export function VenteActions({
	vente,
	onVoirFacture,
	onAnnuler,
}: VenteActionsProps) {
	const canSupprimer = useCan("MARCHANDISE.SUPPRIMER");

	return (
		<div className="flex items-center justify-end gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				title="Voir la facture"
				onClick={() => onVoirFacture(vente)}
			>
				<Eye className="size-4" aria-hidden />
				<span className="sr-only">Voir la facture</span>
			</Button>

			{canSupprimer && vente.statut !== "ANNULEE" ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Annuler la vente"
					onClick={() => onAnnuler(vente)}
				>
					<X className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Annuler la vente</span>
				</Button>
			) : null}
		</div>
	);
}
