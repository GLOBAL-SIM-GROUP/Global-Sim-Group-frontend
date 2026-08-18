import { Link } from "@tanstack/react-router";
import { Boxes, Pencil } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Produit } from "../models/produits";

interface ProduitActionsProps {
	produit: Produit;
	/** Modifier → ouvre la modale de formulaire. */
	onEdit: (produit: Produit) => void;
}

/**
 * Actions d'une ligne produit, gated par le verbe réel `MARCHANDISE.MODIFIER`
 * (édition). « Voir le stock » mène à la page des mouvements.
 */
export function ProduitActions({ produit, onEdit }: ProduitActionsProps) {
	const canModifier = useCan("MARCHANDISE.MODIFIER");

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir le stock">
				<Link to="/marchandise/mouvements">
					<Boxes className="size-4" aria-hidden />
					<span className="sr-only">Voir le stock</span>
				</Link>
			</Button>

			{canModifier ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Modifier"
					onClick={() => onEdit(produit)}
				>
					<Pencil className="size-4" aria-hidden />
					<span className="sr-only">Modifier</span>
				</Button>
			) : null}
		</div>
	);
}
