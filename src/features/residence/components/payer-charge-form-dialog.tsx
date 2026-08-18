import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
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

import { usePayerCharge } from "../hooks/use-charges";
import type { Charge } from "../models/charges";
import type { MoyenPaiement } from "../models/moyens-paiement";

interface PayerChargeFormDialogProps {
	open: boolean;
	charge: Charge | null;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Enregistrer le paiement » d'une charge (POST `/charges/{id}/payer`).
 * Montant prérempli avec le reste à payer.
 */
export function PayerChargeFormDialog({
	open,
	charge,
	moyens,
	onOpenChange,
	onSaved,
}: PayerChargeFormDialogProps) {
	const mutation = usePayerCharge();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			montant: charge?.reste_a_payer ?? "",
			idMoyen: moyens[0]?.id ?? "",
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
			if (!charge) return;
			try {
				await mutation.mutateAsync({
					id: charge.id,
					montant: value.montant.trim(),
					idMoyen: value.idMoyen,
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Enregistrer le paiement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{charge
							? `Charge ${charge.periode} — reste à payer ${charge.reste_a_payer} FCFA.`
							: "Paiement de la charge."}
					</Dialog.Description>

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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
