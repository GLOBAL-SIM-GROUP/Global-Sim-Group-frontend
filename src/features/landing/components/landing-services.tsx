import { Link } from "@tanstack/react-router";
import {
	Home,
	UtensilsCrossed,
	ShoppingBag,
	BarChart3,
	Users,
	FileText,
	Zap,
} from "lucide-react";

const services = [
	{
		icon: UtensilsCrossed,
		title: "Restaurant",
		description: "Découvrez nos plats et commandements en ligne",
		href: "#restaurant",
	},
	{
		icon: ShoppingBag,
		title: "Boutique",
		description: "Achetez vos produits préférés facilement",
		href: "#boutique",
	},
	{
		icon: Home,
		title: "Résidence",
		description: "Gestion complète de votre logement",
		href: "#",
	},
	{
		icon: BarChart3,
		title: "Finances",
		description: "Suivi financier transparent et sécurisé",
		href: "#",
	},
	{
		icon: Users,
		title: "Ressources Humaines",
		description: "Gestion des paies et du personnel",
		href: "#",
	},
	{
		icon: FileText,
		title: "Rapports",
		description: "Analyses détaillées et statistiques",
		href: "#",
	},
];

export function LandingServices() {
	return (
		<section className="py-20 sm:py-32 bg-card/50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						Nos services
					</h2>
					<p className="text-lg text-muted-foreground">
						Une plateforme complète pour tous vos besoins
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{services.map((service) => {
						const Icon = service.icon;
						return (
							<a
								key={service.title}
								href={service.href}
								className="group relative overflow-hidden rounded-lg border border-border bg-background p-6 transition-all hover:border-primary hover:shadow-lg"
							>
								<div className="flex items-start gap-4">
									<div className="rounded-lg bg-primary/10 p-3">
										<Icon className="h-6 w-6 text-primary" />
									</div>
									<div className="flex-1">
										<h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
											{service.title}
										</h3>
										<p className="text-sm text-muted-foreground">
											{service.description}
										</p>
									</div>
								</div>
							</a>
						);
					})}
				</div>

				<div className="mt-16 text-center">
					<p className="text-muted-foreground mb-4">
						Connectez-vous pour accéder à tous nos services
					</p>
					<Link
						to="/login"
						className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						Se connecter maintenant
					</Link>
				</div>
			</div>
		</section>
	);
}
