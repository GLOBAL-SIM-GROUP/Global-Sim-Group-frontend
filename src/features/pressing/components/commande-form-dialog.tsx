import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type {
	CommandePressing,
	LigneCommandePressing,
} from "../models/commandes";
import { CommandeForm } from "./commande-form";

interface CommandeFormDialogProps {
	open: boolean;
	/** Commande à modifier (mode édition) ; null = dépôt. */
	commande: CommandePressing | null;
	/** Lignes actuelles (mode édition). */
	lignesInitiales: LigneCommandePressing[];
	/**
	 * `true` tant que `lignesInitiales` n'est pas encore le reflet réel de la
	 * commande à modifier (requête de détail en cours). Le formulaire n'est
	 * monté qu'une fois les lignes chargées : `CommandeForm` ne les relit
	 * qu'à son montage (clé = id de la commande), donc l'afficher plus tôt
	 * figerait un panier vide pour toute la session d'édition.
	 */
	chargementLignes?: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Dépôt — Pressing » ou « Modifier la commande » (M4). */
export function CommandeFormDialog({
	open,
	commande,
	lignesInitiales,
	chargementLignes,
	onOpenChange,
	onSaved,
}: CommandeFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>
					{commande ? "Modifier la commande" : "Dépôt — Pressing"}
				</DialogTitle>
				<DialogDescription>
					{commande
						? "Mettre à jour les articles et la date de retrait."
						: "Enregistrer un dépôt de vêtements (articles, prestations)."}
				</DialogDescription>
				<div className="mt-4">
					{commande && chargementLignes ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : (
						<CommandeForm
							key={commande?.id ?? "create"}
							commande={commande}
							lignesInitiales={lignesInitiales}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
