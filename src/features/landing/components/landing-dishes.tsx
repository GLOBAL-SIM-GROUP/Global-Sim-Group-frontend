import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardFooter } from "#/components/ui/card";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { listPlats } from "#/features/restaurant/api/plats";

export function LandingDishes() {
	const navigate = useNavigate();
	const {
		data: plats,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["restaurant", "plats", "public"],
		queryFn: () => listPlats(),
	});

	if (isLoading) {
		return (
			<section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
				<div className="max-w-7xl mx-auto">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Restaurant
						</h2>
						<p className="text-lg text-muted-foreground">
							Nos plats et boissons
						</p>
					</div>
					<div className="flex justify-center py-12">
						<Loader2 className="size-8 animate-spin text-lagoon" />
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-destructive/5">
				<div className="max-w-7xl mx-auto">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Restaurant
						</h2>
					</div>
					<div className="flex flex-col items-center justify-center gap-4 py-8">
						<AlertCircle className="size-8 text-destructive" />
						<p className="text-center text-muted-foreground">
							Erreur lors du chargement des plats
						</p>
					</div>
				</div>
			</section>
		);
	}

	const platsDisponibles = plats?.filter((p) => p.disponible) ?? [];

	return (
		<section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
			<div className="max-w-7xl mx-auto">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
						Restaurant
					</h2>
					<p className="text-lg text-muted-foreground">
						Nos plats et boissons disponibles
					</p>
				</div>

				{platsDisponibles.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							Aucun plat disponible pour le moment.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
						{platsDisponibles.slice(0, 6).map((plat) => (
							<Card
								key={plat.id}
								className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
							>
								{plat.image_url && (
									<div className="h-48 overflow-hidden bg-muted flex items-center justify-center">
										<img
											src={plat.image_url}
											alt={plat.nom}
											className="w-full h-full object-cover"
										/>
									</div>
								)}
								<CardContent className="flex-1 pt-4">
									<h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2">
										{plat.nom}
									</h3>
									{plat.description && (
										<p className="text-muted-foreground text-sm mb-4 line-clamp-2">
											{plat.description}
										</p>
									)}
									<p className="text-xl font-bold text-lagoon">
										{formatMontantFCFA(plat.prix)}
									</p>
								</CardContent>
								<CardFooter className="pt-0">
									<Button
										className="w-full bg-lagoon hover:bg-lagoon/90"
										onClick={() => navigate({ to: "/login" })}
									>
										Commander
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
