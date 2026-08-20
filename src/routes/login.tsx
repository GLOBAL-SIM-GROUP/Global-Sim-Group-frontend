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

const FIELD_PROPERTY_TO_FORM: Record<string, LoginField> = {
	login: "login",
	mot_de_passe: "motDePasse",
};

export const Route = createFileRoute("/login")({
	validateSearch: z.object({
		next: z.string().optional(),
	}),
	beforeLoad: ({ context }) => {
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
			<main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background to-muted p-4">
				<div className="text-sm text-muted-foreground">
					Vérification de la session…
				</div>
			</main>
		);
	}

	return (
		<main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4 sm:p-6">
			<div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-2xl">
				{/* Section gauche : Branding */}
				<div className="hidden lg:flex flex-col justify-between bg-linear-to-br from-sea-ink via-sea-ink/95 to-lagoon/20 p-12 text-white">
					<div className="space-y-8">
						<div className="space-y-4">
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="h-20 w-auto object-contain brightness-0 invert"
							/>
							<div className="space-y-2">
								<h1 className="text-4xl font-bold tracking-tight">
									GLOBAL SIM GROUP
								</h1>
								<p className="text-lg text-white/80">
									Plateforme de gestion intégrée
								</p>
							</div>
						</div>

						<div className="space-y-4 pt-6 border-t border-white/20">
							<Feature
								icon="📊"
								title="Gestion Complète"
								desc="Résidence, clients, finances et RH"
							/>
							<Feature
								icon="🔒"
								title="Sécurisé"
								desc="Authentification JWT avec permissions granulaires"
							/>
							<Feature
								icon="⚡"
								title="Performant"
								desc="Interface réactive et responsive"
							/>
						</div>
					</div>

					<div className="text-sm text-white/60">
						© 2026 GLOBAL SIM GROUP. Tous droits réservés.
					</div>
				</div>

				{/* Section droite : Formulaire */}
				<div className="flex flex-col justify-center bg-card p-8 sm:p-12 lg:p-10">
					<div className="space-y-8 max-w-md mx-auto w-full">
						{/* En-tête mobile */}
						<div className="lg:hidden space-y-2 text-center">
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="h-12 w-auto mx-auto object-contain"
							/>
							<h1 className="text-2xl font-bold text-foreground">
								GLOBAL SIM GROUP
							</h1>
						</div>

						{/* Titre formulaire */}
						<div className="space-y-2">
							<h2 className="text-2xl font-bold text-foreground">
								Connexion
							</h2>
							<p className="text-sm text-muted-foreground">
								Accédez à votre espace de gestion
							</p>
						</div>

						{/* Formulaire */}
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
										placeholder="Votre identifiant ou email"
										autoComplete="username"
										icon={<User className="size-4" aria-hidden />}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(event.target.value)
										}
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
										placeholder="Votre mot de passe"
										icon={<Lock className="size-4" aria-hidden />}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) =>
											field.handleChange(event.target.value)
										}
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
												Connexion…
											</>
										) : (
											"Se connecter"
										)}
									</Button>
								)}
							</form.Subscribe>

							<p className="text-xs text-center text-muted-foreground pt-2">
								Identifiants de test : admin / motdepasse
							</p>
						</form>
					</div>

					{/* Footer mobile */}
					<div className="lg:hidden text-center mt-8 text-xs text-muted-foreground">
						© 2026 GLOBAL SIM GROUP
					</div>
				</div>
			</div>
		</main>
	);
}

function Feature({
	icon,
	title,
	desc,
}: {
	icon: string;
	title: string;
	desc: string;
}) {
	return (
		<div className="flex gap-4">
			<div className="text-2xl flex-shrink-0">{icon}</div>
			<div>
				<h3 className="font-semibold text-white">{title}</h3>
				<p className="text-sm text-white/70">{desc}</p>
			</div>
		</div>
	);
}
