import { Link } from "@tanstack/react-router";
import {
	BedDouble,
	ChevronRight,
	ClipboardList,
	Flag,
	type LucideIcon,
	PartyPopper,
	Shirt,
	ShoppingBag,
	ShoppingCart,
	Tickets,
	UtensilsCrossed,
} from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { PageHeader } from "#/components/ui/page-header";
import { useCurrentUser } from "#/core/auth";
import { useNombreArticlesPaniers } from "#/features/espace-client/hooks/use-panier-articles";
import { useMesVentesPortail } from "#/features/portail/hooks/use-market";
import { usePressingCommandes } from "#/features/portail/hooks/use-pressing";
import { useMesCommandesRestaurant } from "#/features/portail/hooks/use-restaurant";
import { useMesReservationsSalleFete } from "#/features/portail/hooks/use-salle-fete";
import { useMesSejoursPortail } from "#/features/portail/hooks/use-sejours";
import {
	PRESSING_STATUT_LABELS,
	PRESSING_STATUT_VARIANT,
} from "#/features/portail/models/pressing";

type BadgeVariant =
	| "success"
	| "warning"
	| "info"
	| "danger"
	| "neutral"
	| "lagoon";

/** Vignette « en direct » mise en avant à côté de la salutation. */
interface ItemActif {
	icon: LucideIcon;
	service: string;
	titre: string;
	statutLabel: string;
	variant: BadgeVariant;
	to: string;
	params?: Record<string, string>;
}

const SERVICES = [
	{
		to: "/espace-client/restaurant",
		icon: UtensilsCrossed,
		label: "Restaurant",
		description: "Consultez la carte et composez votre commande.",
	},
	{
		to: "/espace-client/boutique",
		icon: ShoppingBag,
		label: "Boutique",
		description: "Parcourez les articles disponibles en boutique.",
	},
	{
		to: "/espace-client/pressing",
		icon: Shirt,
		label: "Pressing",
		description: "Suivez l'avancement de vos dépôts de linge.",
	},
	{
		to: "/espace-client/salle-fete",
		icon: PartyPopper,
		label: "Salle de fête",
		description: "Demandez la réservation de la salle pour vos événements.",
	},
	{
		to: "/espace-client/residence",
		icon: BedDouble,
		label: "Résidence",
		description: "Formulez une demande de séjour court, chambre ou studio.",
	},
	{
		to: "/espace-client/abonnements",
		icon: Tickets,
		label: "Mes abonnements",
		description: "Suivez vos quotas prépayés pressing et restaurant.",
	},
] as const;

/**
 * Vignette de service — bento : `pill` agrandit la tuile sur 2 colonnes
 * (mise en avant), `badge` affiche un compteur réel (jamais une valeur
 * inventée) en haut à droite.
 */
function ServiceTile({
	to,
	icon: Icon,
	label,
	description,
	large = false,
	badge,
}: {
	to: string;
	icon: LucideIcon;
	label: string;
	description: string;
	large?: boolean;
	badge?: { label: string; variant: BadgeVariant };
}) {
	return (
		<Link
			to={to}
			className={`group flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md ${
				large ? "sm:col-span-2" : ""
			}`}
		>
			<div className="flex items-center justify-between">
				<span className="grid size-10 place-items-center rounded-lg bg-lagoon/15">
					<Icon className="size-5 text-lagoon" aria-hidden />
				</span>
				{badge ? (
					<Badge variant={badge.variant}>{badge.label}</Badge>
				) : (
					<ChevronRight
						className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
						aria-hidden
					/>
				)}
			</div>
			<div className="space-y-1">
				<p className="font-semibold text-foreground">{label}</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
		</Link>
	);
}

/**
 * Accueil de l'espace client (`/espace-client`) : salutation + service mis en
 * avant (première demande active, tous services confondus) et bento des
 * raccourcis vers les six services, « Mes demandes », « Mon panier » et
 * « Signaler un problème ». Les portails pressing/restaurant/boutique/salle
 * de fête/résidence(séjours) sont tous réellement exposés au compte CLIENT
 * (`PORTAIL.VOIR`, vérifié en direct 2026-09-27) — seul le résumé résidence
 * complet (échéances/caution, `RESIDENT.VOIR`) reste hors d'atteinte, faute
 * de contrat.
 *
 * Aucune donnée n'est inventée : le compteur « Mes demandes » agrège les
 * demandes réellement en cours (tous services), « Mon panier » lit le panier
 * local réel, et la vignette « en direct » ne s'affiche que si une demande
 * est effectivement active — pas de quota ou de chiffre fictif.
 */
