import { Link } from "@tanstack/react-router";
import { AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import { useMouvements } from "../hooks/use-mouvements";
import { useProduits } from "../hooks/use-produits";
import {
	filtrerMouvements,
	type MouvementTypeFiltre,
	paginerMouvements,
} from "../models/mouvements";
import { MOUVEMENTS_PAGE_SIZE } from "../permissions";
import { AlerteStockDialog } from "./alerte-stock-dialog";
import { MouvementFilters } from "./mouvement-filters";
import { MouvementFormDialog } from "./mouvement-form-dialog";
import { MouvementTable } from "./mouvement-table";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface MouvementsSearch {
	type?: MouvementTypeFiltre;
	du?: string;
	au?: string;
	produit?: string;
	page?: number;
}

interface MouvementsPageProps {
	initialSearch: MouvementsSearch;
	onSearchChange: (maj: (prev: MouvementsSearch) => MouvementsSearch) => void;
}

/**
 * Page « Mouvements de stock » (module Marchandise, M3) : historique des
 * entrées/sorties/ajustements, filtres, « Ajouter un mouvement » et bouton
 * « Alerte stock ». Le lister historique embarque la référence et le nom.
 */
export function MouvementsPage({
	initialSearch,
	onSearchChange,
}: MouvementsPageProps) {
	const canCreer = useCan("MARCHANDISE.CREER");

	const mouvementsQuery = useMouvements();
	const produitsQuery = useProduits();

	const [type, setType] = useState<MouvementTypeFiltre>(
		initialSearch.type ?? "tous",
	);
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [produit, setProduit] = useState(initialSearch.produit ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [alerteOuverte, setAlerteOuverte] = useState(false);

	const changerFiltre = (patch: {
		type?: MouvementTypeFiltre;
		du?: string;
		au?: string;
		produit?: string;
	}) => {
		setType(patch.type ?? type);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setProduit(patch.produit ?? produit);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerMouvements(mouvementsQuery.data ?? [], {
		type,
		du,
		au,
		produit,
	});
	const pagination = paginerMouvements(filtres, page, MOUVEMENTS_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Produits — Market", to: "/marchandise/produits" },
					{ label: "Mouvements de stock" },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
						Mouvements de stock
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Historique des entrées, sorties et ajustements de stock.
					</p>
				</section>

				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setAlerteOuverte(true)}
						className="w-full sm:w-auto justify-center"
					>
						<AlertTriangle className="size-4 text-lagoon" aria-hidden />
						Alerte stock
					</Button>
					{canCreer ? (
						<Button onClick={() => setFormOuvert(true)} className="w-full sm:w-auto justify-center">
							<Plus className="size-4" aria-hidden />
							Ajouter un mouvement
						</Button>
					) : null}
				</div>
			</div>

			<MouvementFilters
				type={type}
				du={du}
				au={au}
				produit={produit}
				onTypeChange={(valeur) => changerFiltre({ type: valeur })}
				onDuChange={(valeur) => changerFiltre({ du: valeur })}
				onAuChange={(valeur) => changerFiltre({ au: valeur })}
				onProduitChange={(valeur) => changerFiltre({ produit: valeur })}
			/>

			{mouvementsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : mouvementsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les mouvements.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void mouvementsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<MouvementTable mouvements={pagination.items} />
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des mouvements"
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

			<div className="flex justify-end">
				<Button variant="outline" size="sm" asChild>
					<Link to="/marchandise/produits">Retour aux produits</Link>
				</Button>
			</div>

			<MouvementFormDialog
				open={formOuvert}
				produits={produitsQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			<AlerteStockDialog
				open={alerteOuverte}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAlerteOuverte(false);
				}}
			/>
		</div>
	);
}
