import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

export interface LegalSection {
	titre: string;
	contenu: ReactNode;
}

/**
 * Modal légale (confidentialité, conditions) — ouverte depuis le footer de la
 * landing, sans quitter la page. Suit le pattern Dialog du projet (radix-ui).
 */
export function LegalDialog({
	open,
	onOpenChange,
	title,
	subtitle,
	sections,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	subtitle?: string;
	sections: LegalSection[];
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg sm:p-8">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<Dialog.Title className="text-xl font-bold text-foreground sm:text-2xl">
								{title}
							</Dialog.Title>
							{subtitle ? (
								<Dialog.Description className="text-sm text-muted-foreground">
									{subtitle}
								</Dialog.Description>
							) : null}
						</div>
						<Dialog.Close
							className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							aria-label="Fermer"
						>
							<X className="size-5" aria-hidden />
						</Dialog.Close>
					</div>

					<div className="mt-6 space-y-8">
						{sections.map((section) => (
							<section key={section.titre} className="space-y-2">
								<h2 className="text-base font-semibold text-foreground">
									{section.titre}
								</h2>
								<div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
									{section.contenu}
								</div>
							</section>
						))}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
