import { Link } from "@tanstack/react-router";
import { Eye, Pencil, Power, PowerOff, Trash2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Batiment } from "../models/batiments";

interface BuildingActionsProps {
	batiment: Batiment;
	onToggle: (batiment: Batiment) => void;
	onEdit: (batiment: Batiment) => void;
	onDelete: (batiment: Batiment) => void;
}

/**
 * Actions d'une ligne bâtiment, gated par les verbes de permission réels :
 * `RESIDENCE.MODIFIER` (édition, bascule) et `RESIDENCE.SUPPRIMER`
 * (suppression). Un utilisateur sans le verbe ne voit pas le bouton.
 * L'édition ouvre la modale de formulaire (pas de route dédiée).
 */
export function BuildingActions({
	batiment,
	onToggle,
	onEdit,
	onDelete,
}: BuildingActionsProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canSupprimer = useCan("RESIDENCE.SUPPRIMER");

	return (
		<div className="flex items-center justify-end gap-1">
			{/* Voir les logements → liste des logements du bâtiment (M2.2). Le
			    bâtiment est passé en query, paramètre réel du lister. */}
			<Button variant="ghost" size="icon-sm" asChild>
				<Link
					to="/residence/logements"
					search={{ batiment: batiment.id }}
					title="Voir les logements"
				>
					<Eye className="size-4" aria-hidden />
					<span className="sr-only">Voir les logements</span>
				</Link>
			</Button>

			{canModifier ? (
				<>
					{/* Modifier → ouvre la modale d'édition. Le bâtiment est passé tel
					    quel par la ligne (déjà en mémoire) — pas de GET par id dans le
					    spec. */}
					<Button
						variant="ghost"
						size="icon-sm"
						title="Modifier"
						onClick={() => onEdit(batiment)}
					>
						<Pencil className="size-4" aria-hidden />
						<span className="sr-only">Modifier</span>
					</Button>

					<Button
						variant="ghost"
						size="icon-sm"
						title={batiment.actif ? "Désactiver" : "Activer"}
						onClick={() => onToggle(batiment)}
					>
						{batiment.actif ? (
							<PowerOff className="size-4" aria-hidden />
						) : (
							<Power className="size-4" aria-hidden />
						)}
						<span className="sr-only">
							{batiment.actif ? "Désactiver" : "Activer"}
						</span>
					</Button>
				</>
			) : null}

			{canSupprimer ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Supprimer"
					onClick={() => onDelete(batiment)}
				>
					<Trash2 className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Supprimer</span>
				</Button>
			) : null}
		</div>
	);
}
