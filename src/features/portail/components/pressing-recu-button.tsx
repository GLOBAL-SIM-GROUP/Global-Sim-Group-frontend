import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { telechargerRecuCommandePressing } from "../api/pressing";

interface PressingRecuButtonProps {
	idCommande: string;
	numeroCommande: string;
	isPaid: boolean;
}

/**
 * Bouton « Reçu » pour l'espace résident (M5.x) : télécharge le PDF via
 * l'endpoint portail dédié (RESIDENT.VOIR), sans passer par le module
 * facturation auquel le résident n'a pas accès.
 */
export function PressingRecuButton({
	idCommande,
	numeroCommande,
	isPaid,
}: PressingRecuButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isPaid) {
		return null;
	}

	const handleDownload = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const blob = await telechargerRecuCommandePressing(idCommande);

			const url = URL.createObjectURL(blob);
			const lien = document.createElement("a");
			lien.href = url;
			lien.download = `recu-${numeroCommande}.pdf`;
			document.body.appendChild(lien);
			lien.click();
			document.body.removeChild(lien);
			URL.revokeObjectURL(url);
		} catch (err) {
			setError("Aucun reçu n'est disponible pour cette commande.");
			console.error("Erreur téléchargement reçu pressing:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-end gap-1">
			<Button
				variant="outline"
				size="sm"
				onClick={handleDownload}
				disabled={isLoading}
				title={error ?? "Télécharger le reçu PDF"}
			>
				{isLoading ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<FileDown className="size-4" />
				)}
				<span className="ml-2">{isLoading ? "Téléchargement..." : "Reçu"}</span>
			</Button>
			{error ? <p className="text-xs text-destructive">{error}</p> : null}
		</div>
	);
}
