import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";

import { useContrats } from "../hooks/use-contrats";
import { useEcheances } from "../hooks/use-echeances";
import { filtrerEcheances, paginerEcheances } from "../models/echeances";
import { ECHANCES_PAGE_SIZE } from "../permissions";
import { EcheancesFilters } from "./echeances-filters";
import { EcheancesTable } from "./echeances-table";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface EcheancesSearch {
	statut?: string;
	du?: string;
	au?: string;
	locataire?: string;
	page?: number;
}

interface EcheancesPageProps {
	/** Valeurs initiales lues depuis l'URL (validateSearch de la route). */
	initialSearch: EcheancesSearch;
	/**
	 * Réécrit la search de la route à partir de l'URL actuelle. La feature ne
	 * connaît pas la route : la navigation est injectée par la colle (route).
	 */
	onSearchChange: (maj: (prev: EcheancesSearch) => EcheancesSearch) => void;
}

/**
 * Page « Échéances de loyer » (module Résidence, M2.2) : vue consolidée de
 * toutes les échéances (`GET /suivi`, params serveur du/au/statut) + filtre
 * locataire et pagination côté client. Pas d'encaissement ici (pas d'id
 * d'échéance dans `/suivi`) : chaque ligne pointe vers la fiche contrat. Pas
 * de relance ni d'export (aucun endpoint).
 */
export function EcheancesPage({
	initialSearch,
	onSearchChange,
}: EcheancesPageProps) {
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [locataire, setLocataire] = useState(initialSearch.locataire ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);

	const echeancesQuery = useEcheances(statut, du || undefined, au || undefined);
	const contratsQuery = useContrats();

	// `numero_contrat` → id du contrat (liens vers la fiche).
	const contratIds = useMemo(
		() =>
			new Map(
				(contratsQuery.data ?? []).map((contrat) => [
					contrat.numero_contrat,
					contrat.id,
				]),
			),
		[contratsQuery.data],
	);

	/** Met à jour un filtre, remet à la page 1 et reflète le tout dans l'URL. */
	const changerFiltre = (patch: {
		statut?: string;
		du?: string;
		au?: string;
		locataire?: string;
	}) => {
		setStatut(patch.statut ?? statut);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setLocataire(patch.locataire ?? locataire);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerEcheances(echeancesQuery.data ?? [], {
		statut,
		locataire,
		du,
		au,
	});
	const pagination = paginerEcheances(filtres, page, ECHANCES_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Échéances de loyer
				</h1>
				<p className="text-muted-foreground">
					Vue consolidée des échéances de loyer (payées, impayées, à venir).
				</p>
			</section>

			<EcheancesFilters
				statut={statut}
				locataire={locataire}
				du={du}
				au={au}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onLocataireChange={(valeur) => changerFiltre({ locataire: valeur })}
				onDuChange={(valeur) => changerFiltre({ du: valeur })}
				onAuChange={(valeur) => changerFiltre({ au: valeur })}
			/>

			{echeancesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : echeancesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les échéances.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void echeancesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<EcheancesTable echeances={pagination.items} contratIds={contratIds} />
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des échéances"
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
		</div>
	);
}
