import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

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

import { useCreerEmploye, useModifierEmploye } from "../hooks/use-employes";
import { useServices } from "../hooks/use-services";
import {
	EMPLOYE_STATUT_LABELS,
	type Employe,
	type EmployeStatut,
	TYPE_CONTRAT_LABELS,
	type TypeContrat,
} from "../models/employes";

const TYPE_CONTRATS: TypeContrat[] = ["CDI", "CDD", "APPRENTI", "AUTRE"];
const STATUTS: EmployeStatut[] = ["ACTIF", "INACTIF", "SUSPENDU"];

interface EmployeFormDialogProps {
	open: boolean;
	employe: Employe | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier un employé » (M9.1) : identité, fonction, service,
 * contrat, salaire et statut (statut uniquement en modification).
 */
export function EmployeFormDialog({
	open,
	employe,
	onOpenChange,
	onSaved,
}: EmployeFormDialogProps) {
	const servicesQuery = useServices();
	const createMutation = useCreerEmploye();
	const editMutation = useModifierEmploye();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const services = servicesQuery.data ?? [];

	const form = useForm({
		defaultValues: {
			nom: employe?.nom ?? "",
			prenom: employe?.prenom ?? "",
			telephone: employe?.telephone ?? "",
			fonction: employe?.fonction ?? "",
			idService: employe?.id_service ?? "",
			dateEmbauche: employe?.date_embauche ?? "",
			typeContrat: employe?.type_contrat ?? "",
			salaireBase: employe?.salaire_base ?? "",
			statut: employe?.statut ?? "ACTIF",
			autresInfos: employe?.autres_infos ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.fonction.trim()) fields.fonction = "Ce champ est requis.";
				if (!value.dateEmbauche) fields.dateEmbauche = "Ce champ est requis.";
				if (!value.typeContrat) fields.typeContrat = "Ce champ est requis.";
				if (!value.salaireBase.trim()) {
					fields.salaireBase = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.salaireBase.trim())) {
					fields.salaireBase = "Le salaire doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					nom: value.nom.trim(),
					prenom: value.prenom.trim(),
					telephone: value.telephone.trim() || null,
					fonction: value.fonction.trim(),
					idService: value.idService || null,
					dateEmbauche: value.dateEmbauche,
					typeContrat: value.typeContrat as TypeContrat,
					salaireBase: value.salaireBase.trim(),
					autresInfos: value.autresInfos.trim() || null,
				};
				if (employe) {
					await editMutation.mutateAsync({
						id: employe.id,
						...corps,
						statut: value.statut as EmployeStatut,
					});
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
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{employe ? "Modifier l'employé" : "Ajouter un employé"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Fiche d'un employé de la plateforme.
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
							<form.Field name="nom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Nom"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="prenom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Prénom (optionnel)"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="telephone">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Téléphone"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="fonction">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Fonction"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="idService">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Service</Label>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id={field.name}
												aria-label="Service"
												className="w-full"
											>
												<SelectValue placeholder="Sélectionner" />
											</SelectTrigger>
											<SelectContent>
												{services.map((service) => (
													<SelectItem key={service.id} value={service.id}>
														{service.libelle}
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
						</div>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="dateEmbauche">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Date d'embauche</Label>
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
							<form.Field name="typeContrat">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Type de contrat</Label>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger
												id={field.name}
												aria-label="Type de contrat"
												className="w-full"
											>
												<SelectValue placeholder="Sélectionner" />
											</SelectTrigger>
											<SelectContent>
												{TYPE_CONTRATS.map((type) => (
													<SelectItem key={type} value={type}>
														{TYPE_CONTRAT_LABELS[type]}
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
						</div>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="salaireBase">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Salaire de base (FCFA)"
										inputMode="numeric"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							{employe ? (
								<form.Field name="statut">
									{(field) => (
										<div className="space-y-1.5">
											<Label htmlFor={field.name}>Statut</Label>
											<Select
												value={field.state.value}
												onValueChange={(valeur) =>
													field.handleChange(valeur as EmployeStatut)
												}
											>
												<SelectTrigger
													id={field.name}
													aria-label="Statut"
													className="w-full"
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{STATUTS.map((statut) => (
														<SelectItem key={statut} value={statut}>
															{EMPLOYE_STATUT_LABELS[statut]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</form.Field>
							) : null}
						</div>
						<form.Field name="autresInfos">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Autres informations administratives"
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
