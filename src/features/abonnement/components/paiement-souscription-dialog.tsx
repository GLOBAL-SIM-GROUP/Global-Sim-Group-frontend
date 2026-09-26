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
import { toApiError } from "#/core/api";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useEncaisserSouscription } from "../hooks/use-souscriptions";
import type { Souscription } from "../models/abonnements";

interface PaiementSouscriptionDialogProps {
	open: boolean;
	souscription: Souscription | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

function PaiementForm({
	souscription,
	onOpenChange,
	onSaved,
}: Omit<PaiementSouscriptionDialogProps, "open"> & {
	souscription: Souscription;
}) {
	const mutation = useEncaisserSouscription();
	const moyensQuery = useMoyensPaiement();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [montant, setMontant] = useState(souscription.reste_a_payer);
	const [idMoyen, setIdMoyen] = useState("");

	const soumettre = async () => {
		setGlobalError(null);
		if (!montant.trim() || Number(montant) <= 0) {
			setGlobalError("Saisissez un montant positif.");
			return;
		}
		if (Number(montant) > Number(souscription.reste_a_payer)) {
			// Même règle côté serveur (400) — évitée en amont.
			setGlobalError(
				`Le montant dépasse le reste à payer (${formatMontantFCFA(souscription.reste_a_payer)}).`,
			);
			return;
		}
		if (!idMoyen) {
			setGlobalError("Sélectionnez un moyen de paiement.");
			return;
		}
		try {
			await mutation.mutateAsync({
				id: souscription.id_souscription,
				montant: montant.trim(),
				idMoyen,
			});
			onSaved();
		} catch (error) {
			setGlobalError(
				toApiError(error).message || "Impossible d'encaisser le paiement.",
			);
		}
	};

	return (
		<form
			className="mt-4 space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void soumettre();
			}}
		>
			<InputField
				id="souscription-paiement-montant"
				label="Montant (FCFA)"
				inputMode="numeric"
				value={montant}
				onChange={(event) => setMontant(event.target.value)}
				error={undefined}
			/>

			<div className="space-y-2">
				<Label htmlFor="souscription-paiement-moyen">Moyen de paiement</Label>
				<Select value={idMoyen} onValueChange={setIdMoyen}>
					<SelectTrigger id="souscription-paiement-moyen" className="w-full">
						<SelectValue placeholder="Sélectionner un moyen" />
					</SelectTrigger>
					<SelectContent>
						{(moyensQuery.data ?? []).map((moyen) => (
							<SelectItem key={moyen.id} value={moyen.id}>
								{moyen.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
					{mutation.isPending ? "Encaissement…" : "Encaisser"}
				</Button>
			</div>
		</form>
	);
}

/**
 * Paiement complémentaire sur une souscription (`POST
 * /abonnement/souscriptions/{id}/paiements`, `ABONNEMENT.VENDRE`) — plafonné
 * au `reste_a_payer` affiché (400 serveur au-delà).
 */
export function PaiementSouscriptionDialog({
	open,
	souscription,
	onOpenChange,
	onSaved,
}: PaiementSouscriptionDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Encaisser un paiement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{souscription
							? `Reste à payer : ${formatMontantFCFA(souscription.reste_a_payer)} sur ${formatMontantFCFA(souscription.prix)}.`
							: "Paiement complémentaire de la souscription."}
					</Dialog.Description>
					{open && souscription ? (
						<PaiementForm
							key={souscription.id_souscription}
							souscription={souscription}
							onOpenChange={onOpenChange}
							onSaved={onSaved}
						/>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
