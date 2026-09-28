import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil, Plus, Power, PowerOff } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { PageHeader } from "#/components/ui/page-header";
import { Switch } from "#/components/ui/switch";
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
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import { formatMontantFCFA } from "#/features/residence/models/format";

import {
	useCreerPrestation,
	useModifierPrestation,
	usePrestations,
} from "../hooks/use-prestations";
import type { Prestation } from "../models/prestations";

/** Modale « Ajouter / Modifier une prestation ». */
function PrestationFormDialog({
	open,
	prestation,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	prestation: Prestation | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const createMutation = useCreerPrestation();
	const editMutation = useModifierPrestation();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			libelle: prestation?.libelle ?? "",
			categorie: prestation?.categorie ?? "",
			prix: prestation?.prix ?? "",
			description: prestation?.description ?? "",
			actif: prestation?.actif ?? true,
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.libelle.trim()) fields.libelle = "Ce champ est requis.";
				if (!value.prix.trim()) {
					fields.prix = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(value.prix, "Le prix");
					if (erreur) fields.prix = erreur;
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					libelle: value.libelle.trim(),
					categorie: value.categorie.trim() || null,
					prix: normaliserMontantPourBackend(value.prix),
					description: value.description.trim() || null,
					actif: value.actif,
				};
				if (prestation) {
					await editMutation.mutateAsync({ id: prestation.id, ...corps });
				} else {
					await createMutation.mutateAsync(corps);
				}
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
				<DialogTitle>
					{prestation ? "Modifier la prestation" : "Ajouter une prestation"}
				</DialogTitle>
				<DialogDescription>
					Prestation facturable pour une facturation ponctuelle.
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
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					<form.Field name="categorie">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Catégorie"
								placeholder="ex : Événementiel"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					<form.Field name="prix">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Prix (FCFA)"
								inputMode="numeric"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					<form.Field name="description">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Description (optionnelle)"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					<form.Field name="actif">
						{(field) => (
							<div className="flex items-center gap-3">
								<Label htmlFor={field.name}>Actif</Label>
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</div>
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
 * Page « Prestations facturables » (module Facturation, M7) : catalogue des
 * prestations configurées par l'administrateur, Ajouter/Modifier/Désactiver.
 */
export function PrestationsPage() {
	const canCreer = useCan("FACTURATION.CREER");
	const canModifier = useCan("FACTURATION.MODIFIER");
	const prestationsQuery = usePrestations();
	const toggleMutation = useModifierPrestation();
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Prestation | null>(null);
	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Prestations facturables" },
				]}
				title="Prestations facturables"
				description="Catalogue des prestations pour facturation ponctuelle."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter une prestation
						</Button>
					) : undefined
				}
			/>

			{prestationsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : prestationsQuery.isError ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les prestations.</p>
				</div>
			) : (prestationsQuery.data ?? []).length === 0 ? (
				<EmptyState title="Aucune prestation trouvée." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>LIBELLÉ</Th>
								<Th>CATÉGORIE</Th>
								<Th>PRIX</Th>
								<Th>ACTIF</Th>
								<Th className="text-right">ACTIONS</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{(prestationsQuery.data ?? []).map((prestation) => (
								<Tr key={prestation.id}>
									<Td className="font-medium text-foreground">
										{prestation.libelle}
									</Td>
									<Td className="text-muted-foreground">
										{prestation.categorie ?? "—"}
									</Td>
									<Td className="text-foreground">
										{formatMontantFCFA(prestation.prix)}
									</Td>
									<Td>
										<Badge variant={prestation.actif ? "success" : "neutral"}>
											{prestation.actif ? "Oui" : "Non"}
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
														onClick={() => setAModifier(prestation)}
													>
														<Pencil className="size-4" aria-hidden />
														<span className="sr-only">Modifier</span>
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														title={prestation.actif ? "Désactiver" : "Activer"}
														onClick={() =>
															toggleMutation.mutate({
																id: prestation.id,
																libelle: prestation.libelle,
																prix: prestation.prix,
																actif: !prestation.actif,
															})
														}
													>
														{prestation.actif ? (
															<PowerOff className="size-4" aria-hidden />
														) : (
															<Power className="size-4" aria-hidden />
														)}
														<span className="sr-only">
															{prestation.actif ? "Désactiver" : "Activer"}
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

			<PrestationFormDialog
				open={formOuvert || aModifier !== null}
				prestation={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>
		</div>
	);
}
