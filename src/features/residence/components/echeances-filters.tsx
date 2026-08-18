import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import { echanceStatutLabel } from "../models/echeances";

/** Valeurs connues du statut d'échéance (enum ouvert, filtrage client). */
const STATUT_OPTIONS = [
	"tous",
	"PAYE",
	"IMPAYE",
	"PARTIEL",
	"A_VENIR",
	"EN_ATTENTE",
];

interface EcheancesFiltersProps {
	statut: string;
	locataire: string;
	du: string;
	au: string;
	onStatutChange: (value: string) => void;
	onLocataireChange: (value: string) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
}

/**
 * Bandeau de filtres du suivi des échéances (M2.2). `statut`/`du`/`au` sont
 * envoyés au serveur (params réels du lister `/suivi`) ; `locataire` est un
 * filtre texte côté client.
 */
export function EcheancesFilters({
	statut,
	locataire,
	du,
	au,
	onStatutChange,
	onLocataireChange,
	onDuChange,
	onAuChange,
}: EcheancesFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select value={statut} onValueChange={onStatutChange}>
				<SelectTrigger aria-label="Statut" className="w-44">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					{STATUT_OPTIONS.map((valeur) => (
						<SelectItem key={valeur} value={valeur}>
							{valeur === "tous"
								? "Tous les statuts"
								: echanceStatutLabel(valeur)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Input
				value={locataire}
				onChange={(event) => onLocataireChange(event.target.value)}
				placeholder="Locataire…"
				aria-label="Filtrer par locataire"
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
