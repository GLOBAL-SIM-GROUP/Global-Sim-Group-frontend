import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter une catégorie de dépense
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Classement des dépenses du module Finances.
					</Dialog.Description>
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/**
 * Page « Catégories de dépenses » (module Finances, M8) : classification des
 * dépenses, Ajouter / Supprimer.
 */
export function CategoriesDepensesPage() {
	const canCreer = useCan("FINANCES.CREER");
	const canSupprimer = useCan("FINANCES.SUPPRIMER");
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
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Catégories de dépenses" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Catégories de dépenses
					</h1>
					<p className="text-muted-foreground">
						Classification des dépenses enregistrées.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter une catégorie
					</Button>
				) : null}
			</div>

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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune catégorie de dépense trouvée.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								{canSupprimer ? (
									<th scope="col" className="px-4 py-3 text-right font-medium">
										ACTIONS
									</th>
								) : null}
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
									{canSupprimer ? (
										<td className="px-4 py-3">
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
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
