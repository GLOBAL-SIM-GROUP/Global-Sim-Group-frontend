import { Link } from "@tanstack/react-router";
import { Barcode, Boxes, Pencil, Scale } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Produit } from "../models/produits";

interface ProduitActionsProps {
	produit: Produit;
	/** Modifier → ouvre la modale de formulaire. */
	onEdit: (produit: Produit) => void;
	/** Code-barres → ouvre le dialogue générer/afficher/imprimer l'étiquette. */
	onCodeBarre: (produit: Produit) => void;
	/** Corriger le stock → ouvre la modale d'écrasement (`CORRIGER_STOCK`). */
	onCorrigerStock: (produit: Produit) => void;
}

/**
 * Actions d'une ligne produit, gated par le verbe réel `MARCHANDISE.MODIFIER`
 * (édition). « Voir le stock » mène à la page des mouvements. « Code-barres »
 * reste visible sans la permission modifier (lecture de l'étiquette possible
 * avec VOIR seul) — seule la génération à l'intérieur est gated.
 * « Corriger le stock » requiert `MARCHANDISE.CORRIGER_STOCK`
 * (ADMINISTRATEUR/DIRIGEANT — pas le responsable magasin).
 */
export function ProduitActions({
	produit,
	onEdit,
	onCodeBarre,
	onCorrigerStock,
}: ProduitActionsProps) {
	const canModifier = useCan("MARCHANDISE.MODIFIER");
	const canCorrigerStock = useCan("MARCHANDISE.CORRIGER_STOCK");

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir le stock">
				<Link to="/supermarche/mouvements">
					<Boxes className="size-4" aria-hidden />
					<span className="sr-only">Voir le stock</span>
				</Link>
			</Button>

			<Button
				variant="ghost"
				size="icon-sm"
				title="Code-barres"
				onClick={() => onCodeBarre(produit)}
			>
				<Barcode className="size-4" aria-hidden />
				<span className="sr-only">Code-barres</span>
			</Button>

			{canCorrigerStock ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Corriger le stock"
					onClick={() => onCorrigerStock(produit)}
				>
					<Scale className="size-4" aria-hidden />
					<span className="sr-only">Corriger le stock</span>
				</Button>
			) : null}

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
