import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
	useRouteContext,
	useSearch,
} from "@tanstack/react-router";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { PasswordInput } from "#/components/ui/password-input";
import { getErrorMessageForCode, getFieldErrors, toApiError } from "#/core/api";
import { authApi } from "#/core/api/auth";

const inscriptionAnimationStyles = `
	@keyframes gradientSlide {
		0% {
			background-position: -200% 50%;
		}
		50% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 200% 50%;
		}
	}

	@keyframes blobBreathe1 {
		0%, 100% {
			transform: scale(1);
			opacity: 0.5;
		}
		50% {
			transform: scale(1.08);
			opacity: 0.65;
		}
	}

	@keyframes blobBreathe2 {
		0%, 100% {
			transform: scale(1);
			opacity: 0.5;
		}
		50% {
			transform: scale(1.08);
			opacity: 0.65;
		}
	}

	@keyframes blobBreathe3 {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.3;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.06);
			opacity: 0.4;
		}
	}

	@keyframes slideUpFadeIn {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInLeft {
		0% {
			opacity: 0;
			transform: translateX(-30px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes slideInRight {
		0% {
			opacity: 0;
			transform: translateX(30px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes floatSlow {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(2deg);
		}
	}

	.inscription-animated-bg {
		animation: gradientSlide 14s ease-in-out infinite;
		background-size: 300% 300%;
	}

	.inscription-logo-bg {
		animation: floatSlow 12s ease-in-out infinite;
	}

	.inscription-blob-1 {
		animation: blobBreathe1 8s ease-in-out infinite;
	}

	.inscription-blob-2 {
		animation: blobBreathe2 9s ease-in-out infinite;
		animation-delay: 0.5s;
	}

	.inscription-blob-3 {
		animation: blobBreathe3 7s ease-in-out infinite;
		animation-delay: 1s;
	}

	.inscription-container {
		animation: slideUpFadeIn 0.8s ease-out;
	}

	.inscription-branding {
		animation: slideInLeft 0.8s ease-out 0.1s both;
	}

	.inscription-form {
		animation: slideInRight 0.8s ease-out 0.2s both;
	}
`;

type InscriptionField =
	| "nom"
	| "prenoms"
	| "telPrincipal"
	| "login"
	| "motDePasse";

const FIELD_PROPERTY_TO_FORM: Record<string, InscriptionField> = {
	nom: "nom",
	prenoms: "prenoms",
	tel_principal: "telPrincipal",
	login: "login",
	mot_de_passe: "motDePasse",
};

export const Route = createFileRoute("/inscription")({
	validateSearch: z.object({
		next: z.string().optional(),
	}),
	beforeLoad: () => {
		throw redirect({ to: "/login" });
	},
	component: InscriptionPage,
});

