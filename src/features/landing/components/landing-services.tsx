import {
	DollarSign,
	FileText,
	Home,
	ShoppingCart,
	Users,
	UtensilsCrossed,
} from "lucide-react";
import { Card } from "#/components/ui/card";

const services = [
	{
		id: "residence",
		name: "Résidence",
		description: "Gérez votre résidence et suivi des résidents",
		icon: Home,
		color: "text-blue-500",
	},
	{
		id: "boutique",
		name: "Boutique",
		description: "Parcourez et achetez nos produits en ligne",
		icon: ShoppingCart,
		color: "text-green-500",
	},
	{
		id: "restaurant",
		name: "Restaurant",
		description: "Consultez notre menu et passez vos commandes",
		icon: UtensilsCrossed,
		color: "text-orange-500",
	},
	{
		id: "rh",
		name: "Ressources Humaines",
		description: "Gestion du personnel et des paies",
		icon: Users,
		color: "text-purple-500",
	},
	{
		id: "finances",
		name: "Finances",
		description: "Suivi des revenus et des dépenses",
		icon: DollarSign,
		color: "text-yellow-500",
	},
	{
		id: "rapports",
		name: "Rapports",
		description: "Consulter les rapports d'activité",
		icon: FileText,
		color: "text-red-500",
	},
];

export function LandingServices() {
	return (
		<section
			id="services"
			className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30"
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
						Nos Services
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Découvrez tous les services offerts par GLOBAL SIM GROUP pour gérer
						votre plateforme efficacement.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{services.map((service) => {
						const Icon = service.icon;
						return (
							<Card
								key={service.id}
								className="p-6 hover:shadow-lg transition-shadow"
							>
								<div className="flex flex-col gap-4">
									<Icon className={`${service.color} size-10`} />
									<h3 className="text-xl font-semibold text-foreground">
										{service.name}
									</h3>
									<p className="text-muted-foreground">{service.description}</p>
								</div>
							</Card>
						);
					})}
				</div>

				<div className="mt-12 p-8 bg-lagoon/10 border border-lagoon/20 rounded-lg text-center">
					<p className="text-lg text-foreground mb-4">
						Se connecter pour accéder à tous ces services
					</p>
				</div>
			</div>
		</section>
	);
}
