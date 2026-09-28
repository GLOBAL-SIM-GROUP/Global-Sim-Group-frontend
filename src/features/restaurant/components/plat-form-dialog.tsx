import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto">
				<DialogTitle>
					{plat ? "Modifier le plat" : "Ajouter un plat"}
				</DialogTitle>
				<DialogDescription>
					Créez ou modifiez un plat/boisson du menu.
				</DialogDescription>
				<div className="mt-4">
					<PlatForm
						key={plat?.id ?? "create"}
						plat={plat}
						categories={categories}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
