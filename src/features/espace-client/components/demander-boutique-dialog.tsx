import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { formatMontantFCFA } from "#/features/residence/models/format";

import type { LigneArticlePanier } from "../models/panier-articles";

interface DemanderBoutiqueDialogProps {
	open: boolean;
	lignes: LigneArticlePanier[];
	total: number;
	isPending: boolean;
	erreur?: string | null;
	onSubmit: (valeurs: { note?: string }) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Finalisation d'une demande boutique depuis le panier (espace client) :
 * récapitulatif des lignes + note libre optionnelle. Le total affiché est
 * indicatif — le serveur fige les prix au `prix_vente` catalogue du moment.
 * Pas de paiement en ligne : validation par le personnel puis règlement au
 * comptoir au retrait.
 */
export function DemanderBoutiqueDialog({
	open,
	lignes,
	total,
	isPending,
	erreur,
	onSubmit,
	onOpenChange,
}: DemanderBoutiqueDialogProps) {
	const [note, setNote] = useState("");

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) setNote("");
				onOpenChange(next);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Envoyer ma demande
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Votre demande sera validée par le personnel de la boutique —
						paiement au comptoir au retrait, pas de paiement en ligne.
					</Dialog.Description>

					<ul className="mt-3 space-y-1 rounded-lg border border-border bg-accent/20 p-3 text-sm">
						{lignes.map((ligne) => (
							<li key={ligne.id} className="flex justify-between gap-3">
								<span className="truncate text-foreground">
									{ligne.quantite}× {ligne.nom}
								</span>
								<span className="shrink-0 tabular-nums text-muted-foreground">
									{formatMontantFCFA(
										String(Number(ligne.prix) * ligne.quantite),
									)}
								</span>
							</li>
						))}
						<li className="flex justify-between gap-3 border-t border-border pt-1 font-semibold text-foreground">
							<span>Total estimé</span>
							<span className="tabular-nums">
								{formatMontantFCFA(String(total))}
							</span>
						</li>
					</ul>

					<div className="mt-4 space-y-2">
						<Label htmlFor="note-boutique">Note (optionnel)</Label>
						<Textarea
							id="note-boutique"
							maxLength={500}
							placeholder="Ex. : à récupérer ce soir, taille du vêtement…"
							value={note}
							onChange={(event) => setNote(event.target.value)}
							disabled={isPending}
						/>
					</div>

					{erreur ? (
						<p
							role="alert"
							className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
						>
							{erreur}
						</p>
					) : null}

					<div className="mt-5 flex items-center justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							disabled={isPending}
							onClick={() => onOpenChange(false)}
						>
							Annuler
						</Button>
						<Button
							type="button"
							disabled={isPending}
							className="bg-lagoon text-white hover:bg-lagoon/90"
							onClick={() => onSubmit({ note: note.trim() || undefined })}
						>
							{isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Envoyer la demande
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
