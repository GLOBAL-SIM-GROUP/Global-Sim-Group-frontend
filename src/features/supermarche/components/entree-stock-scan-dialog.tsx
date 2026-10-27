import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import { EntreeStockScanForm } from "./entree-stock-scan-form";

interface EntreeStockScanDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Réception par scan » (M3) : entrée de stock multi-articles par code-barres. */
export function EntreeStockScanDialog({
	open,
	onOpenChange,
	onSaved,
}: EntreeStockScanDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>Réception par scan</DialogTitle>
				<DialogDescription>
					Scannez chaque article reçu — un re-scan incrémente sa quantité.
				</DialogDescription>
				<div className="mt-4">
					<EntreeStockScanForm
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
