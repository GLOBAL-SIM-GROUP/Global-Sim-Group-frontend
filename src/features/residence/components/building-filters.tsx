import { ChevronDown, Search } from "lucide-react";

import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { cn } from "#/lib/utils";

import type { BatimentActifFiltre } from "../models/batiments";

interface BuildingFiltersProps {
	search: string;
	actif: BatimentActifFiltre;
	moreOpen: boolean;
	onSearchChange: (value: string) => void;
	onActifChange: (value: BatimentActifFiltre) => void;
	onToggleMore: () => void;
}

/**
 * Bandeau de filtres de la liste des bâtiments : recherche texte, filtre
 * « Actif » (select) et section « Plus de filtres » (repliée par défaut).
 */
export function BuildingFilters({
	search,
	actif,
	moreOpen,
	onSearchChange,
	onActifChange,
	onToggleMore,
}: BuildingFiltersProps) {
	return (
		<div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex flex-wrap items-center gap-3">
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

				<button
					type="button"
					onClick={onToggleMore}
					aria-expanded={moreOpen}
					className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					<ChevronDown
						className={cn(
							"size-4 transition-transform",
							moreOpen && "rotate-180",
						)}
						aria-hidden
					/>
					{moreOpen ? "Moins de filtres" : "Plus de filtres"}
				</button>
			</div>

			{moreOpen ? (
				<p className="text-xs text-muted-foreground">
					D'autres filtres seront ajoutés prochainement.
				</p>
			) : null}
		</div>
	);
}
