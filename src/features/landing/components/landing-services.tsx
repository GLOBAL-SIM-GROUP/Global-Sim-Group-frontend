import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BedDouble,
	Check,
	type LucideIcon,
	PartyPopper,
	Shirt,
	ShoppingBag,
	UtensilsCrossed,
} from "lucide-react";
import { AccordionGallery } from "#/components/accordion-gallery";
import { AnimatedContent } from "#/components/animated-content";
import { BorderGlow } from "#/components/border-glow";
import { SplitText } from "#/components/split-text";
import { cn } from "#/lib/utils";

/**
 * Carte d'usage d'un service — volontairement générique pour être reprise
 * telle quelle dans le futur espace client (phase 2 : mêmes libellés, mêmes
 * icônes). `to` mène au catalogue public quand il existe, sinon vers
 * l'inscription (compte obligatoire pour commander/réserver).
 * `imageUrl` : photo de fond (actuellement des photos de stock génériques,
 * à remplacer par de vraies photos des locaux/prestations).
 */
export function CarteService({
	icone: Icone,
	titre,
	description,
	points,
	to,
	action,
	hint,
	imageUrl,
	className,
}: {
	icone: LucideIcon;
	titre: string;
	description: string;
	/** Puces factuelles affichées sous la description. */
	points?: readonly string[];
	to: string;
	action: string;
	/** Mention secondaire (ex. « sur inscription »). */
	hint?: string;
	/** Photo de fond de la carte (dégradé sombre superposé pour la lisibilité). */
	imageUrl?: string;
	className?: string;
}) {
	return (
		<BorderGlow
			borderRadius={16}
			glowRadius={24}
			glowColor="27 90 60"
			colors={["#E67E22", "#F0954D", "#4A9FD8"]}
			className={cn("group h-full", className)}
		>
			<div className="relative flex h-full flex-col gap-4 p-6">
				{imageUrl ? (
					<>
						<img
							src={imageUrl}
							alt=""
							aria-hidden
							className="absolute inset-0 -z-10 h-full w-full object-cover"
						/>
						<div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
					</>
				) : null}
				<div
					className={cn(
						"flex size-12 items-center justify-center rounded-xl transition-colors",
						imageUrl
							? "bg-white/20 text-white backdrop-blur-sm"
							: "bg-lagoon/10 text-lagoon group-hover:bg-lagoon group-hover:text-white",
					)}
				>
					<Icone className="size-6" aria-hidden />
				</div>
				<div className="space-y-1">
					<h3
						className={cn(
							"text-xl font-semibold",
							imageUrl ? "text-white" : "text-foreground",
						)}
					>
						{titre}
					</h3>
					<p
						className={cn(
							"text-sm",
							imageUrl ? "text-white/80" : "text-muted-foreground",
						)}
					>
						{description}
					</p>
				</div>
				{points && points.length > 0 ? (
					<ul className="space-y-1.5">
						{points.map((point) => (
							<li
								key={point}
								className={cn(
									"flex items-start gap-2 text-xs",
									imageUrl ? "text-white/85" : "text-muted-foreground",
								)}
							>
								<Check
									className="mt-0.5 size-3.5 shrink-0 text-palm"
									aria-hidden
								/>
								{point}
							</li>
						))}
					</ul>
				) : null}
				<div className="mt-auto space-y-1 pt-2">
					<Link
						to={to}
						className={cn(
							"inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline",
							imageUrl ? "text-white" : "text-lagoon",
						)}
					>
						{action}
						<ArrowRight
							className="size-4 transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
					{hint ? (
						<p
							className={cn(
								"text-xs",
								imageUrl ? "text-white/70" : "text-muted-foreground",
							)}
						>
							{hint}
						</p>
					) : null}
				</div>
			</div>
		</BorderGlow>
	);
}

/**
 * Photos de stock génériques (picsum.photos, seed stable par service) — en
 * attendant de vraies photos des locaux/prestations GLOBAL SIM GROUP.
 */
const SERVICES = [
	{
		icone: UtensilsCrossed,
		titre: "Restaurant",
		description:
			"Consultez la carte du jour et commandez vos plats et boissons préférés.",
		points: [
			"Carte consultable sans compte",
			"Plats et boissons du moment",
			"Commande depuis votre espace",
		],
		to: "/restaurant/plats",
		action: "Voir la carte",
		image: "https://picsum.photos/seed/gsg-restaurant/800/1000",
	},
	{
		icone: ShoppingBag,
		titre: "Supermarché",
		description:
			"Parcourez le catalogue et commandez vos articles en quelques clics.",
		points: [
			"Catalogue consultable sans compte",
			"Prix affichés en FCFA",
			"Commande depuis votre espace",
		],
		to: "/supermarche/produits",
		action: "Voir les produits",
		image: "https://picsum.photos/seed/gsg-supermarche/800/1000",
	},
	{
		icone: Shirt,
		titre: "Pressing",
		description:
			"Déposez votre linge et suivez l'avancement de vos commandes en ligne.",
		points: [
			"Dépôt de linge sur place",
			"Suivi d'avancement en ligne",
			"Historique dans votre espace",
		],
		to: "/inscription",
		action: "Déposer mon linge",
		hint: "Nécessite un compte",
		image: "https://picsum.photos/seed/gsg-pressing/800/1000",
	},
	{
		icone: PartyPopper,
		titre: "Salle de fête",
		description:
			"Formulez votre demande de réservation pour vos événements et cérémonies.",
		points: [
			"Demande de réservation en ligne",
			"Mariages, cérémonies, séminaires",
			"Réponse de nos équipes",
		],
		image: "https://picsum.photos/seed/gsg-salle-fete/800/1000",
		to: "/inscription",
		action: "Réserver la salle",
		hint: "Nécessite un compte",
	},
	{
		icone: BedDouble,
		titre: "Résidence",
		description:
			"Séjours courts et hébergement : chambres et studios à la nuitée.",
		points: [
			"Chambres et studios à la nuitée",
			"Demande de séjour en ligne",
			"Idéal déplacements et missions",
		],
		to: "/inscription",
		action: "Réserver un séjour",
		hint: "Nécessite un compte",
		image: "https://picsum.photos/seed/gsg-residence/800/1000",
	},
] as const;

export function LandingServices() {
	return (
		<section
			id="services"
			className="scroll-mt-16 bg-muted/30 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
		>
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 space-y-4 text-center">
					<SplitText
						tag="h2"
						text="Nos services"
						className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
						splitType="words"
						delay={60}
						duration={0.6}
					/>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Cinq services accessibles depuis votre espace client : consultez
						librement les catalogues, créez un compte pour commander et
						réserver.
					</p>
				</div>

				<AnimatedContent distance={60} threshold={0.15}>
					<AccordionGallery
						items={SERVICES.map((service) => ({
							image: service.image,
							label: service.titre,
							link: service.to,
							alt: service.titre,
						}))}
						defaultIndex={0}
						accentColor="#E67E22"
						overlayColor="#1A2B4C"
						height={420}
						radius={12}
					/>
				</AnimatedContent>
			</div>
		</section>
	);
}
