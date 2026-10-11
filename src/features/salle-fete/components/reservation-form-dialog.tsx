import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import { getErrorMessageForCode, toApiError } from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { useCatalogueSalleFete } from "../hooks/use-catalogue";
import {
	useCreerReservation,
	useModifierReservation,
} from "../hooks/use-reservations";
import type { ReservationFete } from "../models/reservations";

/** Valeur sentinelle du Select pour la saisie libre hors catalogue. */
const AUTRE_TYPE = "__autre__";

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
	const catalogueQuery = useCatalogueSalleFete();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [saisieLibre, setSaisieLibre] = useState(false);

	// Le Select n'apparaît que si le catalogue répond et contient des types
	// actifs — sinon le champ reste une saisie libre (comportement de repli,
	// `hors_catalogue: true` sera envoyé).
	const typesActifs = (catalogueQuery.data ?? []).filter((t) => t.actif);
	const cataloguePret = catalogueQuery.isSuccess && typesActifs.length > 0;

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
				} else {
					const erreur = validerMontant(value.tarif, "Le tarif");
					if (erreur) fields.tarif = erreur;
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
					// `false` seulement quand le libellé est un type actif du
					// catalogue — le serveur le vérifie alors contre la liste.
					horsCatalogue: !typesActifs.some(
						(t) => t.libelle === value.typeManifestation.trim(),
					),
					tarif: normaliserMontantPourBackend(value.tarif),
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>
					{reservation
						? "Modifier la réservation"
						: "Nouvelle réservation — Salle de fête"}
				</DialogTitle>
				<DialogDescription>
					Créez ou modifiez une réservation de la salle.
				</DialogDescription>

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
							{(field) => {
								const dansCatalogue = typesActifs.some(
									(t) => t.libelle === field.state.value,
								);
								// Libre si l'utilisateur choisit « Autre… » ou si la valeur
								// (ex. édition d'une réservation hors catalogue) n'est pas
								// dans la liste.
								const modeLibre =
									saisieLibre || (field.state.value !== "" && !dansCatalogue);
								return cataloguePret ? (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Type de manifestation</Label>
										<Select
											value={modeLibre ? AUTRE_TYPE : field.state.value}
											onValueChange={(valeur) => {
												setSaisieLibre(valeur === AUTRE_TYPE);
												if (valeur !== AUTRE_TYPE) field.handleChange(valeur);
											}}
										>
											<SelectTrigger
												id={field.name}
												aria-invalid={
													field.state.meta.errors.length > 0 ? true : undefined
												}
											>
												<SelectValue placeholder="Choisir dans le catalogue…" />
											</SelectTrigger>
											<SelectContent>
												{typesActifs.map((type) => (
													<SelectItem
														key={type.id_type_manifestation}
														value={type.libelle}
													>
														{type.libelle}
													</SelectItem>
												))}
												<SelectItem value={AUTRE_TYPE}>
													Autre (saisie libre)…
												</SelectItem>
											</SelectContent>
										</Select>
										{modeLibre ? (
											<InputField
												id={`${field.name}-libre`}
												name={`${field.name}-libre`}
												placeholder="ex : Réunion de famille"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										) : null}
										{field.state.meta.errors[0] ? (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]}
											</p>
										) : null}
									</div>
								) : (
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
								);
							}}
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
			</DialogContent>
		</Dialog>
	);
}
