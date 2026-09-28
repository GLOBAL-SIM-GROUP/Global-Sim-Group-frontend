import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<DialogTitle>Créer un lot de logements</DialogTitle>
				<DialogDescription>
					Crée entre 1 et 100 chambres ou studios avec les mêmes
					caractéristiques.
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
	);
}