export function InscriptionPage() {
	const navigate = useNavigate();
	const { auth } = useRouteContext({ from: "/inscription" });
	const search = useSearch({ from: "/inscription" });
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
				await navigate({ href: search.next ?? "/home" });
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const form = useForm({
		defaultValues: {
			nom: "",
			prenoms: "",
			telPrincipal: "",
			login: "",
			motDePasse: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<InscriptionField, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prenoms.trim()) fields.prenoms = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				if (!value.login.trim()) fields.login = "Ce champ est requis.";
				if (!value.motDePasse) fields.motDePasse = "Ce champ est requis.";
				if (value.motDePasse.length < 8 && value.motDePasse)
					fields.motDePasse = "Minimum 8 caractères.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await authApi.signup({
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					tel_principal: value.telPrincipal.trim(),
					login: value.login.trim(),
					mot_de_passe: value.motDePasse,
				});
				// La session est auto-créée après l'inscription
				await navigate({ href: search.next ?? "/home" });
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
							"Inscription impossible.",
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
		<>
			<style>{inscriptionAnimationStyles}</style>
			<main
				className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-lagoon/5 to-sea-ink/10 p-4 sm:p-6 relative overflow-hidden inscription-animated-bg"
				style={{
					backgroundImage: `
						linear-gradient(45deg, transparent 48%, rgba(88, 192, 180, 0.03) 49%, rgba(88, 192, 180, 0.03) 51%, transparent 52%),
						linear-gradient(-45deg, transparent 48%, rgba(88, 192, 180, 0.03) 49%, rgba(88, 192, 180, 0.03) 51%, transparent 52%)
					`,
					backgroundSize: "60px 60px",
					backgroundPosition: "0 0, 30px 30px",
				}}
			>
				{/* Blob décoratif 1 - Haut gauche */}
				<div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-lagoon/20 to-palm/10 rounded-full blur-3xl opacity-50 pointer-events-none inscription-blob-1" />

				{/* Blob décoratif 2 - Bas droite */}
				<div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-sea-ink/20 to-lagoon/10 rounded-full blur-3xl opacity-50 pointer-events-none inscription-blob-2" />

				{/* Blob décoratif 3 - Centre */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-lagoon/10 via-transparent to-palm/10 rounded-full blur-3xl opacity-30 pointer-events-none inscription-blob-3" />

				{/* Logo en arrière-plan - Bas droite */}
				<div
					className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none opacity-8 inscription-logo-bg"
					style={{
						backgroundImage: "url(/logo.png)",
						backgroundSize: "contain",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "bottom right",
						filter: "brightness(0.5) saturate(0.3)",
					}}
				/>

				{/* Logo en arrière-plan - Haut gauche subtle */}
				<div
					className="absolute top-0 left-0 w-80 h-80 pointer-events-none opacity-5"
					style={{
						backgroundImage: "url(/logo.png)",
						backgroundSize: "contain",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "top left",
						filter: "brightness(0.4) saturate(0.2)",
					}}
				/>

				{/* Overlay pattern subtil */}
				<div
					className="absolute inset-0 opacity-40 pointer-events-none"
					style={{
						backgroundImage: `
							linear-gradient(0deg, transparent 24%, rgba(32, 119, 110, 0.05) 25%, rgba(32, 119, 110, 0.05) 26%, transparent 27%, transparent 74%, rgba(32, 119, 110, 0.05) 75%, rgba(32, 119, 110, 0.05) 76%, transparent 77%, transparent),
							linear-gradient(90deg, transparent 24%, rgba(32, 119, 110, 0.05) 25%, rgba(32, 119, 110, 0.05) 26%, transparent 27%, transparent 74%, rgba(32, 119, 110, 0.05) 75%, rgba(32, 119, 110, 0.05) 76%, transparent 77%, transparent)
						`,
						backgroundSize: "50px 50px",
					}}
				/>

				<div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-2xl relative z-10 inscription-container">
					{/* Section gauche : Branding */}
					<div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-sea-ink via-sea-ink/90 to-lagoon/30 p-12 text-white relative overflow-hidden inscription-branding">
						{/* Blobs internes */}
						<div className="absolute inset-0 overflow-hidden pointer-events-none">
							<div className="absolute -top-20 -right-20 w-64 h-64 bg-lagoon/10 rounded-full blur-3xl" />
							<div className="absolute -bottom-20 -left-20 w-64 h-64 bg-palm/10 rounded-full blur-3xl" />
						</div>
						<div className="space-y-6 text-center relative z-10">
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="h-56 w-auto object-contain brightness-0 invert mx-auto"
							/>
							<h1 className="text-4xl font-bold tracking-tight">
								GLOBAL SIM GROUP
							</h1>
						</div>
					</div>

					{/* Section droite : Formulaire */}
					<div className="flex flex-col justify-center bg-card p-8 sm:p-12 lg:p-10 inscription-form">
						<div className="space-y-8 max-w-md mx-auto w-full">
							{/* En-tête mobile */}
							<div className="lg:hidden space-y-2 text-center">
								<img
									src="/logo.png"
									alt="GLOBAL SIM GROUP"
									className="h-20 w-auto mx-auto object-contain"
								/>
								<h1 className="text-2xl font-bold text-foreground">
									GLOBAL SIM GROUP
								</h1>
							</div>

							{/* Titre formulaire */}
							<div className="space-y-2">
								<h2 className="text-2xl font-bold text-foreground">
									Inscription
								</h2>
								<p className="text-sm text-muted-foreground">
									Créez votre compte client
								</p>
							</div>

							{/* Formulaire */}
							<form
								className="space-y-4"
								onSubmit={(event) => {
									event.preventDefault();
									event.stopPropagation();
									void form.handleSubmit();
								}}
							>
								<div className="grid grid-cols-2 gap-3">
									<form.Field name="nom">
										{(field) => (
											<InputField
												id={field.name}
												name={field.name}
												label="Nom"
												placeholder="Votre nom"
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

									<form.Field name="prenoms">
										{(field) => (
											<InputField
												id={field.name}
												name={field.name}
												label="Prénoms"
												placeholder="Vos prénoms"
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
								</div>

								<form.Field name="telPrincipal">
									{(field) => (
										<InputField
											id={field.name}
											name={field.name}
											label="Téléphone"
											placeholder="+225 07 00 00 00 00"
											type="tel"
											icon={<Phone className="size-4" aria-hidden />}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											error={field.state.meta.errors[0]}
										/>
									)}
								</form.Field>

								<form.Field name="login">
									{(field) => (
										<InputField
											id={field.name}
											name={field.name}
											label="Identifiant"
											placeholder="votre.identifiant"
											icon={<Mail className="size-4" aria-hidden />}
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
											placeholder="Minimum 8 caractères"
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
													<Loader2
														className="size-4 animate-spin mr-2"
														aria-hidden
													/>
													Inscription…
												</>
											) : (
												"Créer mon compte"
											)}
										</Button>
									)}
								</form.Subscribe>

								<p className="text-xs text-center text-muted-foreground pt-2">
									Vous avez déjà un compte ?{" "}
									<Link
										to="/login"
										className="text-lagoon hover:underline font-semibold transition-colors"
									>
										Se connecter
									</Link>
								</p>
							</form>

							{/* Navigation links */}
							<div className="space-y-3 pt-6 border-t">

						{/* Footer mobile */}
						<div className="lg:hidden text-center mt-8 text-xs text-muted-foreground">
							© 2026 GLOBAL SIM GROUP
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
