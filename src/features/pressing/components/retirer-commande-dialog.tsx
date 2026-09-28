import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
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

	// Commande entièrement couverte par un abonnement : reste à payer 0 →
	// retrait sans encaissement (`id_moyen` non requis côté serveur).
	const resteZero =
		commande !== null && Number(commande.reste_a_payer ?? "0") === 0;

	const valider = (): string | null => {
		if (resteZero) return null;
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
				solde: resteZero ? "0" : solde.trim(),
				...(resteZero ? {} : { idMoyen }),
			});
			onSaved();
		} catch {
			setGlobalError("Une erreur est survenue lors du retrait.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Retrait — Pressing</DialogTitle>
				<DialogDescription>
					{commande
						? `Commande ${commande.numero_commande} — reste à payer ${formatMontantFCFA(commande.reste_a_payer)}.`
						: "Encaisser le solde et passer la commande en « Retirée »."}
				</DialogDescription>

				<form
					className="mt-4 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void soumettre();
					}}
				>
					{resteZero ? (
						<p className="rounded-md border border-success/30 bg-success-bg px-3 py-2 text-sm text-success">
							Commande soldée (entièrement couverte par abonnement ou déjà
							payée) — le retrait n'encaissera rien.
						</p>
					) : (
						<>
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
						</>
					)}

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
			</DialogContent>
		</Dialog>
	);
}
