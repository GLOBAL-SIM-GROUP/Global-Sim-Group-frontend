import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { PasswordInput } from "#/components/ui/password-input";
import { authApi, toApiError } from "#/core/api";

import { AuthPageShell } from "./auth-page-shell";

type Champ = "nouveauMotDePasse" | "confirmation";

const MOT_DE_PASSE_MIN = 8;
const MOT_DE_PASSE_MAX = 72;

/**
 * Page « Réinitialiser le mot de passe » (écran 2/2), atteinte via le lien
 * envoyé par email — `?token=...` en query param. Publique, pas de garde
 * d'authentification. Le jeton n'est ni décodé ni interprété ici : il
 * transite tel quel de l'URL vers le corps de la requête POST finale. Sert
 * aussi bien le flux « mot de passe oublié » que le lien « définir mon mot
 * de passe » envoyé à la création d'un compte résident — même mécanisme de
 * jeton côté backend, une seule page suffit pour les deux.
 */
export function ReinitialiserMotDePassePage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/reinitialiser-mot-de-passe" });
	const token = search.token?.trim();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			nouveauMotDePasse: "",
			confirmation: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<Champ, string>> = {};
				if (value.nouveauMotDePasse.length < MOT_DE_PASSE_MIN) {
					fields.nouveauMotDePasse = `Minimum ${MOT_DE_PASSE_MIN} caractères.`;
				} else if (value.nouveauMotDePasse.length > MOT_DE_PASSE_MAX) {
					fields.nouveauMotDePasse = `Maximum ${MOT_DE_PASSE_MAX} caractères.`;
				}
				if (value.confirmation !== value.nouveauMotDePasse) {
					fields.confirmation = "Les mots de passe ne correspondent pas.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			if (!token) return;
			setGlobalError(null);
			try {
				await authApi.reinitialiserMotDePasse({
					token,
					nouveau_mot_de_passe: value.nouveauMotDePasse,
				});
				await navigate({ href: "/login?reinitialise=1" });
			} catch (error) {
				const apiError = toApiError(error);
				setGlobalError(
					apiError.status === 429
						? "Trop de tentatives, réessayez dans quelques minutes."
						: "Ce lien n'est plus valide, demandez-en un nouveau.",
				);
			}
		},
	});

	if (!token) {
		return (
			<AuthPageShell
				title="Lien invalide"
				subtitle="Ce lien de réinitialisation est incomplet"
			>
				<div className="space-y-5">
					<div
						role="alert"
						className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
					>
						Ce lien n'est plus valide, demandez-en un nouveau.
					</div>
					<Link
						to="/mot-de-passe-oublie"
						className="block text-center text-sm text-lagoon hover:underline font-semibold transition-colors"
					>
						Demander un nouveau lien
					</Link>
				</div>
			</AuthPageShell>
		);
	}

	return (
		<AuthPageShell
			title="Réinitialiser le mot de passe"
			subtitle="Choisissez un nouveau mot de passe"
		>
			<form
				className="space-y-5"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.Field name="nouveauMotDePasse">
					{(field) => (
						<PasswordInput
							id={field.name}
							name={field.name}
							label="Nouveau mot de passe"
							placeholder="Minimum 8 caractères"
							autoComplete="new-password"
							icon={<Lock className="size-4" aria-hidden />}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="confirmation">
					{(field) => (
						<PasswordInput
							id={field.name}
							name={field.name}
							label="Confirmer le mot de passe"
							placeholder="Ressaisissez le mot de passe"
							autoComplete="new-password"
							icon={<Lock className="size-4" aria-hidden />}
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
						className="space-y-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
					>
						<p>{globalError}</p>
						<Link
							to="/mot-de-passe-oublie"
							className="font-semibold underline underline-offset-2"
						>
							Demander un nouveau lien
						</Link>
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
									Enregistrement…
								</>
							) : (
								"Réinitialiser le mot de passe"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</AuthPageShell>
	);
}
