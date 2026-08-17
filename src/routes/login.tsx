import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { Loader2, Lock, User } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { PasswordInput } from "#/components/ui/password-input";
import { getFieldErrors, toApiError } from "#/core/api";
import { getErrorMessageForCode } from "#/core/i18n";
import * as m from "#/paraglide/messages";

type LoginField = "login" | "motDePasse";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, LoginField> = {
	login: "login",
	mot_de_passe: "motDePasse",
};

export const Route = createFileRoute("/login")({
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
	const [globalError, setGlobalError] = useState<string | null>(null);

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
				if (!value.login.trim()) fields.login = m.auth_login_field_required();
				if (!value.motDePasse)
					fields.motDePasse = m.auth_login_field_required();
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await auth.login(value.login.trim(), value.motDePasse);
				await navigate({ to: "/" });
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
							m.auth_login_error_global(),
					);
				}
			}
		},
	});

	return (
		<main className="login-bg flex min-h-dvh items-center justify-center p-6">
			<div className="w-full max-w-[420px] space-y-6 rounded-xl border bg-card p-8 shadow-sm">
				<header className="space-y-1 text-center">
					{/* Logo servis depuis public/ (décoratif : le nom est le h1 juste
					    en dessous → alt vide, lu comme décoratif par les lecteurs
					    d'écran). */}
					<img src="/logo.png" alt="" className="mx-auto h-10 w-auto" />
					<h1 className="text-xl font-semibold tracking-tight text-primary">
						{m.app_name()}
					</h1>
					<p className="text-sm text-muted-foreground">
						{m.auth_login_subtitle()}
					</p>
				</header>

				<h2 className="text-lg font-semibold">{m.auth_login_title()}</h2>

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
								label={m.auth_login_label_login()}
								placeholder={m.auth_login_placeholder_login()}
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
								label={m.auth_login_label_password()}
								placeholder={m.auth_login_placeholder_password()}
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
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="animate-spin" aria-hidden />
										{m.auth_login_pending()}
									</>
								) : (
									m.auth_login_submit()
								)}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<footer className="text-center text-xs text-muted-foreground">
					{m.auth_login_copyright()}
				</footer>
			</div>
		</main>
	);
}
