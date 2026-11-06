import { Loader2, Receipt } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";

import { printCommandeRecu } from "../api/commandes";

interface RecuDepotButtonProps {
	idCommande: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "icon-sm";
	/** `false` (défaut) : bouton icône seule pour une colonne « Actions » de tableau. */
	showLabel?: boolean;
}

/**
 * Bouton « Reçu de dépôt » d'une commande pressing : disponible dès le dépôt,
 * avec ou sans acompte — distinct du reçu de facture (`DownloadReceiptIconButton`
 * / `DownloadReceiptButton`) qui n'apparaît qu'une fois la commande
 * intégralement payée. Construit depuis la commande elle-même côté backend
 * (`GET /pressing/commandes/{id}/recu`), pas depuis une facture.
 *
 * Impression directe en un clic à la largeur préférée du poste
 * (`ticket-largeur-store`) — l'autre largeur et les paramètres restent
 * accessibles via le menu du `DownloadReceiptButton`/`…IconButton` voisin.
 */
export function RecuDepotButton({
	idCommande,
	variant = "ghost",
	size = "icon-sm",
	showLabel = false,
}: RecuDepotButtonProps) {
	const [isImprimant, setIsImprimant] = useState(false);

	const handleImprimer = async () => {
		setIsImprimant(true);
		try {
			await printCommandeRecu(idCommande);
		} catch (error) {
			console.error("Erreur impression du reçu de dépôt:", error);
		} finally {
			setIsImprimant(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			title="Reçu de dépôt"
			disabled={isImprimant}
			onClick={() => void handleImprimer()}
		>
			{isImprimant ? (
				<Loader2 className="size-4 animate-spin" aria-hidden />
			) : (
				<Receipt className="size-4" aria-hidden />
			)}
			{showLabel ? (
				<span className={size === "icon-sm" ? "sr-only" : "ml-2"}>
					Reçu de dépôt
				</span>
			) : (
				<span className="sr-only">Reçu de dépôt</span>
			)}
		</Button>
	);
}
