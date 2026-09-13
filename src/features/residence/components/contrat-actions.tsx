import { Link } from "@tanstack/react-router";
import { Eye, Pencil, Play } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { ContratJoin } from "../models/contrats";

interface ContratActionsProps {
	contrat: ContratJoin;
	/** « Activer » (contrats EN_ATTENTE) → confirmé par la page. */
	onActiver?: (contrat: ContratJoin) => void;
	/** « Modifier » (contrats EN_ATTENTE) → modale d'édition de la page. */
	onModifier?: (contrat: ContratJoin) => void;
}

/**
 * Actions d'une ligne contrat. « Voir la fiche » (toujours visible) mène à
 * `/residence/contrats/{id}`. « Modifier » et « Activer » n'apparaissent que
 * pour un contrat `EN_ATTENTE` (verbe `RESIDENCE.MODIFIER`). Pas de bouton
 * Résilier / Générer les échéances : résiliation depuis la fiche, échéances
 * générées à la création.
 */
export function ContratActions({
	contrat,
	onActiver,
	onModifier,
}: ContratActionsProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir la fiche">
				<Link to="/residence/contrats/$id" params={{ id: contrat.id }}>
					<Eye className="size-4" aria-hidden />
					<span className="sr-only">Voir la fiche</span>
				</Link>
			</Button>

			{canModifier && onModifier && contrat.statut === "EN_ATTENTE" ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Modifier le contrat"
					onClick={() => onModifier(contrat)}
				>
					<Pencil className="size-4" aria-hidden />
					<span className="sr-only">Modifier le contrat</span>
				</Button>
			) : null}

			{canModifier && onActiver && contrat.statut === "EN_ATTENTE" ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Activer le contrat"
					onClick={() => onActiver(contrat)}
				>
					<Play className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Activer le contrat</span>
				</Button>
			) : null}
		</div>
	);
}
