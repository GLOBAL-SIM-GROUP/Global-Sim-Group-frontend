import { Dialog } from "radix-ui";

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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Réception par scan
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Scannez chaque article reçu — un re-scan incrémente sa quantité.
					</Dialog.Description>
					<div className="mt-4">
						<EntreeStockScanForm
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
