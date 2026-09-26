import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { ApercuAbonnementPanel } from "#/features/abonnement/components/apercu-panel";
import { formatMontantFCFA } from "#/features/residence/models/format";
import {
	type MoyenPaiement,
	moyensActifs,
} from "#/features/residence/models/moyens-paiement";

import { useApercuAbonnementCommande } from "../hooks/use-commandes";
import type { CommandeRestaurant } from "../models/commandes";

interface EncaisserCommandeDialogProps {
	commande: CommandeRestaurant | null;
	moyens: MoyenPaiement[];
	isPending: boolean;
	/**
	 * Message du dernier encaissement échoué (ex. 409 `ABONNEMENT_EXCEDENT`)
	 * — affiché dans le dialogue ; sa présence arme `accepter_excedent` au
	 * prochain confirm.
	 */
	erreur?: string | null;
	onConfirm: (body: {
		montant: string;
		idMoyen?: string;
		date?: string;
		utiliserAbonnement: boolean;
		accepterExcedent: boolean;
	}) => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Encaissement d'une commande restaurant (staff, `FINANCES.ENCAISSER`) :
 * `POST /restaurant/commandes/{id}/encaisser`. Le montant encaissé est
 * celui **ajusté par l'aperçu abonnement** (`total_du`) — moyen de paiement
 * omis quand la couverture solde tout (`0`), et `accepter_excedent` est
 * renvoyé quand l'aperçu signale un dépassement (le staff l'a vu) ou après
 * le 409 affiché.
 */
export function EncaisserCommandeDialog({
	commande,
	moyens,
	isPending,
	erreur,
	onConfirm,
	onOpenChange,
}: EncaisserCommandeDialogProps) {
	const [idMoyen, setIdMoyen] = useState("");
	const [date, setDate] = useState("");
	const [ignorerAbonnement, setIgnorerAbonnement] = useState(false);
	const open = commande !== null;
	const moyensProposables = moyensActifs(moyens);

	// Aperçu de couverture de la commande existante (GET, une fois à
	// l'ouverture — lignes figées, pas de debounce nécessaire).
	const apercuQuery = useApercuAbonnementCommande(commande?.id);
	const apercu =
		apercuQuery.data && !ignorerAbonnement ? apercuQuery.data : null;
	const montant = apercu?.total_du ?? commande?.total ?? "0";
	const sansPaiement = Number(montant) === 0;
	// L'aperçu signale un dépassement = le staff l'a vu dans le panneau ;
	// `erreur` renseigné = le 409 a déjà été affiché (resubmit confirmé).
	const accepterExcedent = apercu?.excedent === true || erreur != null;

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					setIdMoyen("");
					setDate("");
					setIgnorerAbonnement(false);
				}
				onOpenChange(next);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Encaisser la commande
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Commande n° {commande?.id ?? ""} — la facture soldée est créée et la
						commande passe à « Payée ».
					</Dialog.Description>

					<p className="mt-4 text-sm text-foreground">
						Montant à encaisser :{" "}
						<span className="font-semibold">{formatMontantFCFA(montant)}</span>
						{apercu ? (
							<span className="ml-2 text-xs text-muted-foreground">
								(total brut {formatMontantFCFA(apercu.total_brut)})
							</span>
						) : null}
					</p>

					<div className="mt-3">
						<ApercuAbonnementPanel
							apercu={apercu}
							pending={apercuQuery.isLoading}
							error={apercuQuery.isError}
							visible={!ignorerAbonnement}
						/>
						{apercu && apercu.abonnements.length > 0 ? (
							<label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
								<input
									type="checkbox"
									checked={ignorerAbonnement}
									onChange={(event) =>
										setIgnorerAbonnement(event.target.checked)
									}
								/>
								Ne pas utiliser l'abonnement — encaisser le total brut
							</label>
						) : null}
					</div>

					{sansPaiement ? (
						<p className="mt-4 rounded-md border border-[#27AE60]/30 bg-[#27AE60]/10 px-3 py-2 text-sm text-[#27AE60]">
							Commande entièrement couverte par l'abonnement — aucun montant à
							encaisser.
						</p>
					) : (
						<div className="mt-4 space-y-2">
							<Label htmlFor="encaisser-moyen">Moyen de paiement</Label>
							<Select value={idMoyen} onValueChange={setIdMoyen}>
								<SelectTrigger id="encaisser-moyen" className="w-full">
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
					)}

					<div className="mt-4 space-y-2">
						<Label htmlFor="encaisser-date">
							Date du règlement (optionnel)
						</Label>
						<Input
							id="encaisser-date"
							type="date"
							value={date}
							onChange={(event) => setDate(event.target.value)}
							disabled={isPending}
						/>
					</div>

					{erreur ? (
						<p
							role="alert"
							className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
						>
							{erreur} — réessayez pour confirmer la facturation de l'excédent.
						</p>
					) : null}

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
							disabled={isPending || (!sansPaiement && !idMoyen)}
							onClick={() =>
								onConfirm({
									montant,
									...(sansPaiement ? {} : { idMoyen }),
									date: date || undefined,
									utiliserAbonnement: !ignorerAbonnement,
									accepterExcedent,
								})
							}
						>
							{isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{sansPaiement ? "Clôturer sans encaissement" : "Encaisser"}
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
