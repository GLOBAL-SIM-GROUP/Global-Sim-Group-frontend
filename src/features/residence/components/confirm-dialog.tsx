import { AlertTriangle } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from "#/components/ui/dialog";

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
 * Dialogue de confirmation générique — rebâti sur les primitives partagées
 * `components/ui/dialog` (design system, cf. `docs/design-system.md`).
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="space-y-4">
				<div className="flex items-start gap-3">
					<AlertTriangle
						className="size-5 shrink-0 text-destructive"
						aria-hidden
					/>
					<div className="space-y-1">
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{message}</DialogDescription>
					</div>
				</div>
				<DialogFooter>
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
