import { Dialog } from "radix-ui";

import type { Batiment } from "../models/batiments";
import { LogementsLotForm } from "./logements-lot-form";

interface LogementsLotFormDialogProps {
	open: boolean;
	batiments: Batiment[];
	batimentIdParDefaut?: string;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

export function LogementsLotFormDialog({
	open,
	batiments,
	batimentIdParDefaut,
	onOpenChange,
	onSaved,
}: LogementsLotFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Créer un lot de logements
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Crée entre 1 et 100 chambres ou studios avec les mêmes
						caractéristiques.
					</Dialog.Description>
					<div className="mt-4">
						{open ? (
							<LogementsLotForm
								batiments={batiments}
								batimentIdParDefaut={batimentIdParDefaut}
								onCancel={() => onOpenChange(false)}
								onSaved={onSaved}
							/>
						) : null}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
