import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { formatMontantFCFA } from "#/features/residence/models/format";
import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

import { useRetirerCommande } from "../hooks/use-commandes";
import type { CommandePressing } from "../models/commandes";

interface RetirerCommandeDialogProps {
	open: boolean;
	commande: CommandePressing | null;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Retrait — Pressing » (M4) : encaisse le solde restant et passe la
 * commande en « Retirée » (POST `/commandes/{id}/retirer`).
 */
export function RetirerCommandeDialog({
	open,
	commande,
	moyens,
	onOpenChange,
	onSaved,
}: RetirerCommandeDialogProps) {
	const mutation = useRetirerCommande();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [solde, setSolde] = useState(commande?.reste_a_payer ?? "");
	const [idMoyen, setIdMoyen] = useState(moyens[0]?.id ?? "");

	const valider = (): string | null => {
		if (!solde.trim() || Number(solde) <= 0) {
			return "Saisissez un montant positif.";
		}
		if (!idMoyen) return "Sélectionnez un moyen de paiement.";
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		if (!commande) return;
		try {
			await mutation.mutateAsync({
				id: commande.id,
				solde: solde.trim(),
				idMoyen,
			});
			onSaved();
		} catch {
			setGlobalError("Une erreur est survenue lors du retrait.");
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Retrait — Pressing
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{commande
							? `Commande ${commande.numero_commande} — reste à payer ${formatMontantFCFA(commande.reste_a_payer)}.`
							: "Encaisser le solde et passer la commande en « Retirée »."}
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void soumettre();
						}}
					>
						<InputField
							id="retrait-solde"
							name="solde"
							label="Montant du solde (FCFA)"
							inputMode="numeric"
							value={solde}
							onChange={(event) => setSolde(event.target.value)}
							error={undefined}
						/>

						<div className="space-y-2">
							<Label htmlFor="retrait-moyen">Moyen de paiement</Label>
							<Select value={idMoyen} onValueChange={setIdMoyen}>
								<SelectTrigger id="retrait-moyen" className="w-full">
									<SelectValue placeholder="Sélectionner un moyen" />
								</SelectTrigger>
								<SelectContent>
									{moyens.map((moyen) => (
										<SelectItem key={moyen.id} value={moyen.id}>
											{moyen.libelle}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{moyens.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									Aucun moyen de paiement configuré (module Finances).
								</p>
							) : null}
						</div>

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
								{mutation.isPending ? "Retrait…" : "Valider le retrait"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
