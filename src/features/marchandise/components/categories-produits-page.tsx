import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
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
		<div className="mx-auto w-full max-w-3xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Produits — Market", to: "/marchandise/produits" },
					{ label: "Catégories de produits" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Catégories de produits
					</h1>
					<p className="text-muted-foreground">
						Catégories du catalogue Market (alimentation, boissons…).
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter une catégorie
					</Button>
				) : null}
			</div>

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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune catégorie trouvée.
				</div>
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
