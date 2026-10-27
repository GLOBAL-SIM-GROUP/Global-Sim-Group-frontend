import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	MOUVEMENT_TYPE_LABELS,
	type MouvementType,
	type MouvementTypeFiltre,
} from "../models/mouvements";

interface MouvementFiltersProps {
	type: MouvementTypeFiltre;
	du: string;
	au: string;
	produit: string;
	onTypeChange: (value: MouvementTypeFiltre) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
	onProduitChange: (value: string) => void;
}

/** Bandeau de filtres des mouvements de stock (M3) — côté client. */
export function MouvementFilters({
	type,
	du,
	au,
	produit,
	onTypeChange,
	onDuChange,
	onAuChange,
	onProduitChange,
}: MouvementFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select
				value={type}
				onValueChange={(value) => onTypeChange(value as MouvementTypeFiltre)}
			>
				<SelectTrigger aria-label="Type" className="w-40">
					<SelectValue placeholder="Type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les types</SelectItem>
					{(Object.keys(MOUVEMENT_TYPE_LABELS) as MouvementType[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{MOUVEMENT_TYPE_LABELS[valeur]}
							</SelectItem>
						),
					)}
				</SelectContent>
			</Select>

			<Input
				value={produit}
				onChange={(event) => onProduitChange(event.target.value)}
				placeholder="Produit…"
				aria-label="Filtrer par produit"
				className="w-48"
			/>

			<Input
				type="date"
				value={du}
				onChange={(event) => onDuChange(event.target.value)}
				aria-label="Début de période"
				className="w-40"
			/>

			<Input
				type="date"
				value={au}
				onChange={(event) => onAuChange(event.target.value)}
				aria-label="Fin de période"
				className="w-40"
			/>
		</div>
	);
}
