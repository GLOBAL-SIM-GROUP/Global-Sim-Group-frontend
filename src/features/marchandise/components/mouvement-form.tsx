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
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useCreerMouvement } from "../hooks/use-mouvements";
import {
	MOUVEMENT_TYPE_LABELS,
	type MouvementType,
} from "../models/mouvements";
import type { Produit } from "../models/produits";

interface MouvementFormProps {
	produits: Produit[];
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

/**
 * Formulaire « Ajouter un mouvement » (M3) : entrée, sortie ou ajustement de
 * stock pour un produit. La quantité est signée pour un ajustement.
 */
export function MouvementForm({
	produits,
	onCancel,
	onSaved,
}: MouvementFormProps) {
	const mutation = useCreerMouvement();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idProduit: "",
			type: "ENTREE" as MouvementType,
			quantite: "",
			motif: "",
			documentRef: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.idProduit) fields.idProduit = "Sélectionnez un produit.";
				if (!value.quantite.trim()) {
					fields.quantite = "Ce champ est requis.";
				} else if (!/^-?\d+(\.\d+)?$/.test(value.quantite.trim())) {
					fields.quantite = "La quantité doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await mutation.mutateAsync({
					idProduit: value.idProduit,
					type: value.type,
					quantite: value.quantite.trim(),
					motif: value.motif.trim() || null,
					documentRef: value.documentRef.trim() || null,
				});
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
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="idProduit">
				{(field) => (
					<SelectField
						id={field.name}
						label="Produit"
						value={field.state.value}
						onValueChange={field.handleChange}
					>
						{produits.map((produit) => (
							<SelectItem key={produit.id} value={produit.id}>
								{produit.reference} — {produit.nom}
							</SelectItem>
						))}
					</SelectField>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="type">
					{(field) => (
						<SelectField
							id={field.name}
							label="Type"
							value={field.state.value}
							onValueChange={(valeur) =>
								field.handleChange(valeur as MouvementType)
							}
						>
							{(Object.keys(MOUVEMENT_TYPE_LABELS) as MouvementType[]).map(
								(type) => (
									<SelectItem key={type} value={type}>
										{MOUVEMENT_TYPE_LABELS[type]}
									</SelectItem>
								),
							)}
						</SelectField>
					)}
				</form.Field>

				<form.Field name="quantite">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Quantité"
							placeholder="ex : 10.00 (négative pour un ajustement)"
							inputMode="decimal"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="motif">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Motif (optionnel)"
							placeholder="ex : Réappro fournisseur"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="documentRef">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Document (optionnel)"
							placeholder="ex : BL-2026-0147"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

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
