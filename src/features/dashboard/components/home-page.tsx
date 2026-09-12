import {
	AlertCircle,
	BarChart2,
	BarChart3,
	Home,
	type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import { ModuleTile } from "#/components/ui/module-tile";
import { useCan, useCurrentUser, usePermissions } from "#/core/auth";
import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
} from "#/core/permissions/modules";
import { cn } from "#/lib/utils";

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
 * Largeur naturelle d'une carte : 1/2/3 par ligne selon le point de rupture,
 * `gap` déduit. `grow` s'ajoute séparément (voir `tuileClassName` plus bas) —
 * uniquement quand il y a plus d'une carte au total, sinon une carte seule
 * s'étirerait sur toute la largeur au lieu de garder sa taille normale.
 */
const TUILE_BASIS =
	"basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]";

/** Description d'une carte, indépendamment de sa source (résident, outils
 *  d'administration, ou module métier) — permet de toutes les trier ensemble
 *  par nombre de sous-pages. */
interface Tuile {
	key: string;
	icon: LucideIcon;
	title: string;
	description: string;
	subItems: { id: string; label: string; path: string }[];
	moduleCode: string;
}

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
	// M10 (Rapports) et le tableau de bord global n'ont pas de permission
	// dédiée côté backend — même convention que la sidebar (`sidebar.tsx`,
	// `canVoirRapports`) : suivent `ADMIN.VOIR` (administrateurs, dirigeants).
	const canVoirRapports = useCan("ADMIN.VOIR");
	const permissions = usePermissions();
	const accessibleModules = getAccessibleModules(permissions);

	// Toutes les cartes (résident, outils d'administration, modules métier)
	// triées ensemble par nombre de sous-pages décroissant : les tuiles les
	// plus longues apparaissent en premier, les plus courtes en dernier — un
	// seul tri, pas un ordre fixe pour certaines cartes et trié pour d'autres.
	// Tri stable (spec ES2019+) : à nombre égal de sous-pages, l'ordre
	// d'ajout ci-dessous fait foi (résident puis outils puis modules métier).
	const tuiles = useMemo<Tuile[]>(() => {
		const items: Tuile[] = [];

		if (estResident) {
			items.push({
				key: "RESIDENT",
				icon: Home,
				title: "Mon espace résident",
				description:
					"Suivi de votre loyer, de vos paiements et de votre caution.",
				subItems: [...SOUS_LIENS_RESIDENT],
				moduleCode: "RESIDENT",
			});
		}
		if (canVoirRapports) {
			items.push({
				key: "CORE",
				icon: BarChart2,
				title: "Tableau de bord global",
				description: "Vue d'ensemble de l'activité, tous modules confondus.",
				subItems: [
					{
						id: "dashboard",
						label: "Voir le tableau de bord",
						path: "/dashboard",
					},
				],
				moduleCode: "CORE",
			});
		}
		if (canVoirSignalements) {
			items.push({
				key: "SIGNALEMENT",
				icon: AlertCircle,
				title: "Signalements",
				description: "Problèmes et signalements remontés par les utilisateurs.",
				subItems: [
					{
						id: "signalements",
						label: "Voir les signalements",
						path: "/signalements",
					},
				],
				moduleCode: "SIGNALEMENT",
			});
		}
		if (canVoirRapports) {
			items.push({
				key: "RAPPORTS",
				icon: BarChart3,
				title: "Rapports",
				description:
					"Génération de rapports de synthèse, financiers, par activité et RH.",
				subItems: [
					{ id: "rapports", label: "Générer un rapport", path: "/rapports" },
				],
				moduleCode: "RAPPORTS",
			});
		}
		for (const module of accessibleModules) {
			items.push({
				key: module.code,
				icon: module.icon,
				title: module.title,
				description: module.description,
				subItems: getAccessibleModuleSubItems(module, permissions),
				moduleCode: module.code,
			});
		}

		return items.sort((a, b) => b.subItems.length - a.subItems.length);
	}, [
		estResident,
		canVoirRapports,
		canVoirSignalements,
		accessibleModules,
		permissions,
	]);

	// `grow` seulement s'il y a plus d'une carte : une carte unique doit garder
	// sa taille normale plutôt que de s'étirer sur toute la largeur faute de
	// voisine avec qui se partager l'espace restant.
	const tuileClassName = cn(TUILE_BASIS, tuiles.length > 1 && "grow");

	return (
		<div className="w-full space-y-6 p-4 sm:p-6">
			<section className="space-y-1">
				<h1 className="text-xl sm:text-2xl font-semibold">
					Bienvenue, {user?.login ?? ""} !
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Choisissez une page pour commencer.
				</p>
			</section>

			{tuiles.length > 0 ? (
				// `flex-wrap` + `grow` sur chaque carte (au lieu d'une grille) : une
				// dernière ligne incomplète (ex. un seul module « Client » esseulé)
				// s'étire pour occuper toute la largeur au lieu de laisser un vide à
				// droite — la mise en page reste toujours un rectangle plein, quel que
				// soit le nombre de modules accessibles (qui dépend des permissions).
				<section className="flex flex-wrap gap-3 sm:gap-4">
					{tuiles.map((tuile) => (
						<ModuleTile
							key={tuile.key}
							icon={tuile.icon}
							title={tuile.title}
							description={tuile.description}
							subItems={tuile.subItems}
							moduleCode={tuile.moduleCode}
							className={tuileClassName}
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
