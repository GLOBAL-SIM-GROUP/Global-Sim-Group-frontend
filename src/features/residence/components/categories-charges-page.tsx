import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Power, PowerOff } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";

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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Charges facturées", to: "/residence/charges" },
					{ label: "Catégories de charges" },
				]}
				title="Catégories de charges"
				description="Catégories configurables (électricité, eau, autres…)."
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
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>LIBELLÉ</Th>
								<Th>ACTIF</Th>
								<Th className="text-right">ACTIONS</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{(categoriesQuery.data ?? []).map((categorie) => (
								<Tr key={categorie.id}>
									<Td className="font-medium text-foreground">
										{categorie.libelle}
									</Td>
									<Td>
										<Badge variant={categorie.actif ? "success" : "neutral"}>
											{categorie.actif ? "Oui" : "Non"}
										</Badge>
									</Td>
									<Td>
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
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
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
