import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "#/core/auth";

import { LandingDishes } from "./landing-dishes";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingProducts } from "./landing-products";
import { LandingServices } from "./landing-services";

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
		<div className="min-h-dvh flex flex-col bg-background">
			<LandingHeader />
			<main className="flex-1">
				<LandingHero />
				<LandingServices />
				<LandingProducts />
				<LandingDishes />
			</main>
			<LandingFooter />
		</div>
	);
}
