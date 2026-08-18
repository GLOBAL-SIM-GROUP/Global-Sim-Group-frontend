import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	ABONNEMENT_STATUT_LABELS,
	type AbonnementStatut,
	type AbonnementStatutFiltre,
} from "../models/abonnements";

interface AbonnementFiltersProps {
	statut: AbonnementStatutFiltre;
	locataire: string;
	service: string;
	onStatutChange: (value: AbonnementStatutFiltre) => void;
	onLocataireChange: (value: string) => void;
	onServiceChange: (value: string) => void;
}

/**
 * Bandeau de filtres de la liste des abonnements (M2.4). Tous appliqués côté
 * client (le lister ne documente aucun paramètre).
 */
export function AbonnementFilters({
	statut,
	locataire,
	service,
	onStatutChange,
	onLocataireChange,
	onServiceChange,
}: AbonnementFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select
				value={statut}
				onValueChange={(value) =>
					onStatutChange(value as AbonnementStatutFiltre)
				}
			>
				<SelectTrigger aria-label="Statut" className="w-40">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les statuts</SelectItem>
					{(Object.keys(ABONNEMENT_STATUT_LABELS) as AbonnementStatut[]).map(
						(valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{ABONNEMENT_STATUT_LABELS[valeur]}
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
				value={service}
				onChange={(event) => onServiceChange(event.target.value)}
				placeholder="Service…"
				aria-label="Filtrer par service"
				className="w-44"
			/>
		</div>
	);
}
