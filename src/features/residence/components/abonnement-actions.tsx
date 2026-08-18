import { Pencil, X } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Abonnement } from "../models/abonnements";

interface AbonnementActionsProps {
	abonnement: Abonnement;
	/** Modifier → ouvre la modale d'édition. */
	onEdit: (abonnement: Abonnement) => void;
	/** Résilier → confirmé par la page (POST resilier). */
	onResilier: (abonnement: Abonnement) => void;
}

/**
 * Actions d'une ligne abonnement, gated par le verbe réel `RESIDENCE.MODIFIER`
 * (modification et résiliation — endpoint `POST /abonnements/{id}/resilier`).
 */
export function AbonnementActions({
	abonnement,
	onEdit,
	onResilier,
}: AbonnementActionsProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");

	return (
		<div className="flex items-center justify-end gap-1">
			{canModifier ? (
				<>
					<Button
						variant="ghost"
						size="icon-sm"
						title="Modifier"
						onClick={() => onEdit(abonnement)}
					>
						<Pencil className="size-4" aria-hidden />
						<span className="sr-only">Modifier</span>
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						title="Résilier"
						onClick={() => onResilier(abonnement)}
					>
						<X className="size-4 text-destructive" aria-hidden />
						<span className="sr-only">Résilier</span>
					</Button>
				</>
			) : null}
		</div>
	);
}
