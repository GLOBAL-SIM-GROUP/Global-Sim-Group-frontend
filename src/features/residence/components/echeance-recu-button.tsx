import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Echeance } from "../models/contrats";

interface EcheanceRecuButtonProps {
	echeance: Echeance;
}

export function EcheanceRecuButton({ echeance }: EcheanceRecuButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDownloadRecu = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Télécharger le PDF directement depuis l'API
			const response = await fetch(
				`/api/v1/residence/echeances/${echeance.id}/recu`,
			);

			if (!response.ok) {
				setError("Aucun reçu n'est émis tant que le paiement n'est pas encore effectué.");
				return;
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const lien = document.createElement("a");
			lien.href = url;
			lien.download = `recu-echeance-${echeance.id}.pdf`;
			document.body.appendChild(lien);
			lien.click();
			document.body.removeChild(lien);
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Erreur lors du téléchargement du reçu", err);
			setError("Erreur lors du téléchargement du reçu");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Button
				onClick={handleDownloadRecu}
				disabled={isLoading || error !== null}
				variant="outline"
				size="sm"
				className="text-blue-600 border-blue-200 hover:bg-blue-50"
				title={
					error
						? "Impossible de télécharger le reçu pour le moment"
						: "Télécharger le reçu PDF"
				}
			>
				{isLoading ? (
					<>
						<Loader2 className="size-4 mr-2 animate-spin" />
						Téléchargement…
					</>
				) : (
					<>
						<Download className="size-4 mr-2" />
						Reçu
					</>
				)}
			</Button>
			{error && (
				<p className="text-xs text-destructive">
					Aucun reçu n'est émis tant que le paiement n'est pas encore effectué.
				</p>
			)}
		</div>
	);
}
