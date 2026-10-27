import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	VENTE_STATUT_LABELS,
	type VenteStatut,
	type VenteStatutFiltre,
} from "../models/ventes";

interface VenteFiltersProps {
	statut: VenteStatutFiltre;
	du: string;
	au: string;
	client: string;
	onStatutChange: (value: VenteStatutFiltre) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
	onClientChange: (value: string) => void;
}

/** Bandeau de filtres de l'historique des ventes (M3) — côté client. */
export function VenteFilters({
	statut,
	du,
	au,
	client,
	onStatutChange,
	onDuChange,
	onAuChange,
	onClientChange,
}: VenteFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select
				value={statut}
				onValueChange={(value) => onStatutChange(value as VenteStatutFiltre)}
			>
				<SelectTrigger aria-label="Statut" className="w-40">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les statuts</SelectItem>
					{(Object.keys(VENTE_STATUT_LABELS) as VenteStatut[]).map((valeur) => (
						<SelectItem key={valeur} value={valeur}>
							{VENTE_STATUT_LABELS[valeur]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Input
				value={client}
				onChange={(event) => onClientChange(event.target.value)}
				placeholder="Client…"
				aria-label="Filtrer par client"
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
