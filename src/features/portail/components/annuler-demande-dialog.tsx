import { Loader2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>{titre}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>

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
						className="rounded-full"
						disabled={isPending}
						onClick={() => onOpenChange(false)}
					>
						Conserver
					</Button>
					<Button
						type="button"
						variant="destructive"
						className="rounded-full"
						disabled={isPending}
						onClick={onConfirm}
					>
						{isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						Confirmer l'annulation
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
