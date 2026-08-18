import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useCreerPlat, useModifierPlat } from "../hooks/use-plats";
import type { CategoriePlat, Plat } from "../models/plats";

interface PlatFormProps {
	plat: Plat | null;
	categories: CategoriePlat[];
	onCancel: () => void;
	onSaved: () => void;
}

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	value,
	onValueChange,
	children,
}: {
	id: string;
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}

/** Formulaire « Ajouter / Modifier un plat » (M5) : nom, catégorie, prix, dispo, description. */
export function PlatForm({
	plat,
	categories,
	onCancel,
	onSaved,
}: PlatFormProps) {
	const createMutation = useCreerPlat();
	const editMutation = useModifierPlat();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			nom: plat?.nom ?? "",
			idCategoriePlat: plat?.id_categorie_plat ?? "",
			prix: plat?.prix ?? "",
			disponible: plat?.disponible ?? true,
			description: plat?.description ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
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
					nom: value.nom.trim(),
					idCategoriePlat: value.idCategoriePlat || null,
					prix: value.prix.trim(),
					disponible: value.disponible,
					description: value.description.trim() || null,
				};
				if (plat) {
					await editMutation.mutateAsync({ id: plat.id, ...corps });
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
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="nom">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Nom"
						placeholder="ex : Attiéké poisson"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="idCategoriePlat">
					{(field) => (
						<SelectField
							id={field.name}
							label="Catégorie"
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							{categories.map((categorie) => (
								<SelectItem key={categorie.id} value={categorie.id}>
									{categorie.libelle}
								</SelectItem>
							))}
						</SelectField>
					)}
				</form.Field>

				<form.Field name="prix">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prix (FCFA)"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="description">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Description (optionnelle)"
						placeholder="ex : Servi avec riz et sauce"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="disponible">
				{(field) => (
					<div className="flex items-center gap-3">
						<Label htmlFor={field.name}>Disponible</Label>
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

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							disabled={isSubmitting}
							onClick={onCancel}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{isSubmitting ? "Enregistrement…" : "Enregistrer"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
