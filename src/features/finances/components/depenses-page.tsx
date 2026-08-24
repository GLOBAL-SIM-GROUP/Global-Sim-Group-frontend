import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	useCategoriesDepenses,
	useCreerDepense,
	useDepenses,
	useModifierDepense,
	useSupprimerDepense,
} from "../hooks/use-finances";
import { CaisseSelector } from "./caisse-selector";
import { useCurrentCaisse } from "../hooks/use-current-caisse";
import type { Depense } from "../models/finances";
import { paginer } from "../models/finances";
import { DEPENSES_PAGE_SIZE } from "../permissions";

/** Filtres/pagination reflétés dans l'URL. */
export interface DepensesSearch {
	du?: string;
	au?: string;
	id_caisse?: string;
	page?: number;
}

interface DepensesPageProps {
	initialSearch: DepensesSearch;
	onSearchChange: (maj: (prev: DepensesSearch) => DepensesSearch) => void;
}

function dateAujourdhui(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Modale « Ajouter / Modifier une dépense ». */
function DepenseFormDialog({
	open,
	depense,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	depense: Depense | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const createMutation = useCreerDepense();
	const editMutation = useModifierDepense();
	const categoriesQuery = useCategoriesDepenses();
	const categories = categoriesQuery.data ?? [];
	const userCaisse = useCurrentCaisse();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			date: depense?.date.slice(0, 10) ?? dateAujourdhui(),
			montant: depense?.montant ?? "",
			idCategorieDepense: depense?.id_categorie_depense ?? "",
			libelle: depense?.libelle ?? "",
			justificatif: depense?.justificatif ?? "",
			idCaisse: depense?.id_caisse ?? userCaisse ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.date) fields.date = "Ce champ est requis.";
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.montant.trim())) {
					fields.montant = "Le montant doit être un nombre.";
				}
				if (!value.idCategorieDepense) {
					fields.idCategorieDepense = "Ce champ est requis.";
				}
				if (!value.libelle.trim()) fields.libelle = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					date: value.date,
					montant: value.montant.trim(),
					idCategorieDepense: value.idCategorieDepense,
					libelle: value.libelle.trim(),
					justificatif: value.justificatif.trim() || null,
				};
				if (depense) {
					await editMutation.mutateAsync({ id: depense.id, ...corps });
				} else {
					await createMutation.mutateAsync(corps);
				}
				onSaved();
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
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
						{depense ? "Modifier la dépense" : "Ajouter une dépense"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Enregistrement d'une sortie de trésorerie.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="date">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Date</Label>
										<Input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
										{field.state.meta.errors[0] ? (
											<p className="text-xs text-destructive">
												{field.state.meta.errors[0]}
											</p>
										) : null}
									</div>
								)}
							</form.Field>
							<form.Field name="montant">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Montant (FCFA)"
										inputMode="numeric"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="idCategorieDepense">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Catégorie</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Catégorie de dépense"
										>
											<SelectValue placeholder="Sélectionner une catégorie" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((categorie) => (
												<SelectItem key={categorie.id} value={categorie.id}>
													{categorie.libelle}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-destructive">
											{field.state.meta.errors[0]}
										</p>
									) : null}
								</div>
							)}
						</form.Field>
						<form.Field name="libelle">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Libellé"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="justificatif">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Justificatif (optionnel)"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						{!userCaisse && (
							<CaisseSelector
								value={form.getFieldValue("idCaisse") as string | undefined}
								onChange={(id) => form.setFieldValue("idCaisse", id)}
							/>
						)}
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
							<Button
								type="submit"
								disabled={createMutation.isPending || editMutation.isPending}
							>
								{createMutation.isPending || editMutation.isPending ? (
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
 * Page « Dépenses » (module Finances, M8) : sorties de trésorerie avec période,
 * catégorie, Ajouter / Modifier / Supprimer.
 */
export function DepensesPage({
	initialSearch,
	onSearchChange,
}: DepensesPageProps) {
	const canCreer = useCan("FINANCES.CREER");
	const canModifier = useCan("FINANCES.MODIFIER");
	const canSupprimer = useCan("FINANCES.SUPPRIMER");
	const canVoir = useCan("FINANCES.VOIR");
	const userCaisse = useCurrentCaisse();

	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [idCaisse, setIdCaisse] = useState(initialSearch.id_caisse ?? userCaisse ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Depense | null>(null);
	const [aSupprimer, setASupprimer] = useState<Depense | null>(null);

	const depensesQuery = useDepenses(
		initialSearch.du ?? "",
		initialSearch.au ?? "",
		idCaisse || userCaisse || undefined,
	);
	const categoriesQuery = useCategoriesDepenses();
	const supprimerMutation = useSupprimerDepense();

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux dépenses.
			</div>
		);
	}

	const categories = new Map(
		(categoriesQuery.data ?? []).map((c) => [c.id, c.libelle]),
	);

	const changerFiltre = (patch: { du?: string; au?: string; id_caisse?: string }) => {
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		if (patch.id_caisse !== undefined) setIdCaisse(patch.id_caisse);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	const depenses = depensesQuery.data ?? [];
	const pagination = paginer(depenses, page, DEPENSES_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Dépenses" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Dépenses</h1>
					<p className="text-muted-foreground">
						Sorties de trésorerie enregistrées.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter une dépense
					</Button>
				) : null}
			</div>

			<div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<div className="flex flex-wrap items-center gap-3">
					<Input
						type="date"
						value={du}
						onChange={(event) => changerFiltre({ du: event.target.value })}
						aria-label="Début de période"
						className="w-40"
					/>
					<Input
						type="date"
						value={au}
						onChange={(event) => changerFiltre({ au: event.target.value })}
						aria-label="Fin de période"
						className="w-40"
					/>
				</div>
				{!userCaisse && (
					<CaisseSelector
						value={idCaisse}
						onChange={(id) => changerFiltre({ id_caisse: id })}
					/>
				)}
			</div>

			{supprimerMutation.isError ? (
				<div
					role="alert"
					className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					<span>Impossible de supprimer la dépense.</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => supprimerMutation.reset()}
					>
						Fermer
					</Button>
				</div>
			) : null}

			{depensesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : depensesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les dépenses.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void depensesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : depenses.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune dépense trouvée.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									CATÉGORIE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									MONTANT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((depense) => (
								<tr
									key={depense.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateISO(depense.date.slice(0, 10))}
									</td>
									<td className="px-4 py-3 font-medium text-foreground">
										{depense.libelle}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{categories.get(depense.id_categorie_depense) ?? "—"}
									</td>
									<td className="px-4 py-3 text-right font-semibold text-destructive">
										- {formatMontantFCFA(depense.montant)}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Modifier"
													onClick={() => setAModifier(depense)}
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
													className="text-destructive"
													onClick={() => setASupprimer(depense)}
												>
													<Trash2 className="size-4" aria-hidden />
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

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des dépenses"
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

			<DepenseFormDialog
				open={formOuvert || aModifier !== null}
				depense={aModifier}
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
				title="Supprimer la dépense"
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

export type { Depense };
