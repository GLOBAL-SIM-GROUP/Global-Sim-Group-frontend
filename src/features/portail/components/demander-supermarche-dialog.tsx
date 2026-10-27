import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { formatMontantFCFA } from "#/features/residence/models/format";

import type { LigneArticlePanier } from "../models/panier-articles";

interface DemanderSuperMarcheDialogProps {
	open: boolean;
	lignes: LigneArticlePanier[];
	total: number;
	isPending: boolean;
	erreur?: string | null;
	onSubmit: (valeurs: { note?: string }) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Finalisation d'une demande super-marché depuis le panier : récapitulatif des
 * lignes + note libre optionnelle. Le total affiché est indicatif — le
 * serveur fige les prix au `prix_vente` catalogue du moment. Pas de
 * paiement en ligne : validation par le personnel puis règlement au
 * comptoir au retrait. Partagé entre l'espace client et le portail
 * résident.
 */
export function DemanderSuperMarcheDialog({
	open,
	lignes,
	total,
	isPending,
	erreur,
	onSubmit,
	onOpenChange,
}: DemanderSuperMarcheDialogProps) {
	const [note, setNote] = useState("");

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setNote("");
				onOpenChange(next);
			}}
		>
			<DialogContent className="max-h-[85dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Envoyer ma demande</DialogTitle>
					<DialogDescription>
						Votre demande sera validée par le personnel du super-marché —
						paiement au comptoir au retrait, pas de paiement en ligne.
					</DialogDescription>
				</DialogHeader>

				<ul className="mt-3 space-y-1 rounded-lg border border-border bg-accent/20 p-3 text-sm">
					{lignes.map((ligne) => (
						<li key={ligne.id} className="flex justify-between gap-3">
							<span className="truncate text-foreground">
								{ligne.quantite}× {ligne.nom}
							</span>
							<span className="shrink-0 tabular-nums text-muted-foreground">
								{formatMontantFCFA(String(Number(ligne.prix) * ligne.quantite))}
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
					<Label htmlFor="note-super-marché">Note (optionnel)</Label>
					<Textarea
						id="note-super-marché"
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

				<DialogFooter className="mt-5">
					<Button
						type="button"
						variant="ghost"
						className="rounded-full"
						disabled={isPending}
						onClick={() => onOpenChange(false)}
					>
						Annuler
					</Button>
					<Button
						type="button"
						className="rounded-full"
						disabled={isPending}
						onClick={() => onSubmit({ note: note.trim() || undefined })}
					>
						{isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						Envoyer la demande
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
