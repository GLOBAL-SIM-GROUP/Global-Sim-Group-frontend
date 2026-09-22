import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { toApiError } from "#/core/api";

import { useAnnulerSejour } from "../hooks/use-sejours";
import type { Sejour } from "../models/sejours";

interface RefuserSejourDialogProps {
	open: boolean;
	sejour: Sejour | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Refuser la demande » d'un séjour `EN_ATTENTE` (POST
 * `/residence/sejours/{id}/annuler`, `RESIDENCE.ANNULER`). Le motif
 * (optionnel, ≤255) est conservé et restitué au client dans
 * `motif_annulation`. 409 si la demande a déjà été traitée.
 */
export function RefuserSejourDialog({
	open,
	sejour,
	onOpenChange,
	onSaved,
}: RefuserSejourDialogProps) {
	const mutation = useAnnulerSejour();
	const [motif, setMotif] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);

	function confirmer() {
		if (!sejour) return;
		setErreur(null);
		mutation.mutate(
			{ id: sejour.id, motif: motif.trim() || undefined },
			{
				onSuccess: () => {
					setMotif("");
					onSaved();
				},
				onError: (error) =>
					setErreur(
						toApiError(error).message || "Impossible de refuser la demande.",
					),
			},
		);
	}

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Refuser la demande de séjour
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{sejour
							? `Séjour ${sejour.numero_logement} — le refus est définitif et le motif sera visible par le client.`
							: "Refus de la demande."}
					</Dialog.Description>

					<div className="mt-4 space-y-2">
						<Label htmlFor="refus-motif">
							Motif du refus (optionnel, 255 caractères max)
						</Label>
						<Textarea
							id="refus-motif"
							rows={3}
							maxLength={255}
							placeholder="Ex. Aucun logement disponible sur la période"
							value={motif}
							onChange={(event) => setMotif(event.target.value)}
						/>
					</div>

					{erreur ? (
						<p
							role="alert"
							className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
						>
							{erreur}
						</p>
					) : null}

					<div className="mt-5 flex items-center justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							disabled={mutation.isPending}
							onClick={() => onOpenChange(false)}
						>
							Annuler
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={mutation.isPending}
							onClick={confirmer}
						>
							{mutation.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{mutation.isPending ? "Refus…" : "Refuser la demande"}
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
