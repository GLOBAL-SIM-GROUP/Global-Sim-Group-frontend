import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import { useCategoriesCharges, useCharges } from "../hooks/use-charges";
import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import { type Charge, filtrerCharges, paginerCharges } from "../models/charges";
import { CHARGES_PAGE_SIZE } from "../permissions";
import { ChargeFilters } from "./charge-filters";
import { ChargeFormDialog } from "./charge-form-dialog";
import { ChargeTable } from "./charge-table";
import { PayerChargeFormDialog } from "./payer-charge-form-dialog";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface ChargesSearch {
	statut?: string;
	logement?: string;
	periode?: string;
	categorie?: string;
	page?: number;
}

interface ChargesPageProps {
	initialSearch: ChargesSearch;
	onSearchChange: (maj: (prev: ChargesSearch) => ChargesSearch) => void;
}

/**
 * Page « Charges facturées » (module Résidence, M2.4) : liste des factures de
 * charges par logement, filtres, « Nouvelle charge » (modale, le lister
 * `?logement=` renvoyant un 500 → filtrage client) et « Enregistrer un
 * paiement ». Liens vers les catégories et les abonnements.
 */
export function ChargesPage({
	initialSearch,
	onSearchChange,
}: ChargesPageProps) {
	const canCreer = useCan("RESIDENCE.CREER");

	const chargesQuery = useCharges();
	const categoriesQuery = useCategoriesCharges();
	const moyensQuery = useMoyensPaiement();

	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [logement, setLogement] = useState(initialSearch.logement ?? "");
	const [periode, setPeriode] = useState(initialSearch.periode ?? "");
	const [categorie, setCategorie] = useState(initialSearch.categorie ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aPayer, setAPayer] = useState<Charge | null>(null);

	/** Met à jour un filtre, remet à la page 1 et reflète le tout dans l'URL. */
	const changerFiltre = (patch: {
		statut?: string;
		logement?: string;
		periode?: string;
		categorie?: string;
	}) => {
		setStatut(patch.statut ?? statut);
		setLogement(patch.logement ?? logement);
		setPeriode(patch.periode ?? periode);
		setCategorie(patch.categorie ?? categorie);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerCharges(chargesQuery.data ?? [], {
		statut,
		logement,
		periode,
		categorie,
	});
	const pagination = paginerCharges(filtres, page, CHARGES_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Charges facturées" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Charges facturées
					</h1>
					<p className="text-muted-foreground">
						Factures de charges (électricité, eau, autres…) par logement.
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/categories-charges">
							Catégories de charges
						</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/abonnements">Abonnements</Link>
					</Button>
					{canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Nouvelle charge
						</Button>
					) : null}
				</div>
			</div>

			<ChargeFilters
				statut={statut}
				logement={logement}
				periode={periode}
				categorie={categorie}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onLogementChange={(valeur) => changerFiltre({ logement: valeur })}
				onPeriodeChange={(valeur) => changerFiltre({ periode: valeur })}
				onCategorieChange={(valeur) => changerFiltre({ categorie: valeur })}
			/>

			{chargesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : chargesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les charges.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void chargesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<ChargeTable
					charges={pagination.items}
					onPayer={(charge) => setAPayer(charge)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des charges"
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

			<ChargeFormDialog
				open={formOuvert}
				categories={categoriesQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			<PayerChargeFormDialog
				open={aPayer !== null}
				charge={aPayer}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAPayer(null);
				}}
				onSaved={() => setAPayer(null)}
			/>
		</div>
	);
}
