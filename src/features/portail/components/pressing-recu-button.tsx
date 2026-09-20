import { Receipt } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";

import { PressingRecuDialog } from "./pressing-recu-dialog";

interface PressingRecuButtonProps {
	idCommande: string;
	numeroCommande: string;
}

/**
 * Bouton « Reçu » pour l'espace résident (M5.x) : affiche le reçu JSON via
 * l'endpoint portail dédié (RESIDENT.VOIR), rendu en modale — l'endpoint
 * renvoie des données, pas un PDF. Disponible dès la déclaration (`EN_ATTENTE`
 * → lignes déclaratives, montants `null` affichés « — »).
 */
export function PressingRecuButton({
	idCommande,
	numeroCommande,
}: PressingRecuButtonProps) {
	const [ouvert, setOuvert] = useState(false);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOuvert(true)}
				title={`Voir le reçu de ${numeroCommande}`}
			>
				<Receipt className="size-4" aria-hidden />
				<span className="ml-2">Reçu</span>
			</Button>
			<PressingRecuDialog
				open={ouvert}
				id={idCommande}
				onOpenChange={setOuvert}
			/>
		</>
	);
}
