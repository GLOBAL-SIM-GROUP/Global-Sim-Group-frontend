import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { Textarea } from "#/components/ui/textarea";

import type { ReservationFete } from "../models/reservations";

interface AnnulerReservationDialogProps {
	reservation: ReservationFete | null;
	isPending: boolean;
	onConfirm: (motif: string) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Annulation d'une réservation salle de fête (staff) — sur une demande
 * `EN_ATTENTE` c'est un refus : le motif optionnel (≤255) est conservé dans
 * `motif_annulation` et restitué au résident. Pattern `VenteRefusDialog`
 * (marchandise) / `CommandeRefusDialog` (restaurant).
 */
export function AnnulerReservationDialog({
	reservation,
	isPending,
	onConfirm,
	onOpenChange,
}: AnnulerReservationDialogProps) {
	const [motif, setMotif] = useState("");
	const open = reservation !== null;
	const estRefus = reservation?.statut === "EN_ATTENTE";

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setMotif("");
				onOpenChange(next);
			}}
		>
			<DialogContent className="max-w-md">
				<DialogTitle>
					{estRefus ? "Refuser la demande" : "Annuler la réservation"}
				</DialogTitle>
				<DialogDescription>
					{estRefus
						? `La demande du ${reservation?.date_evenement ?? ""} sera annulée définitivement. Le motif est communiqué au résident.`
						: `Voulez-vous vraiment annuler la réservation du ${reservation?.date_evenement ?? ""} ?`}
				</DialogDescription>

				<label
					htmlFor="motif-annulation-reservation"
					className="mt-4 block text-sm font-medium text-foreground"
				>
					{estRefus ? "Motif du refus (recommandé)" : "Motif (optionnel)"}
				</label>
				<Textarea
					id="motif-annulation-reservation"
					value={motif}
					onChange={(event) => setMotif(event.target.value)}
					maxLength={255}
					placeholder={
						estRefus
							? "Ex. : créneau déjà attribué, salle indisponible…"
							: "Ex. : annulation demandée par le client…"
					}
					rows={3}
					className="mt-1.5"
					disabled={isPending}
				/>

				<div className="mt-5 flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						disabled={isPending}
						onClick={() => onOpenChange(false)}
					>
						Fermer
					</Button>
					<Button
						type="button"
						variant="destructive"
						disabled={isPending}
						onClick={() => onConfirm(motif.trim())}
					>
						{isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						{estRefus ? "Refuser" : "Annuler"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
