import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

/**
 * Carte-menu d'un module du lanceur (accueil) : icône, titre, description, et
 * la liste de ses sous-pages accessibles — chacune un lien direct, pour
 * choisir sa page sans passer par la sidebar. L'en-tête (icône/titre/
 * description) n'est pas cliquable : c'est un simple libellé de section, tous
 * les liens sont explicites dans la liste ci-dessous (comportement uniforme,
 * qu'un module ait 1 ou 10 sous-pages).
 */
interface ModuleTileProps {
	/** Icône lucide du module. */
	icon: LucideIcon;
	/** Titre localisé. */
	title: string;
	/** Description courte localisée. */
	description: string;
	/** Sous-pages accessibles (déjà filtrées par permission), dans l'ordre du registre. */
	subItems: { id: string; label: string; path: string }[];
	/** Code du module (repli `/en-cours?module=` si aucune sous-page accessible). */
	moduleCode: string;
}

function ModuleTile({
	icon: Icon,
	title,
	description,
	subItems,
	moduleCode,
}: ModuleTileProps) {
	return (
		<div className="rounded-xl border bg-card p-4">
			<Icon className="mb-3 size-6 text-lagoon" aria-hidden />
			<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
				{description}
			</p>

			<ul className="mt-3 space-y-0.5 border-t border-border pt-3">
				{subItems.length > 0 ? (
					subItems.map((item) => (
						<li key={item.id}>
							<Link
								to={item.path}
								className="block truncate rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								{item.label}
							</Link>
						</li>
					))
				) : (
					<li>
						<Link
							to="/en-cours"
							search={{ module: moduleCode }}
							className="block truncate rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						>
							Bientôt disponible
						</Link>
					</li>
				)}
			</ul>
		</div>
	);
}

export { ModuleTile, type ModuleTileProps };
