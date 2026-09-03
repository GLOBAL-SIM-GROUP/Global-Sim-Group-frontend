import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil, Plus, Power, PowerOff } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

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
				} else if (!/^\d+(\.\d+)?$/.test(value.prix.trim())) {
					fields.prix = "Le prix doit être un nombre.";
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
					prix: value.prix.trim(),
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{prestation ? "Modifier la prestation" : "Ajouter une prestation"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Prestation facturable pour une facturation ponctuelle.
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
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
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Prestations facturables" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Prestations facturables
					</h1>
					<p className="text-muted-foreground">
						Catalogue des prestations pour facturation ponctuelle.
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter une prestation
					</Button>
				) : null}
			</div>

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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune prestation trouvée.
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
									CATÉGORIE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									PRIX
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
							{(prestationsQuery.data ?? []).map((prestation) => (
								<tr
									key={prestation.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{prestation.libelle}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{prestation.categorie ?? "—"}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(prestation.prix)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												prestation.actif
													? "bg-[#27AE60] text-white"
													: "bg-[#95A5A6] text-white",
											)}
										>
											{prestation.actif ? "Oui" : "Non"}
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
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
