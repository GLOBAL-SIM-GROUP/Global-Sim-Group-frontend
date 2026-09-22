import { Link } from "@tanstack/react-router";
import {
	BedDouble,
	ChevronRight,
	ClipboardList,
	Flag,
	PartyPopper,
	Shirt,
	ShoppingBag,
	ShoppingCart,
	UtensilsCrossed,
} from "lucide-react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { useCurrentUser } from "#/core/auth";
import { usePressingCommandes } from "#/features/portail/hooks/use-pressing";

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
] as const;

/**
 * Accueil de l'espace client (`/espace-client`) : vraie page d'entrée (plus
 * une simple redirection), raccourcis vers les cinq services et résumé des
 * commandes pressing en cours — seule donnée réellement exposée au compte
 * CLIENT côté backend à ce jour. Lien vers « Mes demandes » (traces locales
 * des formulaires de demande, cf. `models/demandes.ts`).
 */
export function AccueilPage() {
	const user = useCurrentUser();
	const commandesQuery = usePressingCommandes();
	const commandes = commandesQuery.data ?? [];
	const enCours = commandes.filter(
		(commande) => commande.statut !== "RETIRE" && commande.statut !== "ANNULEE",
	).length;

	return (
		<div className="w-full space-y-8 pt-6 pb-16">
			<Breadcrumb items={[{ label: "Espace client" }]} />

			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Bonjour{user?.login ? ` ${user.login}` : ""}
				</h1>
				<p className="text-sm text-muted-foreground">
					Tous les services GLOBAL SIM GROUP depuis votre espace.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{SERVICES.map((service) => (
					<Link
						key={service.to}
						to={service.to}
						className="group space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
					>
						<div className="flex items-center justify-between">
							<span className="grid size-10 place-items-center rounded-lg bg-lagoon/15">
								<service.icon className="size-5 text-lagoon" aria-hidden />
							</span>
							<ChevronRight
								className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
								aria-hidden
							/>
						</div>
						<div className="space-y-1">
							<p className="font-semibold text-foreground">{service.label}</p>
							<p className="text-sm text-muted-foreground">
								{service.description}
							</p>
						</div>
					</Link>
				))}

				<Link
					to="/espace-client/mes-demandes"
					className="group space-y-3 rounded-xl border border-lagoon/40 bg-lagoon/5 p-5 shadow-sm transition-colors hover:border-lagoon/60 hover:bg-lagoon/10"
				>
					<div className="flex items-center justify-between">
						<span className="grid size-10 place-items-center rounded-lg bg-lagoon/15">
							<ClipboardList className="size-5 text-lagoon" aria-hidden />
						</span>
						<ChevronRight
							className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-foreground">Mes demandes</p>
						<p className="text-sm text-muted-foreground">
							{commandesQuery.isLoading
								? "Chargement de vos demandes…"
								: enCours > 0
									? `${enCours} commande${enCours > 1 ? "s" : ""} pressing en cours — suivez toutes vos demandes.`
									: "Suivez vos demandes envoyées et vos dépôts pressing."}
						</p>
					</div>
				</Link>

				<Link
					to="/espace-client/panier"
					className="group space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
				>
					<div className="flex items-center justify-between">
						<span className="grid size-10 place-items-center rounded-lg bg-lagoon/15">
							<ShoppingCart className="size-5 text-lagoon" aria-hidden />
						</span>
						<ChevronRight
							className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-foreground">Mon panier</p>
						<p className="text-sm text-muted-foreground">
							Vérifiez vos articles restaurant et boutique puis envoyez votre
							demande.
						</p>
					</div>
				</Link>

				<Link
					to="/espace-client/signalement"
					className="group space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
				>
					<div className="flex items-center justify-between">
						<span className="grid size-10 place-items-center rounded-lg bg-lagoon/15">
							<Flag className="size-5 text-lagoon" aria-hidden />
						</span>
						<ChevronRight
							className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</div>
					<div className="space-y-1">
						<p className="font-semibold text-foreground">
							Signaler un problème
						</p>
						<p className="text-sm text-muted-foreground">
							Décrivez un souci dans nos locaux ou services.
						</p>
					</div>
				</Link>
			</div>
		</div>
	);
}
