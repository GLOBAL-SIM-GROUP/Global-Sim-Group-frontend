import { X } from "lucide-react";
import type { ReactNode } from "react";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<DialogTitle className="text-xl font-bold sm:text-2xl">
							{title}
						</DialogTitle>
						{subtitle ? (
							<DialogDescription>{subtitle}</DialogDescription>
						) : null}
					</div>
					<DialogClose
						className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						aria-label="Fermer"
					>
						<X className="size-5" aria-hidden />
					</DialogClose>
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
			</DialogContent>
		</Dialog>
	);
}
