import { useForm } from "@tanstack/react-form";
import { AlertTriangle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { Input } from "#/components/ui/input";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { PageHeader } from "#/components/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import {
	getErrorMessageForCode,
	isCaisseFermeeError,
	toApiError,
} from "#/core/api";
import { useCan } from "#/core/auth";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import {
	dateLocaleISO,
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { useCurrentCaisse } from "../hooks/use-current-caisse";
import {
	useCategoriesDepenses,
	useCreerDepense,
	useDepenses,
	useModifierDepense,
	useSupprimerDepense,
} from "../hooks/use-finances";
import type { Depense } from "../models/finances";
import { paginer } from "../models/finances";
import { DEPENSES_PAGE_SIZE } from "../permissions";
import { CaisseSelector } from "./caisse-selector";

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
	return dateLocaleISO();
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
	const [caisseFermee, setCaisseFermee] = useState(false);
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
				} else {
					const erreur = validerMontant(value.montant, "Le montant");
					if (erreur) fields.montant = erreur;
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
			setCaisseFermee(false);
			try {
				const corps = {
					date: value.date,
					montant: normaliserMontantPourBackend(value.montant),
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
				const apiError = toApiError(error);
				if (isCaisseFermeeError(apiError)) {
					setCaisseFermee(true);
					setGlobalError(apiError.message);
				} else {
					setGlobalError(
						getErrorMessageForCode(apiError.code) ??
							(apiError.message || "Une erreur est survenue."),
					);
				}
			}
		},
	});
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>
					{depense ? "Modifier la dépense" : "Ajouter une dépense"}
				</DialogTitle>
				<DialogDescription>
					Enregistrement d'une sortie de trésorerie.
				</DialogDescription>
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
										onChange={(event) => field.handleChange(event.target.value)}
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
					{caisseFermee ? (
						<div
							role="alert"
							className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
						>
							<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
							<span>{globalError}</span>
						</div>
					) : globalError ? (
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
			</DialogContent>
		</Dialog>
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
	// Verbes dédiés (DEPENSE.*) depuis le split backend des permissions dépenses
	// — avant, ces actions étaient gated par les verbes FINANCES.* partagés
	// avec les paiements. Seuls ADMINISTRATEUR/DIRIGEANT ont ces nouveaux
	// codes ; un caissier garde FINANCES.CREER (pour les paiements) mais perd
	// le bouton « Ajouter une dépense », intentionnellement.
	const canCreer = useCan("DEPENSE.CREER");
	const canModifier = useCan("DEPENSE.MODIFIER");
	const canSupprimer = useCan("DEPENSE.SUPPRIMER");
	const canVoir = useCan("FINANCES.VOIR");
	const userCaisse = useCurrentCaisse();

	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [idCaisse, setIdCaisse] = useState(
		initialSearch.id_caisse ?? userCaisse ?? "",
	);
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

	const changerFiltre = (patch: {
		du?: string;
		au?: string;
		id_caisse?: string;
	}) => {
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Dépenses" }]}
				title="Dépenses"
				description="Sorties de trésorerie enregistrées."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter une dépense
						</Button>
					) : undefined
				}
			/>

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
				<EmptyState title="Aucune dépense trouvée." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>DATE</Th>
								<Th>LIBELLÉ</Th>
								<Th>CATÉGORIE</Th>
								<Th className="text-right">MONTANT</Th>
								<Th className="text-right">ACTIONS</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((depense) => (
								<Tr key={depense.id}>
									<Td className="text-muted-foreground">
										{formatDateISO(depense.date.slice(0, 10))}
									</Td>
									<Td className="font-medium text-foreground">
										{depense.libelle}
									</Td>
									<Td className="text-muted-foreground">
										{categories.get(depense.id_categorie_depense) ?? "—"}
									</Td>
									<Td className="text-right font-semibold text-destructive">
										- {formatMontantFCFA(depense.montant)}
									</Td>
									<Td>
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
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
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
