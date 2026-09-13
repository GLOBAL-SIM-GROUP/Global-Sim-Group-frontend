import { useForm } from "@tanstack/react-form";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
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
import {
	getErrorMessageForCode,
	isCaisseFermeeError,
	toApiError,
} from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { useEncaisserCaution } from "../hooks/use-contrats";
import type { MoyenPaiement } from "../models/moyens-paiement";

interface EncaisserCautionFormDialogProps {
	open: boolean;
	idContrat: string;
	/** Montant de la caution, préremplissage éditable du champ montant. */
	montantCaution: string;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Encaisser la caution » (POST `/contrats/{id}/caution/encaisser`) :
 * enregistre en une seule opération un vrai paiement (`finances.paiement`
 * ENCAISSEMENT) et marque la caution payée. Une fois l'opération réussie,
 * affiche la référence du paiement créé avant de fermer — c'est un
 * mouvement réel, pas une simple déclaration comme l'ancien
 * `VersementCautionFormDialog` (toujours disponible pour un versement déjà
 * fait hors système).
 */
export function EncaisserCautionFormDialog({
	open,
	idContrat,
	montantCaution,
	moyens,
	onOpenChange,
	onSaved,
}: EncaisserCautionFormDialogProps) {
	const mutation = useEncaisserCaution();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [caisseFermee, setCaisseFermee] = useState(false);
	const [confirmation, setConfirmation] = useState<{
		idPaiement: string | null;
	} | null>(null);

	const form = useForm({
		defaultValues: {
			montant: montantCaution,
			idMoyen: moyens[0]?.id ?? "",
			date: "",
			reference: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (value.montant.trim()) {
					const erreur = validerMontant(value.montant, "Le montant");
					if (erreur) fields.montant = erreur;
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
			try {
				const resultat = await mutation.mutateAsync({
					idContrat,
					idMoyen: value.idMoyen,
					montant: value.montant.trim()
						? normaliserMontantPourBackend(value.montant)
						: null,
					date: value.date || null,
					reference: value.reference || null,
				});
				setConfirmation({ idPaiement: resultat.id_paiement ?? null });
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

	const fermerApresConfirmation = () => {
		setConfirmation(null);
		onSaved();
	};

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(ouvert) => {
				if (!ouvert) setConfirmation(null);
				onOpenChange(ouvert);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					{confirmation ? (
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<CheckCircle2
									className="mt-0.5 size-5 shrink-0 text-[#27AE60]"
									aria-hidden
								/>
								<div>
									<Dialog.Title className="text-base font-semibold text-foreground">
										Caution encaissée
									</Dialog.Title>
									<Dialog.Description className="mt-1 text-sm text-muted-foreground">
										Le paiement a été enregistré
										{confirmation.idPaiement ? (
											<>
												{" "}
												— référence{" "}
												<span className="font-mono">
													{confirmation.idPaiement}
												</span>
											</>
										) : null}
										.
									</Dialog.Description>
								</div>
							</div>
							<div className="flex justify-end">
								<Button onClick={fermerApresConfirmation}>Fermer</Button>
							</div>
						</div>
					) : (
						<>
							<Dialog.Title className="text-base font-semibold text-foreground">
								Encaisser la caution
							</Dialog.Title>
							<Dialog.Description className="mt-1 text-sm text-muted-foreground">
								Enregistre le paiement réel de la caution (module Finances).
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
											placeholder="ex : 150000"
											inputMode="numeric"
											autoComplete="off"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
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
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											error={field.state.meta.errors[0]}
										/>
									)}
								</form.Field>

								<form.Field name="reference">
									{(field) => (
										<InputField
											id={field.name}
											name={field.name}
											label="Référence (optionnelle)"
											placeholder="Défaut : CAUTION-<id>"
											autoComplete="off"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											error={field.state.meta.errors[0]}
										/>
									)}
								</form.Field>

								{caisseFermee ? (
									<div
										role="alert"
										className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
									>
										<AlertTriangle
											className="mt-0.5 size-4 shrink-0"
											aria-hidden
										/>
										<span>{globalError}</span>
									</div>
								) : globalError ? (
									<p
										role="alert"
										className="text-sm font-medium text-destructive"
									>
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
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
												) : null}
												{isSubmitting
													? "Encaissement…"
													: "Encaisser la caution"}
											</Button>
										</div>
									)}
								</form.Subscribe>
							</form>
						</>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
