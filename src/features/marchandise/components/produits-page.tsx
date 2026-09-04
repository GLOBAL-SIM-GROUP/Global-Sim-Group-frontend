import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { useCan } from "#/core/auth";

import {
	useCategoriesProduits,
	useFournisseurs,
	useProduits,
} from "../hooks/use-produits";
import {
	filtrerProduits,
	type Produit,
	type ProduitAlerteFiltre,
	type ProduitEpuisesFiltre,
	paginerProduits,
} from "../models/produits";
import { PRODUITS_PAGE_SIZE } from "../permissions";
import { ProduitCardsGrid } from "./produit-cards-grid";
import { ProduitCodeBarreDialog } from "./produit-code-barre-dialog";
import { ProduitFilters } from "./produit-filters";
import { ProduitFormDialog } from "./produit-form-dialog";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface ProduitsSearch {
	search?: string;
	categorie?: string;
	fournisseur?: string;
	alerte?: ProduitAlerteFiltre;
	epuises?: ProduitEpuisesFiltre;
	page?: number;
}

interface ProduitsPageProps {
	initialSearch: ProduitsSearch;
	onSearchChange: (maj: (prev: ProduitsSearch) => ProduitsSearch) => void;
}

/**
 * Page « Produits — Market » (module Marchandise, M3) : catalogue des produits
 * avec référence, catégorie, prix, stock, seuil et fournisseur. Filtres et
 * pagination côté client ; modale Ajouter/Modifier. Liens vers les mouvements,
 * les ventes et les statistiques.
 */
export function ProduitsPage({
	initialSearch,
	onSearchChange,
}: ProduitsPageProps) {
	const canCreer = useCan("MARCHANDISE.CREER");

	const [search, setSearch] = useState(initialSearch.search ?? "");
	const [categorie, setCategorie] = useState(initialSearch.categorie ?? "tous");
	const [fournisseur, setFournisseur] = useState(
		initialSearch.fournisseur ?? "tous",
	);
	const [alerte, setAlerte] = useState<ProduitAlerteFiltre>(
		initialSearch.alerte ?? "tous",
	);
	const [epuises, setEpuises] = useState<ProduitEpuisesFiltre>(
		initialSearch.epuises ?? "tous",
	);
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Produit | null>(null);
	const [codeBarreProduit, setCodeBarreProduit] = useState<Produit | null>(
		null,
	);

	const produitsQuery = useProduits({
		search,
		categorie: categorie === "tous" ? undefined : categorie,
		fournisseur: fournisseur === "tous" ? undefined : fournisseur,
	});
	const categoriesQuery = useCategoriesProduits();
	const fournisseursQuery = useFournisseurs();

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	const changerFiltre = (patch: {
		search?: string;
		categorie?: string;
		fournisseur?: string;
		alerte?: ProduitAlerteFiltre;
		epuises?: ProduitEpuisesFiltre;
	}) => {
		if (patch.search !== undefined) setSearch(patch.search);
		setCategorie(patch.categorie ?? categorie);
		setFournisseur(patch.fournisseur ?? fournisseur);
		setAlerte(patch.alerte ?? alerte);
		setEpuises(patch.epuises ?? epuises);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	// Filtrage côté client uniquement pour alerte/epuises
	// (search, categorie, fournisseur sont filtrés côté backend)
	const filtres = filtrerProduits(produitsQuery.data ?? [], {
		categorie: "tous",
		fournisseur: "tous",
		alerte,
		epuises,
	});
	const pagination = paginerProduits(filtres, page, PRODUITS_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Produits — Market" }]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
						Produits — Market
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Catalogue des produits du supermarché/boutique.
					</p>
				</section>

				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto justify-center"
					>
						<Link to="/marchandise/mouvements">Mouvements</Link>
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto justify-center"
					>
						<Link to="/marchandise/ventes">Ventes</Link>
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto justify-center"
					>
						<Link to="/marchandise/statistiques">Statistiques</Link>
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto justify-center"
					>
						<Link to="/marchandise/categories-produits">Catégories</Link>
					</Button>
					{canCreer ? (
						<Button
							onClick={() => setFormOuvert(true)}
							className="w-full sm:w-auto justify-center"
						>
							<Plus className="size-4" aria-hidden />
							Ajouter un produit
						</Button>
					) : null}
				</div>
			</div>

			<div className="flex gap-2">
				<div className="flex-1">
					<InputField
						placeholder="Rechercher par nom, référence…"
						value={search}
						onChange={(e) => changerFiltre({ search: e.target.value })}
					/>
				</div>
			</div>

			<ProduitFilters
				categorie={categorie}
				fournisseur={fournisseur}
				alerte={alerte}
				epuises={epuises}
				categories={categoriesQuery.data ?? []}
				fournisseurs={fournisseursQuery.data ?? []}
				onCategorieChange={(valeur) => changerFiltre({ categorie: valeur })}
				onFournisseurChange={(valeur) => changerFiltre({ fournisseur: valeur })}
				onAlerteChange={(valeur) => changerFiltre({ alerte: valeur })}
				onEpuisesChange={(valeur) => changerFiltre({ epuises: valeur })}
			/>

			{produitsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : produitsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les produits.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void produitsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<ProduitCardsGrid
					produits={pagination.items}
					categories={categoriesQuery.data ?? []}
					fournisseurs={fournisseursQuery.data ?? []}
					onEdit={(produit) => setAModifier(produit)}
					onCodeBarre={(produit) => setCodeBarreProduit(produit)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des produits"
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

			<ProduitFormDialog
				open={formOuvert || aModifier !== null}
				produit={aModifier}
				categories={categoriesQuery.data ?? []}
				fournisseurs={fournisseursQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>

			<ProduitCodeBarreDialog
				open={codeBarreProduit !== null}
				produit={codeBarreProduit}
				onOpenChange={(ouvert) => {
					if (!ouvert) setCodeBarreProduit(null);
				}}
			/>
		</div>
	);
}
