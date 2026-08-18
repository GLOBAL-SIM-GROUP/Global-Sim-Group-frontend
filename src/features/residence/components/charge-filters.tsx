import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import { CHARGE_STATUT_FILTRES, chargeStatutLabel } from "../models/charges";

interface ChargeFiltersProps {
	statut: string;
	logement: string;
	periode: string;
	categorie: string;
	onStatutChange: (value: string) => void;
	onLogementChange: (value: string) => void;
	onPeriodeChange: (value: string) => void;
	onCategorieChange: (value: string) => void;
}

/**
 * Bandeau de filtres des charges facturées (M2.4). Tous appliqués côté client
 * (le lister documente des params mais `logement=` renvoie un 500).
 */
export function ChargeFilters({
	statut,
	logement,
	periode,
	categorie,
	onStatutChange,
	onLogementChange,
	onPeriodeChange,
	onCategorieChange,
}: ChargeFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select value={statut} onValueChange={onStatutChange}>
				<SelectTrigger aria-label="Statut" className="w-40">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					{CHARGE_STATUT_FILTRES.map((valeur) => (
						<SelectItem key={valeur} value={valeur}>
							{valeur === "tous"
								? "Tous les statuts"
								: chargeStatutLabel(valeur)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Input
				value={logement}
				onChange={(event) => onLogementChange(event.target.value)}
				placeholder="Logement…"
				aria-label="Filtrer par logement"
				className="w-40"
			/>

			<Input
				type="month"
				value={periode}
				onChange={(event) => onPeriodeChange(event.target.value)}
				aria-label="Filtrer par période"
				className="w-40"
			/>

			<Input
				value={categorie}
				onChange={(event) => onCategorieChange(event.target.value)}
				placeholder="Catégorie…"
				aria-label="Filtrer par catégorie"
				className="w-40"
			/>
		</div>
	);
}
