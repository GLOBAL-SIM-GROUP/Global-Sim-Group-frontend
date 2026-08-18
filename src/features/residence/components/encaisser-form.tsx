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

import { useEncaisserEcheance } from "../hooks/use-echeances";
import type { Echeance } from "../models/contrats";
import type { MoyenPaiement } from "../models/moyens-paiement";

interface EncaisserFormProps {
	echeance: Echeance;
	/** Moyens de paiement disponibles (module Finances) ; vide si aucun. */
	moyens: MoyenPaiement[];
	onCancel: () => void;
	onSaved: () => void;
}

/**
 * Formulaire « Enregistrer un paiement » d'une échéance (POST
 * `/echeances/{id}/encaisser`). Montant prérempli avec le montant de
 * l'échéance ; sélecteur de moyen de paiement obligatoire.
 */
export function EncaisserForm({
	echeance,
	moyens,
	onCancel,
	onSaved,
}: EncaisserFormProps) {
	const mutation = useEncaisserEcheance();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			montant: echeance.montant,
			idMoyen: moyens[0]?.id ?? "",
			date: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<"montant" | "idMoyen", string>> = {};
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.montant.trim())) {
					fields.montant = "Le montant doit être un nombre.";
				}
				if (!value.idMoyen) {
					fields.idMoyen = "Sélectionnez un moyen de paiement.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await mutation.mutateAsync({
					id: echeance.id,
					montant: value.montant.trim(),
					idMoyen: value.idMoyen,
					date: value.date || undefined,
				});
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
			<form.Field name="montant">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Montant (FCFA)"
						inputMode="numeric"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="idMoyen">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Moyen de paiement</Label>
						<Select
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							<SelectTrigger
								id={field.name}
								aria-label="Moyen de paiement"
								className="w-full"
							>
								<SelectValue placeholder="Sélectionner un moyen" />
							</SelectTrigger>
							<SelectContent>
								{moyens.map((moyen) => (
									<SelectItem key={moyen.id} value={moyen.id}>
										{moyen.libelle}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{moyens.length === 0 ? (
							<p className="text-xs text-muted-foreground">
								Aucun moyen de paiement configuré (module Finances).
							</p>
						) : null}
						{field.state.meta.errors[0] ? (
							<p className="text-sm text-destructive">
								{field.state.meta.errors[0]}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="date">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Date (optionnelle)"
						type="date"
						autoComplete="off"
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
							{isSubmitting ? "Enregistrement…" : "Enregistrer le paiement"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
