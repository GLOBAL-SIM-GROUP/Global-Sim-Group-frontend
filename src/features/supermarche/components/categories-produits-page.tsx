import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { useCan } from "#/core/auth";

import { useCategoriesProduits } from "../hooks/use-produits";
import { CategorieProduitFormDialog } from "./categorie-produit-form-dialog";

/**
 * Page « Catégories de produits » (module Marchandise, M3) : liste des
 * catégories du catalogue + ajout. Le backend n'expose aucun endpoint de
 * suppression/modification pour les catégories → ajout uniquement.
 */
export function CategoriesProduitsPage() {
	const canCreer = useCan("MARCHANDISE.CREER");
	const categoriesQuery = useCategoriesProduits();
	const [formOuvert, setFormOuvert] = useState(false);

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Produits — Market", to: "/marchandise/produits" },
					{ label: "Catégories de produits" },
				]}
				title="Catégories de produits"
				description="Catégories du catalogue Market (alimentation, boissons…)."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter une catégorie
						</Button>
					) : null
				}
			/>

			{categoriesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : categoriesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les catégories.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void categoriesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (categoriesQuery.data ?? []).length === 0 ? (
				<EmptyState title="Aucune catégorie trouvée." />
			) : (
				<ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
					{(categoriesQuery.data ?? []).map((categorie) => (
						<li
							key={categorie.id}
							className="flex items-center justify-between px-4 py-3 text-sm"
						>
							<span className="font-medium text-foreground">
								{categorie.libelle}
							</span>
							<span className="text-xs text-muted-foreground">
								{categorie.id}
							</span>
						</li>
					))}
				</ul>
			)}

			<div className="flex justify-end">
				<Button variant="outline" size="sm" asChild>
					<Link to="/marchandise/produits">Retour aux produits</Link>
				</Button>
			</div>

			<CategorieProduitFormDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>
		</div>
	);
}
