import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { LoginPage } from "#/features/auth/components/login-page";

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		next: z.string().optional(),
		/** Posé par `_authenticated.tsx` quand la session expire en arrière-plan
		 * (refresh token rejeté) pendant que l'utilisateur était déjà sur une
		 * page protégée — explique la redirection plutôt que de la laisser
		 * silencieuse. Le `parseSearch` par défaut de TanStack Router applique
		 * `JSON.parse` à chaque valeur : `?expired=1` arrive donc en nombre `1`,
		 * pas en chaîne "1" — on accepte les deux et on normalise en "1" pour
		 * ne pas changer le reste du fichier (`search.expired === "1"`). */
		expired: z
			.union([z.literal(1), z.literal("1")])
			.transform(() => "1" as const)
			.optional(),
		/** Posé par la page de réinitialisation après un succès (mot de passe
		 * changé, sessions révoquées) — affiche un message avant de laisser
		 * l'utilisateur se reconnecter. Même normalisation que `expired`. */
		reinitialise: z
			.union([z.literal(1), z.literal("1")])
			.transform(() => "1" as const)
			.optional(),
	}),
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ href: "/" });
		}
	},
	component: LoginPage,
});
