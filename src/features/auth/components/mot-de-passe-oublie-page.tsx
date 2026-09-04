import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Loader2, User } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { authApi, toApiError } from "#/core/api";

import { AuthPageShell } from "./auth-page-shell";

type Champ = "login";

/**
 * Page « Mot de passe oublié » (écran 1/2 du flux self-service). Publique,
 * pas de garde d'authentification (route hors de `_authenticated`). Les
 * messages d'erreur du backend sont affichés tels quels (pas de message
 * générique anti-énumération) : GSG est un outil interne, la clarté prime —
 * seul le 429 (throttle, 5 requêtes/minute côté backend) reçoit un message
 * générique, le texte brut d'une exception de throttling n'étant pas destiné
 * à un utilisateur final.
 */
export function MotDePasseOubliePage() {
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [envoye, setEnvoye] = useState(false);

	const form = useForm({
		defaultValues: {
			login: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<Champ, string>> = {};
				if (!value.login.trim()) fields.login = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await authApi.motDePasseOublie({ login: value.login.trim() });
				setEnvoye(true);
			} catch (error) {
				const apiError = toApiError(error);
				setGlobalError(
					apiError.status === 429
						? "Trop de tentatives, réessayez dans quelques minutes."
						: apiError.message ||
								"Impossible d'envoyer le lien de réinitialisation.",
				);
			}
		},
	});

	return (
		<AuthPageShell
			title="Mot de passe oublié"
			subtitle="Recevez un lien pour définir un nouveau mot de passe"
		>
			{envoye ? (
				<div className="space-y-5">
					<output className="block rounded-lg bg-[#27AE60]/10 border border-[#27AE60]/30 px-4 py-3 text-sm text-[#27AE60]">
						Un email a été envoyé, vérifiez votre boîte de réception.
					</output>
					<Link
						to="/login"
						className="block text-center text-sm text-lagoon hover:underline font-semibold transition-colors"
					>
						Retour à la connexion
					</Link>
				</div>
			) : (
				<form
					className="space-y-5"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="login">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Identifiant"
								placeholder="Votre identifiant"
								autoComplete="username"
								icon={<User className="size-4" aria-hidden />}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>

					{globalError ? (
						<div
							role="alert"
							className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
						>
							{globalError}
						</div>
					) : null}

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button
								type="submit"
								className="w-full h-11 bg-lagoon hover:bg-lagoon/90 text-white font-semibold transition-all duration-200 active:scale-95"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" aria-hidden />
										Envoi…
									</>
								) : (
									"Envoyer le lien de réinitialisation"
								)}
							</Button>
						)}
					</form.Subscribe>

					<p className="text-xs text-center text-muted-foreground pt-2">
						<Link
							to="/login"
							className="text-lagoon hover:underline font-semibold transition-colors"
						>
							Retour à la connexion
						</Link>
					</p>
				</form>
			)}
		</AuthPageShell>
	);
}
