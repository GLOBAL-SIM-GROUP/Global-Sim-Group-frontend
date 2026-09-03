import { Search } from "lucide-react";

import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import type { BatimentActifFiltre } from "../models/batiments";

interface BuildingFiltersProps {
	search: string;
	actif: BatimentActifFiltre;
	onSearchChange: (value: string) => void;
	onActifChange: (value: BatimentActifFiltre) => void;
}

/** Bandeau de filtres de la liste des bâtiments : recherche texte, filtre « Actif » (select). */
export function BuildingFilters({
	search,
	actif,
	onSearchChange,
	onActifChange,
}: BuildingFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="relative min-w-56 flex-1">
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden
				/>
				<Input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Rechercher un bâtiment..."
					aria-label="Rechercher un bâtiment..."
					className="pl-9"
				/>
			</div>

			<Select
				value={actif}
				onValueChange={(value) => onActifChange(value as BatimentActifFiltre)}
			>
				<SelectTrigger aria-label="Actif">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous</SelectItem>
					<SelectItem value="actif">Actif</SelectItem>
					<SelectItem value="inactif">Inactif</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
