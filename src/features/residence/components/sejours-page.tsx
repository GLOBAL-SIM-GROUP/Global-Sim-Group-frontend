import { Plus } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import { useSejours } from "../hooks/use-sejours";
import {
	filtrerSejours,
	paginerSejours,
	type Sejour,
	type SejourStatutFiltre,
	type SejourTypeFiltre,
} from "../models/sejours";
import { SEJOURS_PAGE_SIZE } from "../permissions";
import { PayerSejourFormDialog } from "./payer-sejour-form-dialog";
import { SejourFilters } from "./sejour-filters";
import { SejourFormDialog } from "./sejour-form-dialog";
import { SejourTable } from "./sejour-table";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface SejoursSearch {
	type?: SejourTypeFiltre;
	statut?: SejourStatutFiltre;
	du?: string;
	au?: string;
	page?: number;
}

interface SejoursPageProps {
	initialSearch: SejoursSearch;
	onSearchChange: (maj: (prev: SejoursSearch) => SejoursSearch) => void;
}

/**
 * Page « Séjours courts » (module Résidence, M2.3) : liste des nuitées et
 * siestes (en cours ou passées). Filtres et pagination côté client ; bouton
 * « Nouveau séjour », actions Modifier / Voir la fiche / Enregistrer le
 * paiement (le lister embarque déjà client et logement).
 */
export function SejoursPage({
	initialSearch,
	onSearchChange,
}: SejoursPageProps) {
	const canCreer = useCan("RESIDENCE.CREER");

	const sejoursQuery = useSejours();
	const moyensQuery = useMoyensPaiement();

	const [type, setType] = useState<SejourTypeFiltre>(
		initialSearch.type ?? "tous",
	);
	const [statut, setStatut] = useState<SejourStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	// Modale de création/édition : `formOuvert` = création, `aModifier` = édition.
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Sejour | null>(null);
	const [aPayer, setAPayer] = useState<Sejour | null>(null);

	/** Ferme la modale du formulaire. */
	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	/** Met à jour un filtre, remet à la page 1 et reflète le tout dans l'URL. */
	const changerFiltre = (patch: {
		type?: SejourTypeFiltre;
		statut?: SejourStatutFiltre;
		du?: string;
		au?: string;
	}) => {
		setType(patch.type ?? type);
		setStatut(patch.statut ?? statut);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerSejours(sejoursQuery.data ?? [], {
		type,
		statut,
		du,
		au,
	});
	const pagination = paginerSejours(filtres, page, SEJOURS_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Séjours courts" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Séjours courts
					</h1>
					<p className="text-muted-foreground">
						Liste des nuitées et siestes en cours ou passées.
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouveau séjour
					</Button>
				) : null}
			</div>

			<SejourFilters
				type={type}
				statut={statut}
				du={du}
				au={au}
				onTypeChange={(valeur) => changerFiltre({ type: valeur })}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onDuChange={(valeur) => changerFiltre({ du: valeur })}
				onAuChange={(valeur) => changerFiltre({ au: valeur })}
			/>

			{sejoursQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : sejoursQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les séjours.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void sejoursQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<SejourTable
					sejours={pagination.items}
					onEdit={(sejour) => setAModifier(sejour)}
					onPayer={(sejour) => setAPayer(sejour)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des séjours"
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

			<SejourFormDialog
				open={formOuvert || aModifier !== null}
				sejour={aModifier}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>

			<PayerSejourFormDialog
				open={aPayer !== null}
				sejour={aPayer}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAPayer(null);
				}}
				onSaved={() => setAPayer(null)}
			/>
		</div>
	);
}
