import { Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { getApiClient } from "#/core/api";
import { useCan } from "#/core/auth";
import { imprimerPdfBlob } from "#/lib/print-pdf";
import type { Echeance } from "../models/contrats";

interface EcheanceRecuButtonProps {
	echeance: Echeance;
}

export function EcheanceRecuButton({ echeance }: EcheanceRecuButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const isResident = useCan("RESIDENT.VOIR");

	const handleRecu = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Endpoint différent selon la permission (portail résident vs admin)
			const url = isResident
				? `/api/v1/residence/portail/echeances/${echeance.id}/recu/pdf`
				: `/api/v1/residence/echeances/${echeance.id}/recu`;

			const blob = await getApiClient().download(url);

			// Le résident garde un téléchargement classique ; le personnel/admin
			// imprime directement (pas d'étape de téléchargement intermédiaire).
			if (isResident) {
				const objectUrl = URL.createObjectURL(blob);
				const lien = document.createElement("a");
				lien.href = objectUrl;
				lien.download = `recu-echeance-${echeance.id}.pdf`;
				document.body.appendChild(lien);
				lien.click();
				document.body.removeChild(lien);
				URL.revokeObjectURL(objectUrl);
			} else {
				imprimerPdfBlob(blob);
			}
		} catch {
			setError("Erreur lors du téléchargement du reçu");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Button
				onClick={() => void handleRecu()}
				disabled={isLoading || error !== null}
				variant="outline"
				size="sm"
				className="text-blue-600 border-blue-200 hover:bg-blue-50"
				title={
					error
						? "Impossible de télécharger le reçu pour le moment"
						: isResident
							? "Télécharger le reçu PDF"
							: "Imprimer le reçu"
				}
			>
				{isLoading ? (
					<>
						<Loader2 className="size-4 mr-2 animate-spin" />
						{isResident ? "Téléchargement…" : "Préparation…"}
					</>
				) : isResident ? (
					<>
						<Download className="size-4 mr-2" />
						Reçu
					</>
				) : (
					<>
						<Printer className="size-4 mr-2" />
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
