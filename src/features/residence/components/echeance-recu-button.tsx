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

			const url = `/api/v1/residence/echeances/${echeance.id}/recu`;
			console.log("[EcheanceRecuButton] Début téléchargement reçu");
			console.log("[EcheanceRecuButton] ID écheance:", echeance.id);
			console.log("[EcheanceRecuButton] Statut écheance:", echeance.statut);
			console.log("[EcheanceRecuButton] Montant:", echeance.montant);
			console.log("[EcheanceRecuButton] Mois/Année:", `${echeance.mois}/${echeance.annee}`);
			console.log("[EcheanceRecuButton] Date écheance:", echeance.date_echeance);
			console.log("[EcheanceRecuButton] URL endpoint:", url);

			// Télécharger le PDF directement depuis l'API
			const response = await fetch(url, { credentials: "include" });

			console.log("[EcheanceRecuButton] Réponse reçue");
			console.log("[EcheanceRecuButton] Status code:", response.status);
			console.log("[EcheanceRecuButton] Status OK:", response.ok);
			console.log("[EcheanceRecuButton] Content-Type:", response.headers.get("content-type"));
			console.log("[EcheanceRecuButton] Content-Length:", response.headers.get("content-length"));

			if (!response.ok) {
				console.error("[EcheanceRecuButton] Erreur HTTP:", response.status);
				const errorText = await response.text();
				console.error("[EcheanceRecuButton] Réponse d'erreur:", errorText);

				if (response.status === 404) {
					setError("Aucun reçu n'est disponible pour cette échéance.");
				} else if (response.status === 403) {
					setError("Vous n'avez pas accès à ce reçu.");
				} else {
					setError("Aucun reçu n'est émis tant que le paiement n'est pas encore effectué.");
				}
				return;
			}

			const blob = await response.blob();
			console.log("[EcheanceRecuButton] Blob reçu, taille:", blob.size);
			console.log("[EcheanceRecuButton] Type blob:", blob.type);

			const objectUrl = URL.createObjectURL(blob);
			console.log("[EcheanceRecuButton] Object URL créée:", objectUrl);

			const lien = document.createElement("a");
			lien.href = objectUrl;
			lien.download = `recu-echeance-${echeance.id}.pdf`;
			console.log("[EcheanceRecuButton] Lien créé, download filename:", lien.download);

			document.body.appendChild(lien);
			console.log("[EcheanceRecuButton] Lien ajouté au DOM");

			lien.click();
			console.log("[EcheanceRecuButton] Click déclenché");

			document.body.removeChild(lien);
			console.log("[EcheanceRecuButton] Lien retiré du DOM");

			URL.revokeObjectURL(objectUrl);
			console.log("[EcheanceRecuButton] Object URL révoquée");
			console.log("[EcheanceRecuButton] ✓ Téléchargement réussi");
		} catch (err) {
			console.error("[EcheanceRecuButton] ✗ Exception complète:", err);
			console.error("[EcheanceRecuButton] Message:", err instanceof Error ? err.message : String(err));
			console.error("[EcheanceRecuButton] Stack:", err instanceof Error ? err.stack : "N/A");
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
