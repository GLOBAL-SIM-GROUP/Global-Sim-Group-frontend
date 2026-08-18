import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Power, PowerOff } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useCategoriesCharges,
	useModifierCategorieCharge,
} from "../hooks/use-charges";
import type { CategorieCharge } from "../models/charges";
import { CategorieFormDialog } from "./categorie-form-dialog";

/**
 * Page « Catégories de charges » (module Résidence, M2.4) : liste des
 * catégories configurables, création, modification et activation. Accessible
 * depuis la page des charges facturées.
 */
export function CategoriesChargesPage() {
	const canCreer = useCan("RESIDENCE.CREER");
	const canModifier = useCan("RESIDENCE.MODIFIER");

	const categoriesQuery = useCategoriesCharges();
	const toggleMutation = useModifierCategorieCharge();

	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<CategorieCharge | null>(null);

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	return (
		<div className="mx-auto w-full max-w-3xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Charges facturées", to: "/residence/charges" },
					{ label: "Catégories de charges" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Catégories de charges
					</h1>
					<p className="text-muted-foreground">
						Catégories configurables (électricité, eau, autres…).
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
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ACTIF
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
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												categorie.actif
													? "bg-[#27AE60] text-white"
													: "bg-[#95A5A6] text-white",
											)}
										>
											{categorie.actif ? "Oui" : "Non"}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<>
													<Button
														variant="ghost"
														size="icon-sm"
														title="Modifier"
														onClick={() => setAModifier(categorie)}
													>
														<Pencil className="size-4" aria-hidden />
														<span className="sr-only">Modifier</span>
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														title={categorie.actif ? "Désactiver" : "Activer"}
														onClick={() =>
															toggleMutation.mutate({
																id: categorie.id,
																actif: !categorie.actif,
															})
														}
													>
														{categorie.actif ? (
															<PowerOff className="size-4" aria-hidden />
														) : (
															<Power className="size-4" aria-hidden />
														)}
														<span className="sr-only">
															{categorie.actif ? "Désactiver" : "Activer"}
														</span>
													</Button>
												</>
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
					<Link to="/residence/charges">Retour aux charges facturées</Link>
				</Button>
			</div>

			<CategorieFormDialog
				open={formOuvert || aModifier !== null}
				categorie={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>
		</div>
	);
}
