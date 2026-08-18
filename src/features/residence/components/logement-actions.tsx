import { Link } from "@tanstack/react-router";
import { Eye, Pencil } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Logement } from "../models/logements";

interface LogementActionsProps {
	logement: Logement;
	/** Modifier → ouvre la modale de formulaire en édition. */
	onEdit: (logement: Logement) => void;
}

/**
 * Actions d'une ligne logement, gated par le verbe réel `RESIDENCE.MODIFIER`
 * (édition). « Voir la fiche » (toujours visible) mène à la page dédiée
 * `/residence/logements/{id}`. Pas de bouton de résiliation ni de suppression :
 * le spec n'expose aucun endpoint réel pour ces actions.
 */
export function LogementActions({ logement, onEdit }: LogementActionsProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir la fiche">
				<Link to="/residence/logements/$id" params={{ id: logement.id }}>
					<Eye className="size-4" aria-hidden />
					<span className="sr-only">Voir la fiche</span>
				</Link>
			</Button>

			{canModifier ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Modifier"
					onClick={() => onEdit(logement)}
				>
					<Pencil className="size-4" aria-hidden />
					<span className="sr-only">Modifier</span>
				</Button>
			) : null}
		</div>
	);
}
