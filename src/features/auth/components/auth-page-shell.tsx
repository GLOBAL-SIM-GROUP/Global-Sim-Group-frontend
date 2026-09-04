import type { ReactNode } from "react";

/**
 * Habillage décoratif commun aux pages d'authentification publiques (fond
 * animé, blobs, panneau de branding). Extrait de `login-page.tsx`/
 * `inscription-page.tsx` (jusque-là dupliqué intégralement entre les deux)
 * pour les pages « Mot de passe oublié » et « Réinitialiser le mot de passe »,
 * qui partagent exactement le même gabarit.
 */
const authAnimationStyles = `
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

	.auth-shell-animated-bg {
		animation: gradientSlide 14s ease-in-out infinite;
		background-size: 300% 300%;
	}

	.auth-shell-logo-bg {
		animation: floatSlow 12s ease-in-out infinite;
	}

	.auth-shell-blob-1 {
		animation: blobBreathe1 8s ease-in-out infinite;
	}

	.auth-shell-blob-2 {
		animation: blobBreathe2 9s ease-in-out infinite;
		animation-delay: 0.5s;
	}

	.auth-shell-blob-3 {
		animation: blobBreathe3 7s ease-in-out infinite;
		animation-delay: 1s;
	}

	.auth-shell-container {
		animation: slideUpFadeIn 0.8s ease-out;
	}

	.auth-shell-branding {
		animation: slideInLeft 0.8s ease-out 0.1s both;
	}

	.auth-shell-form {
		animation: slideInRight 0.8s ease-out 0.2s both;
	}
`;

interface AuthPageShellProps {
	title: string;
	subtitle: string;
	children: ReactNode;
}

/** Habillage complet (fond, branding, panneau formulaire) — voir commentaire de tête. */
export function AuthPageShell({
	title,
	subtitle,
	children,
}: AuthPageShellProps) {
	return (
		<>
			<style>{authAnimationStyles}</style>
			<main
				className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-lagoon/5 to-sea-ink/10 p-4 sm:p-6 relative overflow-hidden auth-shell-animated-bg"
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
				<div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-lagoon/20 to-palm/10 rounded-full blur-3xl opacity-50 pointer-events-none auth-shell-blob-1" />

				{/* Blob décoratif 2 - Bas droite */}
				<div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-sea-ink/20 to-lagoon/10 rounded-full blur-3xl opacity-50 pointer-events-none auth-shell-blob-2" />

				{/* Blob décoratif 3 - Centre */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-lagoon/10 via-transparent to-palm/10 rounded-full blur-3xl opacity-30 pointer-events-none auth-shell-blob-3" />

				{/* Logo en arrière-plan - Bas droite */}
				<div
					className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none opacity-8 auth-shell-logo-bg"
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

				<div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-2xl relative z-10 auth-shell-container">
					{/* Section gauche : Branding */}
					<div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-sea-ink via-sea-ink/90 to-lagoon/30 p-12 text-white relative overflow-hidden auth-shell-branding">
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
					<div className="flex flex-col justify-center bg-card p-8 sm:p-12 lg:p-10 auth-shell-form">
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
								<h2 className="text-2xl font-bold text-foreground">{title}</h2>
								<p className="text-sm text-muted-foreground">{subtitle}</p>
							</div>

							{children}
						</div>

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
