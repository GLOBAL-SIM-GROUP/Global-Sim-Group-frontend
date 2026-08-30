import { useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "#/components/ui/button";
import { imprimerPdfBlob } from "#/lib/print-pdf";
import {
	telechargerFacturePdf,
	telechargerTicketFacture,
} from "../api/factures";

interface FactureDownloadButtonsProps {
	idFacture: string;
	/** Format des boutons: "inline" (côte à côte) ou "vertical" (empilés) */
	layout?: "inline" | "vertical";
}

export function FactureDownloadButtons({
	idFacture,
	layout = "inline",
}: FactureDownloadButtonsProps) {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);
	const [isLoadingTicket, setIsLoadingTicket] = useState(false);
	const [showTicketOptions, setShowTicketOptions] = useState(false);
	const [errorPdf, setErrorPdf] = useState<string | null>(null);
	const [errorTicket, setErrorTicket] = useState<string | null>(null);

	const handlePrintPdf = async () => {
		try {
			setIsLoadingPdf(true);
			setErrorPdf(null);
			const blob = await telechargerFacturePdf(idFacture);
			imprimerPdfBlob(blob);
		} catch (err) {
			setErrorPdf("Erreur lors de l'impression du PDF");
			console.error("Erreur PDF:", err);
		} finally {
			setIsLoadingPdf(false);
		}
	};

	const handlePrintTicket = async (largeur: 58 | 80) => {
		try {
			setIsLoadingTicket(true);
			setErrorTicket(null);
			const blob = await telechargerTicketFacture(idFacture, largeur);
			imprimerPdfBlob(blob);
			setShowTicketOptions(false);
		} catch (err) {
			setErrorTicket("Erreur lors de l'impression du ticket");
			console.error("Erreur ticket:", err);
		} finally {
			setIsLoadingTicket(false);
		}
	};

	const containerClass = layout === "inline" ? "flex gap-2" : "flex flex-col gap-2";

	return (
		<div className={containerClass}>
			<Button
				onClick={() => void handlePrintPdf()}
				disabled={isLoadingPdf || isLoadingTicket || errorPdf !== null}
				variant="outline"
				size="sm"
				className="text-blue-600 border-blue-200 hover:bg-blue-50"
				title={errorPdf || "Imprimer la facture"}
			>
				{isLoadingPdf ? (
					<>
						<Loader2 className="size-4 mr-2 animate-spin" />
						Préparation…
					</>
				) : (
					<>
						<Printer className="size-4 mr-2" />
						PDF
					</>
				)}
			</Button>

			<div className="relative">
				<Button
					onClick={() => setShowTicketOptions(!showTicketOptions)}
					disabled={isLoadingPdf || isLoadingTicket || errorTicket !== null}
					variant="outline"
					size="sm"
					className="text-green-600 border-green-200 hover:bg-green-50"
					title={errorTicket || "Imprimer un ticket de caisse"}
				>
					{isLoadingTicket ? (
						<>
							<Loader2 className="size-4 mr-2 animate-spin" />
							Préparation…
						</>
					) : (
						<>
							<Printer className="size-4 mr-2" />
							Ticket
						</>
					)}
				</Button>

				{showTicketOptions && (
					<div className="absolute top-full mt-1 z-10 bg-white border border-border rounded-md shadow-md">
						<button
							onClick={() => void handlePrintTicket(58)}
							disabled={isLoadingTicket}
							className="block w-full px-4 py-2 text-left text-sm hover:bg-accent whitespace-nowrap disabled:opacity-50"
						>
							58 mm
						</button>
						<button
							onClick={() => void handlePrintTicket(80)}
							disabled={isLoadingTicket}
							className="block w-full px-4 py-2 text-left text-sm hover:bg-accent border-t border-border whitespace-nowrap disabled:opacity-50"
						>
							80 mm
						</button>
					</div>
				)}
			</div>

			{(errorPdf || errorTicket) && (
				<p className="text-xs text-destructive col-span-full">
					{errorPdf || errorTicket}
				</p>
			)}
		</div>
	);
}
