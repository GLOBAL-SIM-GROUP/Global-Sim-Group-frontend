import { Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import type { FactureSourceType } from "#/core/api/facturation";
import { printFacturePdf, printFactureTicket } from "#/core/api/facturation";
import { useFindFacture } from "#/core/api/hooks/use-factures";

interface DownloadReceiptIconButtonProps {
	sourceType: FactureSourceType;
	idClient: string | null;
	montantTotal?: string;
	isPaid: boolean;
}

/**
 * Bouton compact (icône seule) pour une colonne « Actions » de tableau :
 * ouvre un petit menu proposant le reçu PDF ou un ticket de caisse (58/80mm).
 * Cherche automatiquement la facture PAYEE associée à la transaction.
 */
export function DownloadReceiptIconButton({
	sourceType,
	idClient,
	montantTotal,
	isPaid,
}: DownloadReceiptIconButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false);
	const [menuOuvert, setMenuOuvert] = useState(false);
	const { data: facture, isLoading } = useFindFacture(
		sourceType,
		idClient,
		montantTotal,
	);

	if (!isPaid || !facture || !idClient) {
		return null;
	}

	const handlePdf = async () => {
		setMenuOuvert(false);
		setIsDownloading(true);
		try {
			await printFacturePdf(facture.id);
		} catch (error) {
			console.error("Erreur impression:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	const handleTicket = async (largeur: 58 | 80) => {
		setMenuOuvert(false);
		setIsDownloading(true);
		try {
			await printFactureTicket(facture.id, largeur);
		} catch (error) {
			console.error("Erreur impression ticket:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="relative">
			<Button
				variant="ghost"
				size="icon-sm"
				title="Imprimer la facture / le reçu"
				disabled={isLoading || isDownloading}
				onClick={() => setMenuOuvert((ouvert) => !ouvert)}
			>
				{isDownloading ? (
					<Loader2 className="size-4 animate-spin" aria-hidden />
				) : (
					<Printer className="size-4" aria-hidden />
				)}
				<span className="sr-only">Imprimer la facture / le reçu</span>
			</Button>

			{menuOuvert ? (
				<div className="absolute top-full right-0 z-10 mt-1 min-w-[9rem] rounded-md border border-border bg-card shadow-md">
					<button
						type="button"
						onClick={() => void handlePdf()}
						className="block w-full whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-accent"
					>
						Facture PDF
					</button>
					<button
						type="button"
						onClick={() => void handleTicket(58)}
						className="block w-full whitespace-nowrap border-t border-border px-4 py-2 text-left text-sm hover:bg-accent"
					>
						Ticket 58 mm
					</button>
					<button
						type="button"
						onClick={() => void handleTicket(80)}
						className="block w-full whitespace-nowrap border-t border-border px-4 py-2 text-left text-sm hover:bg-accent"
					>
						Ticket 80 mm
					</button>
				</div>
			) : null}
		</div>
	);
}
