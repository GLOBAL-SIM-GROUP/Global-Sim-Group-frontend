import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	ClipboardList,
	KeyRound,
	Loader2,
	ShoppingCart,
	UserRound,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import { authApi, toApiError } from "#/core/api";
import { useCurrentUser } from "#/core/auth";
import { servicesDuCompte } from "#/core/permissions";

/**
 * « Mon compte » de l'espace client (`/espace-client/mon-compte`) :
 * informations réellement exposées au client (`/auth/me` : login, rôle,
 * numéro de dossier, services accessibles) + changement de mot de passe.
 *
 * Pas d'endpoint « changer mon mot de passe connecté » : le seul mécanisme
 * self-service est `POST /auth/mot-de-passe-oublie` — le bouton envoie
 * donc l'email de réinitialisation à l'adresse associée au compte ; le lien
 * mène à `/reinitialiser-mot-de-passe` (route publique) et le succès révoque
 * toutes les sessions, y compris celle en cours.
 */
export function MonComptePage() {
	const user = useCurrentUser();
	const [envoye, setEnvoye] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	const reinitialiser = useMutation({
		mutationFn: () => authApi.motDePasseOublie({ login: user?.login ?? "" }),
		onSuccess: () => {
			setErreur(null);
			setEnvoye(true);
		},
		onError: (error) => {
			setErreur(
				toApiError(error).message ||
					"Impossible d'envoyer l'email de réinitialisation.",
			);
		},
	});

	const services = servicesDuCompte(user?.permissions ?? []);

	return (
		<div className="w-full space-y-6 pt-6 pb-16">
			<PageHeader
				breadcrumb={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Mon compte" },
				]}
				title="Mon compte"
				description="Vos informations de compte GLOBAL SIM GROUP."
			/>

			<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
				<span className="grid size-14 shrink-0 place-items-center rounded-full bg-lagoon/15">
					<UserRound className="size-7 text-lagoon" aria-hidden />
				</span>
				<div className="min-w-0 space-y-0.5">
					<p className="truncate text-lg font-semibold text-foreground">
						{user?.login ?? "—"}
					</p>
					<p className="text-sm text-muted-foreground">
						Compte client
						{user?.idClient ? ` · dossier n° ${user.idClient}` : ""}
					</p>
				</div>
			</div>

			{services.length > 0 ? (
				<section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
					<h2 className="text-sm font-semibold text-foreground">
						Services accessibles avec votre compte
					</h2>
					<div className="flex flex-wrap gap-2">
						{services.map((service) => (
							<Badge key={service} variant="neutral">
								{service}
							</Badge>
						))}
					</div>
				</section>
			) : null}

			<section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
				<h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
					<KeyRound className="size-4 text-lagoon" aria-hidden />
					Mot de passe
				</h2>
				{envoye ? (
					<output className="block rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success">
						Un email de réinitialisation a été envoyé à l'adresse associée à
						votre compte. Suivez le lien pour définir un nouveau mot de passe —
						votre session actuelle sera fermée.
					</output>
				) : (
					<>
						<p className="text-sm text-muted-foreground">
							Un lien de réinitialisation sera envoyé à l'adresse email associée
							à votre compte.
						</p>
						{erreur ? (
							<p role="alert" className="text-sm text-destructive">
								{erreur}
							</p>
						) : null}
						<Button
							type="button"
							variant="outline"
							className="rounded-full"
							disabled={reinitialiser.isPending || !user?.login}
							onClick={() => reinitialiser.mutate()}
						>
							{reinitialiser.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{reinitialiser.isPending ? "Envoi…" : "Modifier mon mot de passe"}
						</Button>
					</>
				)}
			</section>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Link
					to="/espace-client/mes-demandes"
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
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
					className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
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
				Pour modifier vos coordonnées, contactez la réception :{" "}
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
