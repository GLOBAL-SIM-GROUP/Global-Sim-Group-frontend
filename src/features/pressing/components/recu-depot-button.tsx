import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Loader2, Receipt, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { ParametresImpressionDialog } from "#/features/facturation/components/parametres-impression-dialog";

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
 */
export function RecuDepotButton({
	idCommande,
	variant = "ghost",
	size = "icon-sm",
	showLabel = false,
}: RecuDepotButtonProps) {
	const [isImprimant, setIsImprimant] = useState(false);
	const [menuOuvert, setMenuOuvert] = useState(false);
	const [parametresOuverts, setParametresOuverts] = useState(false);

	const handleImprimer = async (largeur: 58 | 80) => {
		setMenuOuvert(false);
		setIsImprimant(true);
		try {
			await printCommandeRecu(idCommande, largeur);
		} catch (error) {
			console.error("Erreur impression du reçu de dépôt:", error);
		} finally {
			setIsImprimant(false);
		}
	};

	return (
		<DropdownMenu.Root open={menuOuvert} onOpenChange={setMenuOuvert}>
			<DropdownMenu.Trigger asChild>
				<Button
					variant={variant}
					size={size}
					title="Reçu de dépôt"
					disabled={isImprimant}
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
			</DropdownMenu.Trigger>

			{/* Portail : même raison que dans DownloadReceiptIconButton, échapper à
			    l'empilement du tableau. */}
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className="z-50 min-w-[9rem] rounded-md border border-border bg-card shadow-md"
					sideOffset={4}
					align="end"
				>
					<DropdownMenu.Item asChild>
						<button
							type="button"
							onClick={() => void handleImprimer(58)}
							className="block w-full cursor-pointer whitespace-nowrap px-4 py-2 text-left text-sm outline-none hover:bg-accent"
						>
							Ticket 58 mm
						</button>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<button
							type="button"
							onClick={() => void handleImprimer(80)}
							className="block w-full cursor-pointer whitespace-nowrap border-t border-border px-4 py-2 text-left text-sm outline-none hover:bg-accent"
						>
							Ticket 80 mm
						</button>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<button
							type="button"
							onClick={() => {
								setMenuOuvert(false);
								setParametresOuverts(true);
							}}
							className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap border-t border-border px-4 py-2 text-left text-sm text-muted-foreground outline-none hover:bg-accent"
						>
							<Settings className="size-3.5" aria-hidden />
							Paramètres d'impression…
						</button>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>

			<ParametresImpressionDialog
				open={parametresOuverts}
				onOpenChange={setParametresOuverts}
			/>
		</DropdownMenu.Root>
	);
}
