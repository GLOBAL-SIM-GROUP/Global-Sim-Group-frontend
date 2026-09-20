import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
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
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) setMotif("");
				onOpenChange(next);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{estRefus ? "Refuser la demande" : "Annuler la réservation"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{estRefus
							? `La demande du ${reservation?.date_evenement ?? ""} sera annulée définitivement. Le motif est communiqué au résident.`
							: `Voulez-vous vraiment annuler la réservation du ${reservation?.date_evenement ?? ""} ?`}
					</Dialog.Description>

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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
