import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	BedDouble,
	Check,
	ChevronLeft,
	ChevronRight,
	type LucideIcon,
	PartyPopper,
	Shirt,
	ShoppingBag,
	UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedContent } from "#/components/animated-content";
import { BorderGlow } from "#/components/border-glow";
import { SplitText } from "#/components/split-text";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

/**
 * Carte d'usage d'un service — volontairement générique pour être reprise
 * telle quelle dans le futur espace client (phase 2 : mêmes libellés, mêmes
 * icônes). `to` mène au catalogue public quand il existe, sinon vers
 * l'inscription (compte obligatoire pour commander/réserver).
 */
export function CarteService({
	icone: Icone,
	titre,
	description,
	points,
	to,
	action,
	hint,
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
			<div className="flex h-full flex-col gap-4 p-6">
				<div className="flex size-12 items-center justify-center rounded-xl bg-lagoon/10 text-lagoon transition-colors group-hover:bg-lagoon group-hover:text-white">
					<Icone className="size-6" aria-hidden />
				</div>
				<div className="space-y-1">
					<h3 className="text-xl font-semibold text-foreground">{titre}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
				{points && points.length > 0 ? (
					<ul className="space-y-1.5">
						{points.map((point) => (
							<li
								key={point}
								className="flex items-start gap-2 text-xs text-muted-foreground"
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
						className="inline-flex items-center gap-1 text-sm font-medium text-lagoon transition-colors hover:underline"
					>
						{action}
						<ArrowRight
							className="size-4 transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
					{hint ? (
						<p className="text-xs text-muted-foreground">{hint}</p>
					) : null}
				</div>
			</div>
		</BorderGlow>
	);
}

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
	},
	{
		icone: ShoppingBag,
		titre: "Boutique",
		description:
			"Parcourez le catalogue et commandez vos articles en quelques clics.",
		points: [
			"Catalogue consultable sans compte",
			"Prix affichés en FCFA",
			"Commande depuis votre espace",
		],
		to: "/marchandise/produits",
		action: "Voir les produits",
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
	},
] as const;

export function LandingServices() {
	const pisteRef = useRef<HTMLUListElement>(null);
	const [peutReculer, setPeutReculer] = useState(false);
	const [peutAvancer, setPeutAvancer] = useState(true);
	const [carteActive, setCarteActive] = useState(0);

	const majEtat = useCallback(() => {
		const piste = pisteRef.current;
		if (!piste) return;
		const largeurCarte =
			piste.firstElementChild instanceof HTMLElement
				? piste.firstElementChild.offsetWidth + 24 // + gap-6
				: piste.clientWidth;
		setPeutReculer(piste.scrollLeft > 8);
		setPeutAvancer(
			piste.scrollLeft + piste.clientWidth < piste.scrollWidth - 8,
		);
		setCarteActive(Math.round(piste.scrollLeft / largeurCarte));
	}, []);

	useEffect(() => {
		majEtat();
		const piste = pisteRef.current;
		if (!piste || typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(majEtat);
		ro.observe(piste);
		return () => ro.disconnect();
	}, [majEtat]);

	const defiler = (sens: 1 | -1) => {
		const piste = pisteRef.current;
		if (!piste) return;
		const premiereCarte = piste.firstElementChild;
		const pas =
			premiereCarte instanceof HTMLElement
				? premiereCarte.offsetWidth + 24
				: piste.clientWidth;
		piste.scrollBy({ left: sens * pas, behavior: "smooth" });
	};

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
					<div className="relative">
						<ul
							ref={pisteRef}
							onScroll={majEtat}
							className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							aria-label="Nos services"
						>
							{SERVICES.map((service) => (
								<li
									key={service.titre}
									className="w-full shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
								>
									<CarteService {...service} />
								</li>
							))}
						</ul>

						<Button
							variant="outline"
							size="icon"
							className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-background shadow-md lg:inline-flex"
							disabled={!peutReculer}
							onClick={() => defiler(-1)}
							aria-label="Carte précédente"
						>
							<ChevronLeft className="size-5" aria-hidden />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-background shadow-md lg:inline-flex"
							disabled={!peutAvancer}
							onClick={() => defiler(1)}
							aria-label="Carte suivante"
						>
							<ChevronRight className="size-5" aria-hidden />
						</Button>
					</div>

					<div className="mt-6 flex items-center justify-center gap-3">
						<Button
							variant="ghost"
							size="icon-sm"
							className="lg:hidden"
							disabled={!peutReculer}
							onClick={() => defiler(-1)}
							aria-label="Carte précédente"
						>
							<ChevronLeft className="size-5" aria-hidden />
						</Button>
						<div className="flex gap-1.5" aria-hidden>
							{SERVICES.map((service, i) => (
								<span
									key={service.titre}
									className={cn(
										"h-1.5 rounded-full transition-all",
										i === carteActive
											? "w-6 bg-lagoon"
											: "w-1.5 bg-muted-foreground/30",
									)}
								/>
							))}
						</div>
						<Button
							variant="ghost"
							size="icon-sm"
							className="lg:hidden"
							disabled={!peutAvancer}
							onClick={() => defiler(1)}
							aria-label="Carte suivante"
						>
							<ChevronRight className="size-5" aria-hidden />
						</Button>
					</div>
				</AnimatedContent>
			</div>
		</section>
	);
}
