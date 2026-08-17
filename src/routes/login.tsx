import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
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
		<main className="flex min-h-dvh items-center justify-center p-6">
			<div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
				<header className="space-y-1">
					<h1 className="text-xl font-semibold">{m.app_name()}</h1>
					<p className="text-sm text-muted-foreground">
						{m.auth_login_subtitle()}
					</p>
				</header>

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
							<div className="space-y-2">
								<Label htmlFor={field.name}>{m.auth_login_label_login()}</Label>
								<Input
									id={field.name}
									name={field.name}
									autoComplete="username"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field name="motDePasse">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									{m.auth_login_label_password()}
								</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									autoComplete="current-password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								{field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
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
								{isSubmitting ? m.auth_login_pending() : m.auth_login_submit()}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</div>
		</main>
	);
}
