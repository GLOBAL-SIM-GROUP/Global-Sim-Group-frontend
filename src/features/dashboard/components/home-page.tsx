import { Home } from "lucide-react";

import { ModuleTile } from "#/components/ui/module-tile";
import { useCan, useCurrentUser, usePermissions } from "#/core/auth";
import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
} from "#/core/permissions/modules";

/** Sous-pages du portail résident (mêmes libellés/icônes que la page portail). */
const SOUS_LIENS_RESIDENT = [
	{
		id: "echeances",
		label: "Mes échéances",
		path: "/residence/portail/echeances",
	},
	{
		id: "paiements",
		label: "Mon historique",
		path: "/residence/portail/paiements",
	},
	{ id: "caution", label: "Ma caution", path: "/residence/portail/caution" },
	{
		id: "pressing",
		label: "Suivi Pressing",
		path: "/residence/portail/pressing",
	},
	{
		id: "etat_des_lieux",
		label: "Mes états des lieux",
		path: "/residence/portail/etat-des-lieux",
	},
] as const;

/**
 * Accueil protégé = menu global (extrait de `routes/_authenticated/home.tsx`
 * — un composant exporté en plus de `Route` empêche TanStack Router de
 * découper cette route dans son propre chunk, voir l'avertissement "will not
 * be code-split") : chaque module affiche directement la liste de ses
 * sous-pages accessibles, pour que l'utilisateur choisisse sa page en un clic
 * sans passer par la sidebar. Les cartes sont pilotées par les permissions
 * réelles (`MODULE.VOIR` pour la carte, `<CODE>.VOIR` pour chaque sous-page
 * qu'elle liste).
 */
export function HomePage() {
	const user = useCurrentUser();
	const estResident = useCan("RESIDENT.VOIR");
	const canVoirSignalements = useCan("SIGNALEMENT.VOIR");
	const permissions = usePermissions();
	const accessibleModules = getAccessibleModules(permissions);

	const sousLiensResident = canVoirSignalements
		? [
				...SOUS_LIENS_RESIDENT,
				{ id: "signalements", label: "Signalements", path: "/signalements" },
			]
		: SOUS_LIENS_RESIDENT;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
			<section className="space-y-1">
				<h1 className="text-xl sm:text-2xl font-semibold">
					Bienvenue, {user?.login ?? ""} !
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Choisissez une page pour commencer.
				</p>
			</section>

			{estResident || accessibleModules.length > 0 ? (
				<section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
					{estResident ? (
						<ModuleTile
							icon={Home}
							title="Mon espace résident"
							description="Suivi de votre loyer, de vos paiements et de votre caution."
							subItems={[...sousLiensResident]}
							moduleCode="RESIDENT"
						/>
					) : null}

					{accessibleModules.map((module) => (
						<ModuleTile
							key={module.code}
							icon={module.icon}
							title={module.title}
							description={module.description}
							subItems={getAccessibleModuleSubItems(module, permissions)}
							moduleCode={module.code}
						/>
					))}
				</section>
			) : (
				<p className="text-sm text-muted-foreground">
					Aucun module accessible.
				</p>
			)}
		</div>
	);
}
