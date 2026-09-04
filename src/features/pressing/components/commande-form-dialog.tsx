import { Dialog } from "radix-ui";

import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

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
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Dépôt — Pressing » ou « Modifier la commande » (M4). */
export function CommandeFormDialog({
	open,
	commande,
	lignesInitiales,
	chargementLignes,
	moyens,
	onOpenChange,
	onSaved,
}: CommandeFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{commande ? "Modifier la commande" : "Dépôt — Pressing"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{commande
							? "Mettre à jour les articles et la date de retrait."
							: "Enregistrer un dépôt de vêtements (articles, prestations, acompte)."}
					</Dialog.Description>
					<div className="mt-4">
						{commande && chargementLignes ? (
							<p className="text-sm text-muted-foreground">Chargement…</p>
						) : (
							<CommandeForm
								key={commande?.id ?? "create"}
								commande={commande}
								lignesInitiales={lignesInitiales}
								moyens={moyens}
								onCancel={() => onOpenChange(false)}
								onSaved={onSaved}
							/>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
