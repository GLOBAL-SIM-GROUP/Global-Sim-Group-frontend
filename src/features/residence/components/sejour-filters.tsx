import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	SEJOUR_ORIGINE_LABELS,
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type SejourOrigine,
	type SejourOrigineFiltre,
	type SejourStatut,
	type SejourStatutFiltre,
	type SejourType,
	type SejourTypeFiltre,
} from "../models/sejours";

interface SejourFiltersProps {
	type: SejourTypeFiltre;
	statut: SejourStatutFiltre;
	origine: SejourOrigineFiltre;
	du: string;
	au: string;
	onTypeChange: (value: SejourTypeFiltre) => void;
	onStatutChange: (value: SejourStatutFiltre) => void;
	onOrigineChange: (value: SejourOrigineFiltre) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
}

/**
 * Bandeau de filtres de la liste des séjours (M2.3). `statut` et `origine`
 * sont aussi envoyés au serveur (paramètres réels depuis residence 087+088) ;
 * type et période restent filtrés côté client.
 */
export function SejourFilters({
	type,
	statut,
	origine,
	du,
	au,
	onTypeChange,
	onStatutChange,
	onOrigineChange,
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

			<Select
				value={origine}
				onValueChange={(value) => onOrigineChange(value as SejourOrigineFiltre)}
			>
				<SelectTrigger aria-label="Origine" className="w-40">
					<SelectValue placeholder="Origine" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Toutes origines</SelectItem>
					{(Object.keys(SEJOUR_ORIGINE_LABELS) as SejourOrigine[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{SEJOUR_ORIGINE_LABELS[valeur]}
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
