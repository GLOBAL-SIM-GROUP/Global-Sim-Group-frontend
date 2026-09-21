import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { formatMontantFCFA } from "#/features/residence/models/format";
import {
	type MoyenPaiement,
	moyensActifs,
} from "#/features/residence/models/moyens-paiement";

import type { VenteJoin } from "../models/ventes";

interface VenteEncaisserDialogProps {
	vente: VenteJoin | null;
	moyens: MoyenPaiement[];
	isPending: boolean;
	onConfirm: (body: { idMoyen: string }) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Encaissement d'une vente `EN_COURS` (staff, `FINANCES.ENCAISSER`) :
 * `POST /market/ventes/{id}/encaisser` — règlement **intégral** uniquement
 * (le montant est donc figé au total de la vente), la vente passe à `PAYEE`.
 * `PaiementVenteDto` n'expose que `{ montant, id_moyen }` — pas de date :
 * le serveur prend la date du jour. 400 si montant ≠ total ou caisse fermée
 * (erreur affichée par la page).
 */
export function VenteEncaisserDialog({
	vente,
	moyens,
	isPending,
	onConfirm,
	onOpenChange,
}: VenteEncaisserDialogProps) {
	const [idMoyen, setIdMoyen] = useState("");
	const open = vente !== null;
	const moyensProposables = moyensActifs(moyens);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) setIdMoyen("");
				onOpenChange(next);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Encaisser la vente
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Règlement intégral de la vente n° {vente?.id ?? ""}
						{vente?.origine === "PORTAIL"
							? " — demande boutique du portail validée, à régler au retrait"
							: ""}
						. La vente passe à « Payée ».
					</Dialog.Description>

					<p className="mt-4 text-sm text-foreground">
						Montant à encaisser :{" "}
						<span className="font-semibold">
							{formatMontantFCFA(vente?.total ?? "0")}
						</span>
					</p>

					<div className="mt-4 space-y-2">
						<Label htmlFor="encaisser-vente-moyen">Moyen de paiement</Label>
						<Select value={idMoyen} onValueChange={setIdMoyen}>
							<SelectTrigger id="encaisser-vente-moyen" className="w-full">
								<SelectValue placeholder="Sélectionner un moyen" />
							</SelectTrigger>
							<SelectContent>
								{moyensProposables.map((moyen) => (
									<SelectItem key={moyen.id} value={moyen.id}>
										{moyen.libelle}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{moyensProposables.length === 0 ? (
							<p className="text-xs text-muted-foreground">
								Aucun moyen de paiement actif (module Finances).
							</p>
						) : null}
					</div>

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
							disabled={isPending || !idMoyen}
							onClick={() => onConfirm({ idMoyen })}
						>
							{isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Encaisser
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
