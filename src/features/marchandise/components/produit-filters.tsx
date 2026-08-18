import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import type {
	CategorieProduit,
	Fournisseur,
	ProduitAlerteFiltre,
	ProduitEpuisesFiltre,
} from "../models/produits";

interface ProduitFiltersProps {
	categorie: string;
	fournisseur: string;
	alerte: ProduitAlerteFiltre;
	epuises: ProduitEpuisesFiltre;
	categories: CategorieProduit[];
	fournisseurs: Fournisseur[];
	onCategorieChange: (value: string) => void;
	onFournisseurChange: (value: string) => void;
	onAlerteChange: (value: ProduitAlerteFiltre) => void;
	onEpuisesChange: (value: ProduitEpuisesFiltre) => void;
}

/** Bandeau de filtres du catalogue produits (M3) — côté client. */
export function ProduitFilters({
	categorie,
	fournisseur,
	alerte,
	epuises,
	categories,
	fournisseurs,
	onCategorieChange,
	onFournisseurChange,
	onAlerteChange,
	onEpuisesChange,
}: ProduitFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
			<Select value={categorie} onValueChange={onCategorieChange}>
				<SelectTrigger aria-label="Catégorie" className="w-44">
					<SelectValue placeholder="Catégorie" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Toutes les catégories</SelectItem>
					{categories.map((c) => (
						<SelectItem key={c.id} value={c.id}>
							{c.libelle}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={fournisseur} onValueChange={onFournisseurChange}>
				<SelectTrigger aria-label="Fournisseur" className="w-52">
					<SelectValue placeholder="Fournisseur" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous les fournisseurs</SelectItem>
					{fournisseurs.map((f) => (
						<SelectItem key={f.id} value={f.id}>
							{f.nom}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={alerte}
				onValueChange={(value) => onAlerteChange(value as ProduitAlerteFiltre)}
			>
				<SelectTrigger aria-label="Alerte" className="w-44">
					<SelectValue placeholder="Alerte" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous</SelectItem>
					<SelectItem value="alerte">En alerte uniquement</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={epuises}
				onValueChange={(value) =>
					onEpuisesChange(value as ProduitEpuisesFiltre)
				}
			>
				<SelectTrigger aria-label="Épuisés" className="w-44">
					<SelectValue placeholder="Épuisés" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="tous">Tous</SelectItem>
					<SelectItem value="epuises">Épuisés uniquement</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
