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

import type { CommandeRestaurant } from "../models/commandes";

interface CommandeRefusDialogProps {
	commande: CommandeRestaurant | null;
	isPending: boolean;
	onConfirm: (motif: string) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Refus d'une demande de commande du portail `EN_ATTENTE` (staff) — passe la
 * commande en `ANNULEE` avec un motif optionnel restitué au résident
 * (`motif_annulation`). Pattern `AnnulerDemandeDialog` du portail + champ
 * motif.
 */
export function CommandeRefusDialog({
	commande,
	isPending,
	onConfirm,
	onOpenChange,
}: CommandeRefusDialogProps) {
	const [motif, setMotif] = useState("");
	const open = commande !== null;

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setMotif("");
				onOpenChange(next);
			}}
		>
			<DialogContent className="max-w-md">
				<DialogTitle>Refuser la demande</DialogTitle>
				<DialogDescription>
					La commande n° {commande?.id ?? ""} sera annulée. Le motif est
					communiqué au client.
				</DialogDescription>

				<label
					htmlFor="motif-refus"
					className="mt-4 block text-sm font-medium text-foreground"
				>
					Motif du refus (optionnel)
				</label>
				<Textarea
					id="motif-refus"
					value={motif}
					onChange={(event) => setMotif(event.target.value)}
					placeholder="Ex. : créneau complet, plat indisponible…"
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
			</DialogContent>
		</Dialog>
	);
}
