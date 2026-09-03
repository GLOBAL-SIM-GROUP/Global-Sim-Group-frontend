import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";

import {
	useCreerReservation,
	useModifierReservation,
} from "../hooks/use-reservations";
import type { ReservationFete } from "../models/reservations";

interface ReservationFormDialogProps {
	open: boolean;
	reservation: ReservationFete | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Nouvelle réservation — Salle de fête » (M6) : recherche client,
 * date, heure, durée, type de manifestation, tarif, acompte, observations.
 */
export function ReservationFormDialog({
	open,
	reservation,
	onOpenChange,
	onSaved,
}: ReservationFormDialogProps) {
	const createMutation = useCreerReservation();
	const editMutation = useModifierReservation();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idClient: reservation?.id_client ?? "",
			dateEvenement: reservation?.date_evenement ?? "",
			heureDebut: reservation?.heure_debut ?? "",
			duree: reservation?.duree?.toString() ?? "",
			typeManifestation: reservation?.type_manifestation ?? "",
			tarif: reservation?.tarif ?? "",
			acompte: reservation?.acompte ?? "",
			observations: reservation?.observations ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!reservation && !value.idClient)
					fields.idClient = "Sélectionnez un client.";
				if (!value.dateEvenement.trim())
					fields.dateEvenement = "Ce champ est requis.";
				if (!value.heureDebut.trim())
					fields.heureDebut = "Ce champ est requis.";
				if (!value.duree.trim()) fields.duree = "Ce champ est requis.";
				if (!value.typeManifestation.trim())
					fields.typeManifestation = "Ce champ est requis.";
				if (!value.tarif.trim()) {
					fields.tarif = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.tarif.trim())) {
					fields.tarif = "Le tarif doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					idClient: value.idClient || null,
					dateEvenement: value.dateEvenement,
					heureDebut: value.heureDebut,
					duree: value.duree.trim(),
					typeManifestation: value.typeManifestation.trim(),
					tarif: value.tarif.trim(),
					acompte: value.acompte.trim() || null,
					observations: value.observations.trim() || null,
				};
				if (reservation) {
					await editMutation.mutateAsync({ id: reservation.id, ...corps });
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
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{reservation
							? "Modifier la réservation"
							: "Nouvelle réservation — Salle de fête"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Créez ou modifiez une réservation de la salle.
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						{!reservation ? (
							<form.Field name="idClient">
								{(field) => (
									<ClientRechercheField
										value={field.state.value}
										onChange={(id) => field.handleChange(id)}
									/>
								)}
							</form.Field>
						) : null}

						<div className="grid gap-4 sm:grid-cols-2">
							<form.Field name="dateEvenement">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Date de l'événement"
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="heureDebut">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Heure de début"
										type="time"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="duree">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Durée (en heures)"
										inputMode="numeric"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="typeManifestation">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Type de manifestation"
										placeholder="ex : Mariage"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="tarif">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Tarif (FCFA)"
										inputMode="numeric"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="acompte">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Acompte (FCFA, optionnel)"
										inputMode="numeric"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>

						<form.Field name="observations">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Observations</Label>
									<textarea
										id={field.name}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
										value={field.state.value}
										onChange={(event) => field.handleChange(event.target.value)}
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
