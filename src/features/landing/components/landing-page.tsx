import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteFooter } from "#/components/site-footer";
import { SoftAurora } from "#/components/soft-aurora";
import { useAuth } from "#/core/auth";

import { LandingCta } from "./landing-cta";
import { LandingDishes } from "./landing-dishes";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingProducts } from "./landing-products";
import { LandingServices } from "./landing-services";
import { LandingSteps } from "./landing-steps";

/**
 * Page d'accueil publique (extraite de `routes/index.tsx` — un composant
 * exporté en plus de `Route` empêche TanStack Router de découper cette route
 * dans son propre chunk, voir l'avertissement "will not be code-split").
 */
export function LandingPage() {
	const auth = useAuth();
	const router = useRouter();

	// Cas SSR-optimiste (cookie-indice) où l'utilisateur est en fait déjà
	// connecté : `beforeLoad` ne s'exécute pas à l'hydratation initiale, donc
	// sans ceci on resterait bloqué sur cette page publique au lieu d'atterrir
	// sur /home (cf. `_authenticated.tsx` pour le même mécanisme détaillé).
	useEffect(() => {
		if (auth.isAuthenticated) return;
		let cancelled = false;
		(async () => {
			await auth.restore();
			if (!cancelled && auth.isAuthenticated) {
				void router.invalidate();
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [auth, router]);

	return (
		<div className="relative flex min-h-dvh flex-col">
			{/* Fond aurore sur toute la page (lightMode = base blanche, bandes
				lagoon/bleu) — les sections claires ont des fonds translucides qui
				laissent transparaître l'aurore ; le hero et le footer restent
				opaques. */}
			<div className="fixed inset-0 -z-10 bg-background">
				<SoftAurora
					lightMode
					color1="#4A9FD8"
					color2="#E67E22"
					speed={0.5}
					brightness={0.9}
					mouseInfluence={0.15}
				/>
				{/* Voile qui estompe l'aurore pour rester discret derrière le texte */}
				<div className="absolute inset-0 bg-background/60" aria-hidden />
			</div>
			<LandingHeader />
			<main className="flex-1">
				<LandingHero />
				<LandingServices />
				<LandingDishes />
				<LandingProducts />
				<LandingSteps />
				<LandingCta />
			</main>
			<SiteFooter />
		</div>
	);
}
