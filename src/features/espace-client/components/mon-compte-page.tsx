import { Link } from "@tanstack/react-router";
import { ClipboardList, ShoppingCart, UserRound } from "lucide-react";

import { useCurrentUser } from "#/core/auth";

/**
 * « Mon compte » de l'espace client (`/espace-client/mon-compte`) : fiche en
 * lecture seule — la session n'expose que le login et le rôle (`/auth/me`),
 * aucun endpoint CLIENT n'existe pour éditer le profil ou changer le mot de
 * passe. Renvoie vers la réception pour toute modification.
 */
export function MonComptePage() {
	const user = useCurrentUser();

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Mon compte" },
				]}
			/>

			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Mon compte</h1>
				<p className="text-sm text-muted-foreground">
					Vos informations de compte GLOBAL SIM GROUP.
				</p>
			</div>

			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
				<span className="grid size-14 shrink-0 place-items-center rounded-full bg-lagoon/15">
					<UserRound className="size-7 text-lagoon" aria-hidden />
				</span>
				<div className="min-w-0 space-y-0.5">
					<p className="truncate text-lg font-semibold text-foreground">
						{user?.login ?? "—"}
					</p>
					<p className="text-sm text-muted-foreground">Compte client</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Link
					to="/espace-client/mes-demandes"
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
				>
					<ClipboardList className="size-5 shrink-0 text-lagoon" aria-hidden />
					<div className="min-w-0">
						<p className="text-sm font-semibold text-foreground">
							Mes demandes
						</p>
						<p className="text-xs text-muted-foreground">
							Suivi de vos demandes et dépôts pressing
						</p>
					</div>
				</Link>
				<Link
					to="/espace-client/panier"
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
				>
					<ShoppingCart className="size-5 shrink-0 text-lagoon" aria-hidden />
					<div className="min-w-0">
						<p className="text-sm font-semibold text-foreground">Mon panier</p>
						<p className="text-xs text-muted-foreground">
							Articles restaurant et boutique en attente
						</p>
					</div>
				</Link>
			</div>

			<p className="text-sm text-muted-foreground">
				Pour modifier vos coordonnées ou votre mot de passe, contactez la
				réception :{" "}
				<a
					href="mailto:maitresim4@gmail.com"
					className="font-medium text-lagoon hover:underline"
				>
					maitresim4@gmail.com
				</a>
				.
			</p>
		</div>
	);
}
