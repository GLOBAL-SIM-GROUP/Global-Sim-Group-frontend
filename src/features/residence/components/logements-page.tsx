import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { useCan } from "#/core/auth";

import { useBatiments } from "../hooks/use-batiments";
import { useLogements } from "../hooks/use-logements";
import {
	filtrerLogements,
	type Logement,
	type LogementStatutFiltre,
	type LogementTypeFiltre,
	paginerLogements,
} from "../models/logements";
import { LOGEMENTS_PAGE_SIZE } from "../permissions";
import { LogementFilters } from "./logement-filters";
import { LogementFormDialog } from "./logement-form-dialog";
import { LogementTable } from "./logement-table";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface LogementsSearch {
	batiment?: string;
	search?: string;
	type?: LogementTypeFiltre;
	statut?: LogementStatutFiltre;
	page?: number;
}

interface LogementsPageProps {
	/** Valeurs initiales lues depuis l'URL (validateSearch de la route). */
	initialSearch: LogementsSearch;
	/**
	 * Réécrit la search de la route à partir de l'URL actuelle. La feature ne
	 * connaît pas la route : la navigation est injectée par la colle (route).
	 */
	onSearchChange: (maj: (prev: LogementsSearch) => LogementsSearch) => void;
}

/**
 * Page « Logements — [Nom du bâtiment] » (module Résidence, M2.2) : liste des
 * logements d'un bâtiment passé en query `?batiment=` (paramètre réel du
 * lister). `type`/`statut` sont envoyés au lister et portés par la clé de
 * requête (refetch au changement) ; `dispo` et la pagination restent côté
 * client. Sans `batiment`, état vide avec retour vers la liste des bâtiments.
 */
export function LogementsPage({
	initialSearch,
	onSearchChange,
}: LogementsPageProps) {
	const canCreer = useCan("RESIDENCE.CREER");

	const batimentsQuery = useBatiments();
	// Bâtiment courant, résolu depuis le cache Query (déjà chaud après la liste
	// des bâtiments) — aucun fetch supplémentaire.
	const batiment = batimentsQuery.data?.find(
		(item) => item.id === initialSearch.batiment,
	);

	const [search, setSearch] = useState(initialSearch.search ?? "");
	const [type, setType] = useState<LogementTypeFiltre>(
		initialSearch.type ?? "tous",
	);
	const [statut, setStatut] = useState<LogementStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [page, setPage] = useState(initialSearch.page ?? 1);
	// Modale de création/édition : `formOuvert` = création (bouton Ajouter),
	// `aModifier` = édition (pencil d'une ligne).
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Logement | null>(null);

	/** Ferme la modale du formulaire (overlay, Échap, Annuler, sauvegarde). */
	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	/** Met à jour un filtre, remet à la page 1 et reflète le tout dans l'URL. */
	const changerFiltre = (patch: {
		search?: string;
		type?: LogementTypeFiltre;
		statut?: LogementStatutFiltre;
	}) => {
		if (patch.search !== undefined) setSearch(patch.search);
		setType(patch.type ?? type);
		setStatut(patch.statut ?? statut);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	// Les filtres serveur (search/type/statut) rechargent la liste via la query key.
	const logementsQuery = useLogements(
		initialSearch.batiment,
		type,
		statut,
		search,
	);

	const filtres = useMemo(
		() => filtrerLogements(logementsQuery.data ?? [], { type, statut }),
		[logementsQuery.data, type, statut],
	);
	const pagination = paginerLogements(filtres, page, LOGEMENTS_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Bâtiments", to: "/residence/batiments" },
					{ label: batiment ? `Logements — ${batiment.nom}` : "Logements" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						{batiment ? `Logements — ${batiment.nom}` : "Logements"}
					</h1>
					<p className="text-muted-foreground">
						Liste des logements (chambres, studios, appartements, meublés)
						rattachés à un bâtiment donné.
					</p>
				</section>

				{canCreer && batiment ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un logement
					</Button>
				) : null}
			</div>

			{batiment ? (
				<>
					<div className="flex gap-2">
						<div className="flex-1">
							<InputField
								placeholder="Rechercher par numéro, adresse…"
								value={search}
								onChange={(e) => changerFiltre({ search: e.target.value })}
							/>
						</div>
					</div>

					<LogementFilters
						type={type}
						statut={statut}
						onTypeChange={(valeur) => changerFiltre({ type: valeur })}
						onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
					/>

					{logementsQuery.isLoading ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : logementsQuery.isError ? (
						<div
							role="alert"
							className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
						>
							<p>Impossible de charger les logements.</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => void logementsQuery.refetch()}
							>
								Réessayer
							</Button>
						</div>
					) : (
						<LogementTable
							logements={pagination.items}
							onEdit={(logement) => setAModifier(logement)}
						/>
					)}

					{pagination.total > 0 ? (
						<nav
							aria-label="Pagination des logements"
							className="flex flex-wrap items-center justify-between gap-4"
						>
							<p className="text-sm text-muted-foreground">
								Affichage de {pagination.start} à {pagination.end} sur{" "}
								{pagination.total} résultats
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={pagination.page <= 1}
									onClick={() => allerPage(pagination.page - 1)}
								>
									Précédent
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={pagination.page >= pagination.totalPages}
									onClick={() => allerPage(pagination.page + 1)}
								>
									Suivant
								</Button>
							</div>
						</nav>
					) : null}
				</>
			) : (
				<div className="space-y-3 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
					<p>Sélectionnez un bâtiment pour voir ses logements.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/batiments">
							Aller à la liste des bâtiments
						</Link>
					</Button>
				</div>
			)}

			<LogementFormDialog
				open={formOuvert || aModifier !== null}
				logement={aModifier}
				batiments={batimentsQuery.data ?? []}
				batimentIdParDefaut={batiment?.id}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>
		</div>
	);
}
