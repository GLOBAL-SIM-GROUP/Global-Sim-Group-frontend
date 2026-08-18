import { Dialog } from "radix-ui";

import type { CategoriePlat, Plat } from "../models/plats";
import { PlatForm } from "./plat-form";

interface PlatFormDialogProps {
	open: boolean;
	plat: Plat | null;
	categories: CategoriePlat[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Ajouter / Modifier un plat » (M5). Le `key` remonte un formulaire neuf. */
export function PlatFormDialog({
	open,
	plat,
	categories,
	onOpenChange,
	onSaved,
}: PlatFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{plat ? "Modifier le plat" : "Ajouter un plat"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Créez ou modifiez un plat/boisson du menu.
					</Dialog.Description>
					<div className="mt-4">
						<PlatForm
							key={plat?.id ?? "create"}
							plat={plat}
							categories={categories}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
