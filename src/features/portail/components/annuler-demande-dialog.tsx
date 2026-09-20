import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "#/components/ui/button";

interface AnnulerDemandeDialogProps {
	open: boolean;
	/** Ex. « Annuler la commande ? » */
	titre: string;
	/** Contexte affiché sous le titre (ex. « Commande CMD-0001 »). */
	description: string;
	isPending: boolean;
	erreur?: string | null;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

/**
 * Confirmation d'annulation d'une demande du portail (commande restaurant,
 * dépôt pressing, réservation de salle de fête) — partagée par les trois
 * pages de détail. L'annulation n'est possible que tant que la demande est
 * `EN_ATTENTE` (le backend renvoie 409 ensuite).
 */
export function AnnulerDemandeDialog({
	open,
	titre,
	description,
	isPending,
	erreur,
	onConfirm,
	onOpenChange,
}: AnnulerDemandeDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{titre}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{description}
					</Dialog.Description>

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
							disabled={isPending}
							onClick={() => onOpenChange(false)}
						>
							Conserver
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isPending}
							onClick={onConfirm}
						>
							{isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Confirmer l'annulation
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
