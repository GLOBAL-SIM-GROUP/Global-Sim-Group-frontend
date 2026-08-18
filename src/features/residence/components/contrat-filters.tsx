import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	CONTRAT_STATUT_LABELS,
	type ContratStatut,
	type ContratStatutFiltre,
} from "../models/contrats";

interface ContratFiltersProps {
	statut: ContratStatutFiltre;
	locataire: string;
	logement: string;
	du: string;
	au: string;
	onStatutChange: (value: ContratStatutFiltre) => void;
	onLocataireChange: (value: string) => void;
	onLogementChange: (value: string) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
}

/**
 * Bandeau de filtres de la liste des contrats (M2.2). Tous appliqués côté
 * client (le lister `/contrats` ne documente aucun paramètre).
 */
export function ContratFilters({
	statut,
	locataire,
	logement,
	du,
	au,
	onStatutChange,
	onLocataireChange,
	onLogementChange,
	onDuChange,
	onAuChange,
}: ContratFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select
				value={statut}
				onValueChange={(value) => onStatutChange(value as ContratStatutFiltre)}
			>
				<SelectTrigger aria-label="Statut" className="w-40">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les statuts</SelectItem>
					{(Object.keys(CONTRAT_STATUT_LABELS) as ContratStatut[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{CONTRAT_STATUT_LABELS[valeur]}
							</SelectItem>
						),
					)}
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
				value={logement}
				onChange={(event) => onLogementChange(event.target.value)}
				placeholder="Logement…"
				aria-label="Filtrer par logement"
				className="w-40"
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
