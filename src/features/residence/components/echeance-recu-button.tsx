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

	const handleDownloadRecu = async () => {
		try {
			setIsLoading(true);
			const recu = await getRecuEcheance(echeance.id);
			genererRecuEcheance(recu);
		} catch (error) {
			console.error("Erreur lors du téléchargement du reçu", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={handleDownloadRecu}
			disabled={isLoading}
			variant="outline"
			size="sm"
			className="text-blue-600 border-blue-200 hover:bg-blue-50"
			title="Télécharger le reçu PDF"
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
	);
}
