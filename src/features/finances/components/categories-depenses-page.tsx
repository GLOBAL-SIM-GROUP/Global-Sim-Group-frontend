import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { InputField } from "#/components/ui/input-field";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";

import {
	useCategoriesDepenses,
	useCreerCategorieDepense,
	useSupprimerCategorieDepense,
} from "../hooks/use-finances";
import type { CategorieDepense } from "../models/finances";

/** Modale « Ajouter une catégorie de dépense ». */
function CategorieDepenseFormDialog({
	open,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const createMutation = useCreerCategorieDepense();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: { libelle: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.libelle.trim()) fields.libelle = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await createMutation.mutateAsync({ libelle: value.libelle.trim() });
				onSaved();
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						(toApiError(error).message || "Une erreur est survenue."),
				);
			}
		},
	});
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Ajouter une catégorie de dépense</DialogTitle>
				<DialogDescription>
					Classement des dépenses du module Finances.
				</DialogDescription>
				<form
					className="mt-4 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="libelle">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Libellé"
								placeholder="ex : Électricité"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					{globalError ? (
						<p role="alert" className="text-sm font-medium text-destructive">
							{globalError}
						</p>
					) : null}
					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={createMutation.isPending}>
							{createMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Enregistrer
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Page « Catégories de dépenses » (module Finances, M8) : classification des
 * dépenses, Ajouter / Supprimer.
 */
export function CategoriesDepensesPage() {
	// Verbes dédiés (DEPENSE.*) — voir le commentaire équivalent dans
	// `depenses-page.tsx`.
	const canCreer = useCan("DEPENSE.CREER");
	const canSupprimer = useCan("DEPENSE.SUPPRIMER");
	const canVoir = useCan("FINANCES.VOIR");
	const categoriesQuery = useCategoriesDepenses();
	const supprimerMutation = useSupprimerCategorieDepense();
	const [formOuvert, setFormOuvert] = useState(false);
	const [aSupprimer, setASupprimer] = useState<CategorieDepense | null>(null);

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux catégories de dépenses.
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Catégories de dépenses" },
				]}
				title="Catégories de dépenses"
				description="Classification des dépenses enregistrées."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter une catégorie
						</Button>
					) : undefined
				}
			/>

			{supprimerMutation.isError ? (
				<div
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					Impossible de supprimer la catégorie.
				</div>
			) : null}

			{categoriesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : categoriesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les catégories de dépenses.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void categoriesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (categoriesQuery.data ?? []).length === 0 ? (
				<EmptyState title="Aucune catégorie de dépense trouvée." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>LIBELLÉ</Th>
								{canSupprimer ? <Th className="text-right">ACTIONS</Th> : null}
							</tr>
						</DataTableHead>
						<tbody>
							{(categoriesQuery.data ?? []).map((categorie) => (
								<Tr key={categorie.id}>
									<Td className="font-medium text-foreground">
										{categorie.libelle}
									</Td>
									{canSupprimer ? (
										<Td>
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													title="Supprimer"
													className="text-destructive"
													onClick={() => setASupprimer(categorie)}
												>
													<Trash2 className="size-4" aria-hidden />
													<span className="sr-only">Supprimer</span>
												</Button>
											</div>
										</Td>
									) : null}
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}

			<CategorieDepenseFormDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			<ConfirmDialog
				open={aSupprimer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setASupprimer(null);
				}}
				title="Supprimer la catégorie"
				message={`Voulez-vous vraiment supprimer « ${aSupprimer?.libelle ?? ""} » ?`}
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
