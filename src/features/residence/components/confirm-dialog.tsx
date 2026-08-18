import { AlertTriangle } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "#/components/ui/button";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	destructive?: boolean;
	busy?: boolean;
	onConfirm: () => void;
}

/**
 * Dialogue de confirmation générique (radix-ui déjà installé — aucune
 * nouvelle dépendance). Utilisé pour la suppression d'un bâtiment.
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	message,
	confirmLabel,
	cancelLabel,
	destructive = false,
	busy = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-lg border border-border bg-card p-6 shadow-lg">
					<div className="flex items-start gap-3">
						<AlertTriangle
							className="size-5 shrink-0 text-destructive"
							aria-hidden
						/>
						<div className="space-y-1">
							<Dialog.Title className="text-base font-semibold text-foreground">
								{title}
							</Dialog.Title>
							<Dialog.Description className="text-sm text-muted-foreground">
								{message}
							</Dialog.Description>
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="ghost"
							disabled={busy}
							onClick={() => onOpenChange(false)}
						>
							{cancelLabel}
						</Button>
						<Button
							variant={destructive ? "destructive" : "default"}
							disabled={busy}
							onClick={onConfirm}
						>
							{confirmLabel}
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
