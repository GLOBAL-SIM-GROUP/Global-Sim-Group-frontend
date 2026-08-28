import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { useFindFacture } from "#/core/api/hooks/use-factures";
import { downloadFacturePdf } from "#/core/api/facturation";
import type { FactureSourceType } from "#/core/api/facturation";

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
 * Cherche automatiquement la facture PAYEE associée.
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
	const [isDownloading, setIsDownloading] = useState(false);
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

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			await downloadFacturePdf(facture.id);
		} catch (error) {
			console.error("Erreur téléchargement:", error);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Button
			onClick={handleDownload}
			disabled={isLoading || isDownloading}
			variant={variant}
			size={size}
		>
			{isDownloading ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<FileDown className="size-4" />
			)}
			{showLabel && (
				<span className="ml-2">{isDownloading ? "Téléchargement..." : "Reçu PDF"}</span>
			)}
		</Button>
	);
}
