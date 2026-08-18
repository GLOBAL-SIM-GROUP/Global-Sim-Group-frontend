import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	LOGEMENT_STATUT_LABELS,
	LOGEMENT_TYPE_LABELS,
	type LogementDispoFiltre,
	type LogementStatut,
	type LogementStatutFiltre,
	type LogementType,
	type LogementTypeFiltre,
} from "../models/logements";

interface LogementFiltersProps {
	type: LogementTypeFiltre;
	statut: LogementStatutFiltre;
	dispo: LogementDispoFiltre;
	onTypeChange: (value: LogementTypeFiltre) => void;
	onStatutChange: (value: LogementStatutFiltre) => void;
	onDispoChange: (value: LogementDispoFiltre) => void;
}

/**
 * Bandeau de filtres de la liste des logements (M2.2). `type`/`statut` sont
 * aussi envoyés au lister (params réels du spec) ; `dispo` est appliqué côté
 * client (statut === DISPONIBLE). Même gabarit que le bandeau des bâtiments.
 */
export function LogementFilters({
	type,
	statut,
	dispo,
	onTypeChange,
	onStatutChange,
	onDispoChange,
}: LogementFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select
				value={type}
				onValueChange={(value) => onTypeChange(value as LogementTypeFiltre)}
			>
				<SelectTrigger aria-label="Type" className="w-44">
					<SelectValue placeholder="Type" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les types</SelectItem>
					{(Object.keys(LOGEMENT_TYPE_LABELS) as LogementType[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{LOGEMENT_TYPE_LABELS[valeur]}
							</SelectItem>
						),
					)}
				</SelectContent>
			</Select>

			<Select
				value={statut}
				onValueChange={(value) => onStatutChange(value as LogementStatutFiltre)}
			>
				<SelectTrigger aria-label="Statut" className="w-44">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les statuts</SelectItem>
					{(Object.keys(LOGEMENT_STATUT_LABELS) as LogementStatut[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{LOGEMENT_STATUT_LABELS[valeur]}
							</SelectItem>
						),
					)}
				</SelectContent>
			</Select>

			<Select
				value={dispo}
				onValueChange={(value) => onDispoChange(value as LogementDispoFiltre)}
			>
				<SelectTrigger aria-label="Disponibilité" className="w-52">
					<SelectValue placeholder="Disponibilité" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Toutes les disponibilités</SelectItem>
					<SelectItem value="disponibles">Disponibles uniquement</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
