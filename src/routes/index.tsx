import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasSessionHint } from "#/core/auth";
import { LandingPage } from "#/features/landing/components/landing-page";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		// Restaure la session depuis les tokens persistés (rechargement de page
		// direct sur "/") avant de décider où rediriger — sinon un utilisateur
		// authentifié atterrissant ici sans être jamais passé par `_authenticated`
		// serait vu comme non connecté.
		await context.auth.restore();
		if (!context.auth.isAuthenticated && hasSessionHint()) {
			// SSR : `restore()` ne peut rien lire (pas de localStorage) — sans cet
			// indice, un utilisateur bien connecté serait envoyé vers /login avant
			// de revenir ici. On laisse passer (page publique, sans conséquence) ;
			// `LandingPage` refait la vraie vérification client (`beforeLoad` ne se
			// réexécute pas à l'hydratation du tout premier rendu).
			return;
		}
		throw redirect({ to: context.auth.isAuthenticated ? "/home" : "/login" });
	},
	head: () => ({
		meta: [
			{
				title: "GLOBAL SIM GROUP — Plateforme de gestion complète",
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
