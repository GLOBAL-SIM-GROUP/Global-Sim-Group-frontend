import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { toApiError } from "#/core/api";

import { useResilierSouscription } from "../hooks/use-souscriptions";
import type { Souscription } from "../models/abonnements";
import { UNITE_LABELS } from "../models/abonnements";

interface ResilierSouscriptionDialogProps {
	open: boolean;
	souscription: Souscription | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

function ResilierForm({
	souscription,
	onOpenChange,
	onSaved,
}: Omit<ResilierSouscriptionDialogProps, "open"> & {
	souscription: Souscription;
}) {
	const mutation = useResilierSouscription();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [motif, setMotif] = useState("");

	const soumettre = async () => {
		setGlobalError(null);
		if (!motif.trim()) {
			setGlobalError("Le motif est requis.");
			return;
		}
		try {
			await mutation.mutateAsync({
				id: souscription.id_souscription,
				motif: motif.trim(),
			});
			onSaved();
		} catch (error) {
			// 409 = souscription non ACTIVE (déjà résiliée/annulée).
			setGlobalError(
				toApiError(error).message || "Impossible de résilier la souscription.",
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
			<p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
				La souscription sera terminée avant son échéance — solde restant :{" "}
				{souscription.solde}{" "}
				{UNITE_LABELS[souscription.unite] ?? souscription.unite}.
			</p>

			<div className="space-y-2">
				<Label htmlFor="resiliation-motif">Motif *</Label>
				<Textarea
					id="resiliation-motif"
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
				<Button
					type="submit"
					variant="destructive"
					disabled={mutation.isPending}
				>
					{mutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{mutation.isPending ? "Résiliation…" : "Résilier"}
				</Button>
			</div>
		</form>
	);
}

/**
 * Résiliation anticipée d'une souscription `ACTIVE` (`POST /resilier`,
 * `ABONNEMENT.AJUSTER` ; 409 sinon).
 */
export function ResilierSouscriptionDialog({
	open,
	souscription,
	onOpenChange,
	onSaved,
}: ResilierSouscriptionDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Résilier la souscription
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{souscription
							? `${souscription.offre_libelle} — ${souscription.client_nom} ${souscription.client_prenoms}`
							: "Terminer la souscription avant son échéance."}
					</Dialog.Description>
					{open && souscription ? (
						<ResilierForm
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
