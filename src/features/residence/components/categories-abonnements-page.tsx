import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import {
	useAbonnementCategories,
	useSupprimerAbonnementCategorie,
} from "../hooks/use-abonnement-categories";
import type { AbonnementCategorie } from "../models/abonnement-categories";
import { AbonnementCategorieFormDialog } from "./abonnement-categorie-form-dialog";
import { ConfirmDialog } from "./confirm-dialog";

/**
 * Page « Catégories d'abonnement » (module Abonnement) : liste des catégories
 * configurables, création, modification et suppression. Accessible depuis la
 * page des abonnements. Alimente le champ « Service » du formulaire
 * d'abonnement (qui reste une chaîne libre côté API — cette liste sert juste
 * à proposer des libellés cohérents plutôt qu'une saisie non contrôlée).
 */
export function CategoriesAbonnementsPage() {
	const canCreer = useCan("RESIDENCE.CREER");
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canSupprimer = useCan("RESIDENCE.SUPPRIMER");

	const categoriesQuery = useAbonnementCategories();
	const supprimerMutation = useSupprimerAbonnementCategorie();

	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<AbonnementCategorie | null>(null);
	const [aSupprimer, setASupprimer] = useState<AbonnementCategorie | null>(
		null,
	);

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	return (
		<div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Abonnements", to: "/residence/abonnements" },
					{ label: "Catégories d'abonnement" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Catégories d'abonnement
					</h1>
					<p className="text-muted-foreground">
						Catégories configurables (Internet, eau, restaurant…).
					</p>
				</section>

				{canCreer ? (
					<Button
						onClick={() => setFormOuvert(true)}
						className="w-full sm:w-auto"
					>
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
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{(categoriesQuery.data ?? []).map((categorie) => (
								<tr
									key={categorie.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{categorie.libelle}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Modifier"
													onClick={() => setAModifier(categorie)}
												>
													<Pencil className="size-4" aria-hidden />
													<span className="sr-only">Modifier</span>
												</Button>
											) : null}
											{canSupprimer ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Supprimer"
													onClick={() => setASupprimer(categorie)}
												>
													<Trash2
														className="size-4 text-destructive"
														aria-hidden
													/>
													<span className="sr-only">Supprimer</span>
												</Button>
											) : null}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="flex justify-end">
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/abonnements">Retour aux abonnements</Link>
				</Button>
			</div>

			<AbonnementCategorieFormDialog
				key={aModifier?.id ?? "create"}
				open={formOuvert || aModifier !== null}
				categorie={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>

			<ConfirmDialog
				open={aSupprimer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setASupprimer(null);
				}}
				title="Supprimer la catégorie"
				message={`Voulez-vous vraiment supprimer la catégorie « ${aSupprimer?.libelle ?? ""} » ?`}
				confirmLabel="Supprimer"
				cancelLabel="Annuler"
				destructive
				busy={supprimerMutation.isPending}
				onConfirm={() => {
					if (aSupprimer) {
						supprimerMutation.mutate(aSupprimer.id, {
							onSettled: () => setASupprimer(null),
						});
					}
				}}
			/>
		</div>
	);
}
