import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import type { ModuleCode } from "#/core/permissions";

/**
 * Tuile de module du lanceur (menu global) : icône, titre, description, lien.
 * Le lien pointe aujourd'hui vers le placeholder partagé `/en-cours` — il sera
 * rebranché sur `def.path` quand les routes de modules existeront.
 */
interface ModuleTileProps {
	/** Icône lucide du module. */
	icon: LucideIcon;
	/** Titre localisé (déjà rendu — `module.title()`). */
	title: string;
	/** Description courte localisée. */
	description: string;
	/** Destination du clic (route + paramètre du module concerné). */
	linkProps: {
		to: string;
		search?: { module: ModuleCode };
	};
}

function ModuleTile({
	icon: Icon,
	title,
	description,
	linkProps,
}: ModuleTileProps) {
	return (
		<Link
			{...linkProps}
			className="group block rounded-xl border bg-card p-4 transition-colors hover:border-lagoon/40 hover:bg-accent/50"
		>
			<Icon className="mb-3 size-6 text-lagoon" aria-hidden />
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
				{description}
			</p>
		</Link>
	);
}

export { ModuleTile, type ModuleTileProps };
