import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { getRecuEcheance } from "../api/contrats";
import { genererRecuEcheance } from "../lib/recu-pdf";
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
			const recu = await getRecuEcheance(echeance.id);
			genererRecuEcheance(recu);
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Impossible de télécharger le reçu";
			setError(message);
			console.error("Erreur lors du téléchargement du reçu", err);
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
						Génération…
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
