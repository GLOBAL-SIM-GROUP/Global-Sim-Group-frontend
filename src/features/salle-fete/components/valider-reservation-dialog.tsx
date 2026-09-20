import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { useValiderReservation } from "../hooks/use-reservations";
import type { ReservationFete } from "../models/reservations";

interface ValiderReservationDialogProps {
	open: boolean;
	/** Demande `EN_ATTENTE` à tarifer (liste ou fiche). */
	reservation: ReservationFete | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Valider la demande de réservation » (portail résident) : saisie du
 * tarif (+ acompte convenu optionnel) puis
 * `POST /salle-fete/reservations/{id}/valider` → `RESERVEE`
 * (SALLE_FETE.VALIDER). Pas d'encaissement ici : l'acompte n'est qu'un montant
 * convenu, encaissé physiquement au comptoir.
 */
export function ValiderReservationDialog({
	open,
	reservation,
	onOpenChange,
	onSaved,
}: ValiderReservationDialogProps) {
	const mutation = useValiderReservation();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [tarif, setTarif] = useState("");
	const [acompte, setAcompte] = useState("");

	const valider = (): string | null => {
		const erreurTarif = validerMontant(tarif, "Le tarif");
		if (erreurTarif) return erreurTarif;
		if (acompte.trim()) {
			const erreurAcompte = validerMontant(acompte, "L'acompte");
			if (erreurAcompte) return erreurAcompte;
			if (Number(acompte) > Number(tarif)) {
				return "L'acompte ne peut pas dépasser le tarif.";
			}
		}
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		if (!reservation) return;
		try {
			await mutation.mutateAsync({
				id: reservation.id,
				tarif: normaliserMontantPourBackend(tarif),
				acompte: acompte.trim() ? normaliserMontantPourBackend(acompte) : null,
			});
			onSaved();
		} catch (error) {
			setGlobalError(
				getErrorMessageForCode(toApiError(error).code) ??
					(toApiError(error).message || "Une erreur est survenue."),
			);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Valider la demande de réservation
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{reservation
							? `${reservation.type_manifestation} — ${reservation.date_evenement} à ${reservation.heure_debut?.slice(0, 5)} (${reservation.duree} h).`
							: "Tarifer la demande et la passer en « Réservée »."}
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void soumettre();
						}}
					>
						<InputField
							id="validation-tarif"
							name="tarif"
							label="Tarif (FCFA)"
							inputMode="numeric"
							value={tarif}
							onChange={(event) => setTarif(event.target.value)}
							error={undefined}
						/>
						<InputField
							id="validation-acompte"
							name="acompte"
							label="Acompte convenu (FCFA, optionnel)"
							inputMode="numeric"
							value={acompte}
							onChange={(event) => setAcompte(event.target.value)}
							error={undefined}
						/>

						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}

						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								disabled={mutation.isPending}
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								{mutation.isPending ? "Validation…" : "Valider et tarifer"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
