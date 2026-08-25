import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "#/components/ui/button";

export function LandingHero() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 py-20 sm:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
						GLOBAL SIM GROUP
					</h1>
					<p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
						Vos services à portée de main — Restaurant, boutique, résidence et bien plus
					</p>
					<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" asChild>
							<a href="#boutique">Explorer les services</a>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link to="/login">
								Connexion rapide
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
