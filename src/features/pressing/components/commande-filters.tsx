import { Search } from "lucide-react";

import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import {
	type CommandePressingStatut,
	type CommandeStatutFiltre,
	PRESSING_STATUT_LABELS,
} from "../models/commandes";

interface CommandeFiltersProps {
	recherche: string;
	statut: CommandeStatutFiltre;
	client: string;
	du: string;
	au: string;
	onRechercheChange: (value: string) => void;
	onStatutChange: (value: CommandeStatutFiltre) => void;
	onClientChange: (value: string) => void;
	onDuChange: (value: string) => void;
	onAuChange: (value: string) => void;
}

/**
 * Bandeau de filtres des commandes pressing (M4). La « Barre de recherche »
 * (numéro, nom client, téléphone) est envoyée au lister (param `recherche`
 * réel) ; statut/période aussi ; le texte « client » est côté client.
 */
export function CommandeFilters({
	recherche,
	statut,
	client,
	du,
	au,
	onRechercheChange,
	onStatutChange,
	onClientChange,
	onDuChange,
	onAuChange,
}: CommandeFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="relative min-w-56 flex-1">
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden
				/>
				<Input
					value={recherche}
					onChange={(event) => onRechercheChange(event.target.value)}
					placeholder="Rechercher (n°, nom, téléphone)…"
					aria-label="Rechercher une commande"
					className="pl-9"
				/>
			</div>

			<Select
				value={statut}
				onValueChange={(value) => onStatutChange(value as CommandeStatutFiltre)}
			>
				<SelectTrigger aria-label="Statut" className="w-40">
					<SelectValue placeholder="Statut" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les statuts</SelectItem>
					{(
						Object.keys(PRESSING_STATUT_LABELS) as CommandePressingStatut[]
					).map((valeur) => (
						<SelectItem key={valeur} value={valeur}>
							{PRESSING_STATUT_LABELS[valeur]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Input
				value={client}
				onChange={(event) => onClientChange(event.target.value)}
				placeholder="Client…"
				aria-label="Filtrer par client"
				className="w-44"
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
