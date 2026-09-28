import { useForm } from "@tanstack/react-form";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	getErrorMessageForCode,
	isCaisseFermeeError,
	toApiError,
} from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { usePayerSejour } from "../hooks/use-sejours";
import type { MoyenPaiement } from "../models/moyens-paiement";
import type { Sejour } from "../models/sejours";

interface PayerSejourFormDialogProps {
	open: boolean;
	sejour: Sejour | null;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Enregistrer le paiement » d'un séjour (POST `/sejours/{id}/payer`).
 * Montant prérempli avec le reste à payer.
 */
export function PayerSejourFormDialog({
	open,
	sejour,
	moyens,
	onOpenChange,
	onSaved,
}: PayerSejourFormDialogProps) {
	const mutation = usePayerSejour();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [caisseFermee, setCaisseFermee] = useState(false);

	const form = useForm({
		defaultValues: {
			montant: sejour?.reste_a_payer ?? "",
			idMoyen: moyens[0]?.id ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<"montant" | "idMoyen", string>> = {};
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(value.montant, "Le montant");
					if (erreur) {
						fields.montant = erreur;
					} else if (
						sejour &&
						Number(normaliserMontantPourBackend(value.montant)) >
							Number(sejour.reste_a_payer)
					) {
						// Capé côté client (le backend le refuserait de toute façon) :
						// on ne peut pas encaisser plus que le reste à payer.
						fields.montant = `Le montant ne peut pas dépasser le reste à payer (${sejour.reste_a_payer} FCFA).`;
					}
				}
				if (!value.idMoyen) {
					fields.idMoyen = "Sélectionnez un moyen de paiement.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			setCaisseFermee(false);
			if (!sejour) return;
			try {
				await mutation.mutateAsync({
					id: sejour.id,
					montant: normaliserMontantPourBackend(value.montant),
					idMoyen: value.idMoyen,
				});
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
			<DialogContent>
				<DialogTitle>Enregistrer le paiement</DialogTitle>
				<DialogDescription>
					{sejour
						? `Séjour — reste à payer ${sejour.reste_a_payer} FCFA.`
						: "Paiement du séjour."}
				</DialogDescription>

				<form
					className="mt-4 space-y-4"
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

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<div className="flex items-center justify-end gap-2 pt-2">
								<Button
									type="button"
									variant="ghost"
									disabled={isSubmitting}
									onClick={() => onOpenChange(false)}
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
			</DialogContent>
		</Dialog>
	);
}
