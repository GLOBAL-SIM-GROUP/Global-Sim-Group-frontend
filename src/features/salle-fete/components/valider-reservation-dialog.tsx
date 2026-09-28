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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Valider la demande de réservation</DialogTitle>
				<DialogDescription>
					{reservation
						? `${reservation.type_manifestation} — ${reservation.date_evenement} à ${reservation.heure_debut?.slice(0, 5)} (${reservation.duree} h).`
						: "Tarifer la demande et la passer en « Réservée »."}
				</DialogDescription>

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
			</DialogContent>
		</Dialog>
	);
}
