import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, AlertCircle } from "lucide-react";
import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { listPlats } from "../api/plats";

export function LandingDishes() {
	const { data: plats = [], isLoading, isError } = useQuery({
		queryKey: ["restaurant", "plats", "public"],
		queryFn: () => listPlats(),
	});

	// Limiter à 6 plats pour la landing
	const displayedPlats = plats.slice(0, 6);

	return (
		<section id="restaurant" className="py-20 sm:py-32 bg-card/50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
						Restaurant
					</h2>
					<p className="text-lg text-muted-foreground">
						Savourez nos plats préparés avec passion
					</p>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="rounded-lg border border-border bg-background p-4 animate-pulse">
								<div className="aspect-square bg-muted rounded-lg mb-4" />
								<div className="h-4 bg-muted rounded mb-2" />
								<div className="h-4 bg-muted rounded w-2/3" />
							</div>
						))}
					</div>
				) : isError ? (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
						<AlertCircle className="h-5 w-5 text-destructive" />
						<p className="text-sm text-destructive">
							Impossible de charger les plats. Veuillez réessayer plus tard.
						</p>
					</div>
				) : plats.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">Aucun plat disponible pour le moment.</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
							{displayedPlats.map((plat) => (
								<div
									key={plat.id}
									className="rounded-lg border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow"
								>
									{plat.image_url ? (
										<div className="aspect-square overflow-hidden bg-muted">
											<img
												src={plat.image_url}
												alt={plat.nom}
												className="h-full w-full object-cover hover:scale-105 transition-transform"
											/>
										</div>
									) : (
										<div className="aspect-square bg-muted flex items-center justify-center">
											<UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
										</div>
									)}
									<div className="p-4">
										<h3 className="font-semibold text-foreground mb-1 line-clamp-2">
											{plat.nom}
										</h3>
										{plat.description && (
											<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
												{plat.description}
											</p>
										)}
										<div className="flex items-center justify-between">
											<span className="text-lg font-bold text-primary">
												{formatMontantFCFA(plat.prix)}
											</span>
											<Button size="sm" asChild>
												<Link to="/login">Commander</Link>
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>

						{plats.length > 6 && (
							<div className="text-center">
								<Button size="lg" asChild>
									<Link to="/login">Voir tous les plats ({plats.length})</Link>
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