export function AccueilPage() {
	const user = useCurrentUser();
	const commandesPressing = usePressingCommandes().data ?? [];
	const commandesResto = useMesCommandesRestaurant().data ?? [];
	const ventesBoutique = useMesVentesPortail().data ?? [];
	const reservationsSalleFete = useMesReservationsSalleFete().data ?? [];
	const sejours = useMesSejoursPortail().data ?? [];
	const nombreArticlesPanier = useNombreArticlesPaniers();

	const pressingEnCours = commandesPressing.filter(
		(c) => c.statut !== "RETIRE" && c.statut !== "ANNULEE",
	);
	const totalEnCours =
		pressingEnCours.length +
		commandesResto.filter((c) => c.statut !== "PAYEE" && c.statut !== "ANNULEE")
			.length +
		ventesBoutique.filter((v) => v.statut !== "PAYEE" && v.statut !== "ANNULEE")
			.length +
		reservationsSalleFete.filter(
			(r) => r.statut !== "REALISEE" && r.statut !== "ANNULEE",
		).length +
		sejours.filter((s) => s.statut !== "TERMINE" && s.statut !== "ANNULE")
			.length;

	// La demande pressing est historiquement la plus fréquente à suivre au
	// jour le jour : mise en avant en priorité si une commande est active.
	const commandePressingActive = pressingEnCours[0];
	const itemActif: ItemActif | null = commandePressingActive
		? {
				icon: Shirt,
				service: "Pressing",
				titre: commandePressingActive.numero_commande,
				statutLabel:
					PRESSING_STATUT_LABELS[commandePressingActive.statut] ??
					commandePressingActive.statut,
				variant: PRESSING_STATUT_VARIANT[commandePressingActive.statut],
				to: "/espace-client/pressing/$id",
				params: { id: commandePressingActive.id },
			}
		: null;

	return (
		<div className="w-full space-y-8 pt-6 pb-16">
			<PageHeader
				breadcrumb={[{ label: "Espace client" }]}
				title={`Bonjour${user?.login ? ` ${user.login}` : ""}`}
				titleClassName="display-title"
				description="Tous les services GLOBAL SIM GROUP depuis votre espace."
			/>

			<div className={`grid gap-4 ${itemActif ? "lg:grid-cols-3" : ""}`}>
				<div
					className={`relative overflow-hidden rounded-2xl bg-sea-ink p-8 ${
						itemActif ? "lg:col-span-2" : ""
					}`}
				>
					<div
						aria-hidden
						className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-lagoon/30 blur-3xl"
					/>
					<div className="relative space-y-3">
						<p className="text-xs font-semibold tracking-wide text-lagoon uppercase">
							{new Date().toLocaleDateString("fr-FR", {
								weekday: "long",
								day: "numeric",
								month: "long",
							})}
						</p>
						<h2 className="display-title text-3xl font-semibold text-white sm:text-4xl">
							Bienvenue{user?.login ? `, ${user.login}` : ""}
						</h2>
						<p className="max-w-md text-sm text-white/70">
							{totalEnCours > 0
								? `Vous avez ${totalEnCours} demande${totalEnCours > 1 ? "s" : ""} en cours — retrouvez leur suivi ci-dessous.`
								: "Composez une commande, réservez la salle de fête ou déposez du linge en quelques clics."}
						</p>
						<Link
							to="/espace-client/restaurant"
							className="mt-2 inline-flex items-center gap-2 rounded-full bg-lagoon px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lagoon/90"
						>
							Commander au restaurant
							<ChevronRight className="size-4" aria-hidden />
						</Link>
					</div>
				</div>

				{itemActif ? (
					<Link
						to={itemActif.to}
						params={itemActif.params}
						className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-lagoon/50"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
								Suivi en direct
							</span>
							<span className="relative flex size-2.5">
								<span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-lagoon opacity-75" />
								<span className="relative inline-flex size-2.5 rounded-full bg-lagoon" />
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="grid size-11 shrink-0 place-items-center rounded-full bg-lagoon/15">
								<itemActif.icon className="size-5 text-lagoon" aria-hidden />
							</span>
							<div className="min-w-0 space-y-1">
								<p className="truncate font-semibold text-foreground">
									{itemActif.service} · {itemActif.titre}
								</p>
								<Badge variant={itemActif.variant}>
									{itemActif.statutLabel}
								</Badge>
							</div>
						</div>
						<span className="inline-flex items-center gap-1 text-sm font-semibold text-lagoon">
							Voir le détail
							<ChevronRight className="size-4" aria-hidden />
						</span>
					</Link>
				) : null}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{SERVICES.map((service, index) => (
					<ServiceTile
						key={service.to}
						{...service}
						large={index === 0}
						badge={
							service.to === "/espace-client/pressing" &&
							pressingEnCours.length > 0
								? {
										label: `${pressingEnCours.length} en cours`,
										variant: "warning",
									}
								: undefined
						}
					/>
				))}

				<ServiceTile
					to="/espace-client/mes-demandes"
					icon={ClipboardList}
					label="Mes demandes"
					description="Suivez toutes vos demandes envoyées, tous services confondus."
					badge={
						totalEnCours > 0
							? { label: String(totalEnCours), variant: "lagoon" }
							: undefined
					}
				/>

				<ServiceTile
					to="/espace-client/panier"
					icon={ShoppingCart}
					label="Mon panier"
					description="Vérifiez vos articles restaurant et boutique puis envoyez votre demande."
					badge={
						nombreArticlesPanier > 0
							? { label: String(nombreArticlesPanier), variant: "neutral" }
							: undefined
					}
				/>

				<ServiceTile
					to="/espace-client/signalement"
					icon={Flag}
					label="Signaler un problème"
					description="Décrivez un souci dans nos locaux ou services."
				/>
			</div>
		</div>
	);
}
