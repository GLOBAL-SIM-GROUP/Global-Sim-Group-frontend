import { FileDown, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import type { FactureSourceType } from "#/core/api/facturation";
import { printFacturePdf, printFactureTicket } from "#/core/api/facturation";
import { useFindFacture } from "#/core/api/hooks/use-factures";

interface DownloadReceiptButtonProps {
	sourceType: FactureSourceType;
	idClient: string | null;
	montantTotal?: string;
	isPaid: boolean;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
	showLabel?: boolean;
}

/**
 * Bouton réutilisable pour télécharger le reçu/facture d'une transaction.
 * Cherche automatiquement la facture PAYEE associée. Propose le PDF complet
 * ou un ticket de caisse (58/80mm, choix de la largeur au moment du clic).
 */
export function DownloadReceiptButton({
	sourceType,
	idClient,
	montantTotal,
	isPaid,
	variant = "outline",
	size = "sm",
	showLabel = true,
}: DownloadReceiptButtonProps) {
	const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
	const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);
	const [showTicketOptions, setShowTicketOptions] = useState(false);
	const { data: facture, isLoading } = useFindFacture(
		sourceType,
		idClient,
		montantTotal,
	);

	// Ne pas afficher si:
	// - La transaction n'est pas payée
	// - Pas de facture trouvée
	// - Pas de client
	if (!isPaid || !facture || !idClient) {
		return null;
	}

	const handlePrintPdf = async () => {
		setIsDownloadingPdf(true);
		try {
			await printFacturePdf(facture.id);
		} catch (error) {
			console.error("Erreur impression:", error);
		} finally {
			setIsDownloadingPdf(false);
		}
	};

	const handlePrintTicket = async (largeur: 58 | 80) => {
		setIsDownloadingTicket(true);
		try {
			await printFactureTicket(facture.id, largeur);
			setShowTicketOptions(false);
		} catch (error) {
			console.error("Erreur impression ticket:", error);
		} finally {
			setIsDownloadingTicket(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				onClick={() => void handlePrintPdf()}
				disabled={isLoading || isDownloadingPdf || isDownloadingTicket}
				variant={variant}
				size={size}
			>
				{isDownloadingPdf ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<FileDown className="size-4" />
				)}
				{showLabel && (
					<span className="ml-2">
						{isDownloadingPdf ? "Préparation..." : "Reçu PDF"}
					</span>
				)}
			</Button>

			<div className="relative">
				<Button
					onClick={() => setShowTicketOptions(!showTicketOptions)}
					disabled={isLoading || isDownloadingPdf || isDownloadingTicket}
					variant={variant}
					size={size}
				>
					{isDownloadingTicket ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Printer className="size-4" />
					)}
					{showLabel && (
						<span className="ml-2">
							{isDownloadingTicket ? "Préparation..." : "Ticket"}
						</span>
					)}
				</Button>

				{showTicketOptions && (
					<div className="absolute top-full right-0 mt-1 z-10 min-w-[8rem] rounded-md border border-border bg-card shadow-md">
						<button
							type="button"
							onClick={() => void handlePrintTicket(58)}
							disabled={isDownloadingTicket}
							className="block w-full px-4 py-2 text-left text-sm hover:bg-accent whitespace-nowrap disabled:opacity-50"
						>
							58 mm
						</button>
						<button
							type="button"
							onClick={() => void handlePrintTicket(80)}
							disabled={isDownloadingTicket}
							className="block w-full px-4 py-2 text-left text-sm hover:bg-accent border-t border-border whitespace-nowrap disabled:opacity-50"
						>
							80 mm
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
