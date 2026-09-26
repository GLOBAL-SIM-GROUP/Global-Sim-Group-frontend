import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { toApiError } from "#/core/api";

import { useAjusterQuota } from "../hooks/use-souscriptions";
import type { Souscription } from "../models/abonnements";
import { UNITE_LABELS } from "../models/abonnements";

interface AjusterQuotaDialogProps {
	open: boolean;
	souscription: Souscription | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

function AjusterForm({
	souscription,
	onOpenChange,
	onSaved,
}: Omit<AjusterQuotaDialogProps, "open"> & { souscription: Souscription }) {
	const mutation = useAjusterQuota();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [quantite, setQuantite] = useState("");
	const [motif, setMotif] = useState("");

	const soumettre = async () => {
		setGlobalError(null);
		const valeur = Number(quantite);
		if (!quantite.trim() || Number.isNaN(valeur) || valeur === 0) {
			setGlobalError("Saisissez une quantité signée (ex : -1.5 ou 2).");
			return;
		}
		if (Number(souscription.solde) + valeur < 0) {
			// Même règle côté serveur (400) — le solde ne peut pas être négatif.
			setGlobalError(
				`Le solde deviendrait négatif (solde actuel : ${souscription.solde} ${UNITE_LABELS[souscription.unite] ?? souscription.unite}).`,
			);
			return;
		}
		if (!motif.trim()) {
			setGlobalError("Le motif est requis (tracé dans le journal).");
			return;
		}
		try {
			await mutation.mutateAsync({
				id: souscription.id_souscription,
				quantite: quantite.trim(),
				motif: motif.trim(),
			});
			onSaved();
		} catch (error) {
			setGlobalError(
				toApiError(error).message || "Impossible d'ajuster le quota.",
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
			<p className="rounded-md border border-border bg-accent/30 px-3 py-2 text-sm text-muted-foreground">
				Solde actuel :{" "}
				<span className="font-semibold text-foreground">
					{souscription.solde}{" "}
					{UNITE_LABELS[souscription.unite] ?? souscription.unite}
				</span>{" "}
				— la correction ne peut pas le rendre négatif.
			</p>

			<InputField
				id="ajustement-quantite"
				label="Quantité signée (ajout ou retrait)"
				placeholder="-1.5 ou 2"
				inputMode="decimal"
				value={quantite}
				onChange={(event) => setQuantite(event.target.value)}
				error={undefined}
			/>

			<div className="space-y-2">
				<Label htmlFor="ajustement-motif">Motif *</Label>
				<Textarea
					id="ajustement-motif"
					rows={2}
					value={motif}
					onChange={(event) => setMotif(event.target.value)}
				/>
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
					{mutation.isPending ? "Ajustement…" : "Ajuster le quota"}
				</Button>
			</div>
		</form>
	);
}

/**
 * Correction manuelle de quota (`POST /abonnement/souscriptions/{id}/ajustements`,
 * `ABONNEMENT.AJUSTER`) : quantité signée + motif obligatoire, solde ≥ 0.
 */
export function AjusterQuotaDialog({
	open,
	souscription,
	onOpenChange,
	onSaved,
}: AjusterQuotaDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajuster le quota
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Correction manuelle du solde — tracée dans le journal des
						mouvements.
					</Dialog.Description>
					{open && souscription ? (
						<AjusterForm
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
