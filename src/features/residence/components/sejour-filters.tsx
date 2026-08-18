import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type SejourStatut,
	type SejourStatutFiltre,
	type SejourType,
	type SejourTypeFiltre,
} from "../models/sejours";

interface SejourFiltersProps {
	type: SejourTypeFiltre;
	statut: SejourStatutFiltre;
	du: string;
	au: string;
	onTypeChange: (value: SejourTypeFiltre) => void;
	onStatutChange: (value: SejourStatutFiltre) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
}

/**
 * Bandeau de filtres de la liste des séjours (M2.3). Tous appliqués côté
 * client (le lister ne documente aucun paramètre réel exploitable).
 */
export function SejourFilters({
	type,
	statut,
	du,
	au,
	onTypeChange,
	onStatutChange,
	onDuChange,
	onAuChange,
}: SejourFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select
				value={type}
				onValueChange={(value) => onTypeChange(value as SejourTypeFiltre)}
			>
				<SelectTrigger aria-label="Type" className="w-40">
					<SelectValue placeholder="Type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les types</SelectItem>
					{(Object.keys(SEJOUR_TYPE_LABELS) as SejourType[]).map((valeur) => (
						<SelectItem key={valeur} value={valeur}>
							{SEJOUR_TYPE_LABELS[valeur]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={statut}
				onValueChange={(value) => onStatutChange(value as SejourStatutFiltre)}
			>
				<SelectTrigger aria-label="Statut" className="w-40">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les statuts</SelectItem>
					{(Object.keys(SEJOUR_STATUT_LABELS) as SejourStatut[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{SEJOUR_STATUT_LABELS[valeur]}
							</SelectItem>
						),
					)}
				</SelectContent>
			</Select>

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
