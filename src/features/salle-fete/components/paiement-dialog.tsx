import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

/** Dialog de paiement (Confirmer / Réaliser une réservation). */
export function PaiementDialog({
	titre,
	montantDefaut,
	moyens,
	onOpenChange,
	onValider,
}: {
	titre: string;
	montantDefaut: string;
	moyens: { id: string; libelle: string }[];
	onOpenChange: (open: boolean) => void;
	onValider: (montant: string, idMoyen: string) => void;
}) {
	const [montant, setMontant] = useState(montantDefaut);
	const [idMoyen, setIdMoyen] = useState(moyens[0]?.id ?? "");
	return (
		<div className="space-y-3">
			<div>
				<Label htmlFor="paie-montant">Montant (FCFA)</Label>
				<input
					id="paie-montant"
					className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					type="number"
					min="0"
					value={montant}
					onChange={(event) => setMontant(event.target.value)}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="paie-moyen">Moyen de paiement</Label>
				<Select value={idMoyen} onValueChange={setIdMoyen}>
					<SelectTrigger id="paie-moyen" className="w-full">
						<SelectValue placeholder="Sélectionner un moyen" />
					</SelectTrigger>
					<SelectContent>
						{moyens.map((moyen) => (
							<SelectItem key={moyen.id} value={moyen.id}>
								{moyen.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					onClick={() => onOpenChange(false)}
				>
					Annuler
				</Button>
				<Button
					type="button"
					onClick={() => {
						onValider(montant, idMoyen);
						onOpenChange(false);
					}}
				>
					{titre}
				</Button>
			</div>
		</div>
	);
}
