import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader } from "#/features/landing/components/landing-header";
import { LandingHero } from "#/features/landing/components/landing-hero";
import { LandingServices } from "#/features/landing/components/landing-services";
import { LandingProducts } from "#/features/landing/components/landing-products";
import { LandingDishes } from "#/features/landing/components/landing-dishes";
import { LandingFooter } from "#/features/landing/components/landing-footer";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title:
					"GLOBAL SIM GROUP — Plateforme de gestion complète",
			},
			{
				name: "description",
				content:
					"Découvrez GLOBAL SIM GROUP, votre plateforme complète pour gérer votre résidence, boutique, restaurant et services. Accédez à tous vos services depuis un seul endroit.",
			},
		],
	}),
	component: LandingPage,
});

export function LandingPage() {
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
