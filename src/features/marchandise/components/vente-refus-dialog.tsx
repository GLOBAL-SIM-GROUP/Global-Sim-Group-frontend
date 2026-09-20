import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";

import type { VenteJoin } from "../models/ventes";

interface VenteRefusDialogProps {
	vente: VenteJoin | null;
	isPending: boolean;
	onConfirm: (motif: string) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Refus d'une demande boutique du portail `EN_ATTENTE` (staff) — passe la
 * vente en `ANNULEE` avec un motif optionnel restitué au résident
 * (`motif_annulation`). Pattern `CommandeRefusDialog` du restaurant.
 */
export function VenteRefusDialog({
	vente,
	isPending,
	onConfirm,
	onOpenChange,
}: VenteRefusDialogProps) {
	const [motif, setMotif] = useState("");
	const open = vente !== null;

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
						Refuser la demande
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						La demande n° {vente?.id ?? ""} sera annulée. Le motif est
						communiqué au client.
					</Dialog.Description>

					<label
						htmlFor="motif-refus-vente"
						className="mt-4 block text-sm font-medium text-foreground"
					>
						Motif du refus (optionnel)
					</label>
					<Textarea
						id="motif-refus-vente"
						value={motif}
						onChange={(event) => setMotif(event.target.value)}
						placeholder="Ex. : produit épuisé, quantité indisponible…"
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
							Retour
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
							Refuser la demande
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
