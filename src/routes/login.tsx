import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouteContext,
	useSearch,
} from "@tanstack/react-router";
import { Loader2, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { PasswordInput } from "#/components/ui/password-input";
import { getErrorMessageForCode, getFieldErrors, toApiError } from "#/core/api";

type LoginField = "login" | "motDePasse";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, LoginField> = {
	login: "login",
	mot_de_passe: "motDePasse",
};

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		/** URL d'origine (retour après connexion/restauration de session). */
		next: z.string().optional(),
	}),
	beforeLoad: ({ context }) => {
		// Déjà connecté → pas de page de login.
		if (context.auth.isAuthenticated) {
			throw redirect({ href: "/" });
		}
	},
	component: LoginPage,
});

export function LoginPage() {
	const navigate = useNavigate();
	const { auth } = useRouteContext({ from: "/login" });
	const search = useSearch({ from: "/login" });
	const [globalError, setGlobalError] = useState<string | null>(null);
	// Pendant la restauration de la session persistée (rechargement), on masque
	// le formulaire : l'utilisateur est renvoyé vers `next` sans voir /login.
	const [verification, setVerification] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (auth.isAuthenticated) {
				setVerification(false);
				return;
			}
			await auth.restore();
			if (cancelled) return;
			setVerification(false);
			if (auth.isAuthenticated) {
				await navigate({ href: search.next ?? "/" });
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [auth, navigate, search.next]);

	const form = useForm({
		defaultValues: {
			login: "",
			motDePasse: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				// Retour attendu par TanStack Form : `{ form?, fields: { champ: erreur } }`.
				// Un objet plat `{ champ: erreur }` serait interprété comme une erreur
				// globale de formulaire, pas comme des erreurs champ par champ.
				const fields: Partial<Record<LoginField, string>> = {};
				if (!value.login.trim()) fields.login = "Ce champ est requis.";
				if (!value.motDePasse) fields.motDePasse = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await auth.login(value.login.trim(), value.motDePasse);
				await navigate({ href: search.next ?? "/" });
			} catch (error) {
				// Erreurs de validation backend → champ par champ (details[].property).
				let mappedFields = 0;
				for (const detail of getFieldErrors(error)) {
					const formField = FIELD_PROPERTY_TO_FORM[detail.property];
					if (formField && detail.messages.length > 0) {
						form.setFieldMeta(formField, (prev) => ({
							...prev,
							errorMap: {
								...prev.errorMap,
								onServer: detail.messages.join(" · "),
							},
						}));
						mappedFields += 1;
					}
				}
				// Erreur globale (identifiants invalides, réseau…) sinon.
				if (mappedFields === 0) {
					setGlobalError(
						getErrorMessageForCode(toApiError(error).code) ??
							"Connexion impossible.",
					);
				}
			}
		},
	});

	if (verification) {
		return (
			<main className="login-bg flex min-h-dvh items-center justify-center p-6">
				<p className="text-sm text-muted-foreground">
					Vérification de la session…
				</p>
			</main>
		);
	}

	return (
		<main className="login-bg flex min-h-dvh items-center justify-center p-6">
			<div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-sea-ink/20 bg-card shadow-lg">
				{/* Fond de carte blanc uniforme ; une légère teinte en dégradé
				    (navy → transparent) derrière le logo rend ses écritures
				    blanches lisibles sans bandeau plein. */}
				<header className="relative px-8 pt-4 pb-2 text-center">
					<div
						aria-hidden
						className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b from-sea-ink/95 via-sea-ink/55 to-transparent"
					/>
					<div className="relative space-y-1">
						{/* Logo servi depuis public/ (décoratif : le nom est le h1
						    juste en dessous → alt vide). */}
						<img
							src="/logo.png"
							alt=""
							className="mx-auto h-28 w-auto object-contain"
						/>
						<h1 className="text-xl font-semibold tracking-tight text-foreground">
							GLOBAL SIM GROUP
						</h1>
						<p className="text-sm text-muted-foreground">
							Accédez à votre espace de gestion
						</p>
					</div>
				</header>

				<div className="space-y-6 p-8">
					<h2 className="text-lg font-semibold text-foreground">Connexion</h2>

					<form
						className="space-y-4"
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
									placeholder="email@exemple.com"
									autoComplete="username"
									icon={<User className="size-4" aria-hidden />}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="motDePasse">
							{(field) => (
								<PasswordInput
									id={field.name}
									name={field.name}
									label="Mot de passe"
									placeholder="••••••••"
									icon={<Lock className="size-4" aria-hidden />}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}

						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									className="w-full bg-lagoon text-white hover:bg-lagoon/90"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="animate-spin" aria-hidden />
											Connexion…
										</>
									) : (
										"Se connecter"
									)}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<footer className="text-center text-xs text-muted-foreground">
						© 2026 GLOBAL SIM GROUP. Tous droits réservés.
					</footer>
				</div>
			</div>
		</main>
	);
}
