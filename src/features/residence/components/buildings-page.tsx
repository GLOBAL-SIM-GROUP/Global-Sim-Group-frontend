import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useBasculerBatiment,
	useBatiments,
	useSupprimerBatiment,
} from "../hooks/use-batiments";
import {
	type Batiment,
	type BatimentActifFiltre,
	filtrerBatiments,
	paginerBatiments,
} from "../models/batiments";
import { BATIMENTS_PAGE_SIZE } from "../permissions";
import { BuildingFormDialog } from "./batiment-form-dialog";
import { BuildingFilters } from "./building-filters";
import { BuildingTable } from "./building-table";
import { ConfirmDialog } from "./confirm-dialog";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface BatimentsSearch {
	search?: string;
	actif?: BatimentActifFiltre;
	page?: number;
}

interface BuildingsPageProps {
	/** Valeurs initiales lues depuis l'URL (validateSearch de la route). */
	initialSearch: BatimentsSearch;
	/**
	 * Réécrit la search de la route à partir de l'URL actuelle. La feature ne
	 * connaît pas la route : la navigation est injectée par la colle (route).
	 */
	onSearchChange: (maj: (prev: BatimentsSearch) => BatimentsSearch) => void;
}

/**
 * Page « Liste des bâtiments » (module Résidence, M2.1). Les filtres et la
 * page sont initialisés depuis l'URL et y sont réécrits à chaque changement ;
 * le filtrage et la pagination restent côté client (le lister ne documente
 * aucun paramètre serveur, cf. docs/api.md).
 */
export function BuildingsPage({
	initialSearch,
	onSearchChange,
}: BuildingsPageProps) {
	const canCreer = useCan("RESIDENCE.CREER");

	const batimentsQuery = useBatiments();
	const toggleMutation = useBasculerBatiment();
	const deleteMutation = useSupprimerBatiment();

	const [search, setSearch] = useState(initialSearch.search ?? "");
	const [actif, setActif] = useState<BatimentActifFiltre>(
		initialSearch.actif ?? "tous",
	);
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [aSupprimer, setASupprimer] = useState<Batiment | null>(null);
	// Modale de création/édition : `formOuvert` = création (bouton Ajouter),
	// `aModifier` = édition (pencil d'une ligne).
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Batiment | null>(null);

	/** Ferme la modale du formulaire (overlay, Échap, Annuler, sauvegarde). */
	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	/** Met à jour un filtre, remet à la page 1 et reflète le tout dans l'URL. */
	const changerFiltre = (patch: {
		search?: string;
		actif?: BatimentActifFiltre;
	}) => {
		setSearch(patch.search ?? search);
		setActif(patch.actif ?? actif);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = useMemo(
		() => filtrerBatiments(batimentsQuery.data ?? [], { search, actif }),
		[batimentsQuery.data, search, actif],
	);
	const pagination = paginerBatiments(filtres, page, BATIMENTS_PAGE_SIZE);

	// Feedback inline (aucun système de toast installé) : succès/erreur des
	// mutations, dismissable.
	const feedback =
		deleteMutation.isError || toggleMutation.isError
			? { type: "error" as const, texte: "Une erreur est survenue." }
			: deleteMutation.isSuccess
				? {
						type: "success" as const,
						texte: "Bâtiment supprimé avec succès.",
					}
				: toggleMutation.isSuccess
					? {
							type: "success" as const,
							texte: "Statut du bâtiment mis à jour.",
						}
					: null;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Liste des bâtiments
					</h1>
					<p className="text-muted-foreground">
						Gérez l'ensemble des bâtiments de vos résidences.
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un bâtiment
					</Button>
				) : null}
			</div>

			{feedback ? (
				<div
					role={feedback.type === "error" ? "alert" : "status"}
					className={cn(
						"flex items-center justify-between gap-3 rounded-md border px-4 py-2 text-sm",
						feedback.type === "error"
							? "border-destructive/40 bg-destructive/10 text-destructive"
							: "border-[#27AE60]/40 bg-[#27AE60]/10 text-[#27AE60]",
					)}
				>
					<span>{feedback.texte}</span>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Fermer"
						onClick={() => {
							toggleMutation.reset();
							deleteMutation.reset();
						}}
					>
						<X className="size-4" aria-hidden />
					</Button>
				</div>
			) : null}

			<BuildingFilters
				search={search}
				actif={actif}
				onSearchChange={(value) => changerFiltre({ search: value })}
				onActifChange={(value) => changerFiltre({ actif: value })}
			/>

			{batimentsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : batimentsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les bâtiments.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void batimentsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<BuildingTable
					batiments={pagination.items}
					onToggle={(batiment) =>
						toggleMutation.mutate({ id: batiment.id, actif: !batiment.actif })
					}
					onDelete={(batiment) => setASupprimer(batiment)}
					onEdit={(batiment) => setAModifier(batiment)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des bâtiments"
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

			<ConfirmDialog
				open={aSupprimer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setASupprimer(null);
				}}
				title="Confirmer la suppression"
				message={`Voulez-vous vraiment supprimer le bâtiment ${aSupprimer?.code ?? ""} ? Cette action est irréversible.`}
				confirmLabel="Supprimer"
				cancelLabel="Annuler"
				destructive
				busy={deleteMutation.isPending}
				onConfirm={() => {
					if (aSupprimer) {
						deleteMutation.mutate(aSupprimer.id, {
							onSettled: () => setASupprimer(null),
						});
					}
				}}
			/>

			<BuildingFormDialog
				open={formOuvert || aModifier !== null}
				batiment={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>
		</div>
	);
}
