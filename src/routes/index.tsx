import { createFileRoute, Link } from "@tanstack/react-router";
import { LandingHero } from "../features/landing/components/landing-hero";
import { LandingServices } from "../features/landing/components/landing-services";
import { LandingProducts } from "../features/marchandise/components/landing-products";
import { LandingDishes } from "../features/restaurant/components/landing-dishes";
import { LandingContact } from "../features/landing/components/landing-contact";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<div className="min-h-dvh bg-background">
			{/* Public Header */}
			<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Link to="/" className="flex items-center gap-2">
							<img src="/logo.png" alt="GLOBAL SIM GROUP" className="h-8 w-8" />
							<span className="text-lg font-semibold text-foreground hidden sm:inline">
								GLOBAL SIM GROUP
							</span>
						</Link>
						<nav className="flex items-center gap-4">
							<Button size="sm" asChild>
								<Link to="/login">Connexion</Link>
							</Button>
						</nav>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main>
				<LandingHero />
				<LandingServices />
				<LandingProducts />
				<LandingDishes />
				<LandingContact />
			</main>

			{/* Footer */}
			<footer className="border-t border-border bg-card/50 py-12 mt-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
						<div>
							<h3 className="font-semibold text-foreground mb-4">À propos</h3>
							<p className="text-sm text-muted-foreground">
								GLOBAL SIM GROUP — Vos services à portée de main
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-4">Services</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li><Link to="/" className="hover:text-foreground transition-colors">Restaurant</Link></li>
								<li><Link to="/" className="hover:text-foreground transition-colors">Boutique</Link></li>
								<li><Link to="/" className="hover:text-foreground transition-colors">Résidence</Link></li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
								<li><Link to="/" className="hover:text-foreground transition-colors">Support</Link></li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-4">Accès</h3>
							<Button size="sm" asChild>
								<Link to="/login">Se connecter</Link>
							</Button>
						</div>
					</div>
					<div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
						<p>&copy; 2026 GLOBAL SIM GROUP. Tous droits réservés.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
