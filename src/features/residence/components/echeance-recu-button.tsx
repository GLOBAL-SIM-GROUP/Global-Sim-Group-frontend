import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { getApiClient } from "#/core/api";
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

			const url = `/api/v1/residence/echeances/${echeance.id}/recu`;

			const blob = await getApiClient().download(url);

			const objectUrl = URL.createObjectURL(blob);

			const lien = document.createElement("a");
			lien.href = objectUrl;
			lien.download = `recu-echeance-${echeance.id}.pdf`;

			document.body.appendChild(lien);
			lien.click();
			document.body.removeChild(lien);

			URL.revokeObjectURL(objectUrl);
		} catch (err) {
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
