import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AnimatedContent } from "#/components/animated-content";
import { BorderGlow } from "#/components/border-glow";
import { SplitText } from "#/components/split-text";
import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";

/**
 * Bannière CTA finale avant le footer — dernier rappel à l'inscription,
 * auth-aware (renvoie vers l'espace si déjà connecté).
 */
export function LandingCta() {
	const navigate = useNavigate();
	const currentUser = useCurrentUser();

	return (
		<section className="bg-muted/30 px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14 lg:px-8">
			<AnimatedContent distance={60} threshold={0.15}>
				<BorderGlow
					backgroundColor="#1A2B4C"
					borderRadius={24}
					glowRadius={48}
					glowColor="27 95 65"
					colors={["#E67E22", "#F0954D", "#4A9FD8"]}
					className="mx-auto max-w-5xl text-center text-white"
				>
					<div className="relative bg-gradient-to-br from-sea-ink via-sea-ink/95 to-sea-ink/80 px-6 py-14 sm:px-12 sm:py-16">
						{/* Blobs décoratifs — purement visuels */}
						<div
							className="pointer-events-none absolute -top-20 -left-20 size-64 rounded-full bg-lagoon/25 blur-3xl"
							aria-hidden
						/>
						<div
							className="pointer-events-none absolute -right-20 -bottom-20 size-64 rounded-full bg-palm/20 blur-3xl"
							aria-hidden
						/>

						<div className="relative space-y-6">
							<SplitText
								tag="h2"
								text="Prêt à profiter de nos services ?"
								className="text-3xl font-bold sm:text-4xl"
								splitType="words"
								delay={60}
								duration={0.6}
							/>
							<p className="mx-auto max-w-xl text-white/80">
								Créez votre compte gratuit et accédez à toutes les commandes et
								réservations depuis votre espace client.
							</p>
							<div className="flex flex-col justify-center gap-3 sm:flex-row">
								{currentUser ? (
									<Button
										size="lg"
										className="bg-lagoon text-white hover:bg-lagoon/90"
										onClick={() => void navigate({ to: "/home" })}
									>
										Accéder à mon espace
										<ArrowRight className="ml-2 size-5" aria-hidden />
									</Button>
								) : (
									<>
										<Button
											size="lg"
											className="bg-lagoon text-white hover:bg-lagoon/90"
											onClick={() => void navigate({ to: "/inscription" })}
										>
											Créer mon compte
											<ArrowRight className="ml-2 size-5" aria-hidden />
										</Button>
										<Button
											size="lg"
											variant="outline"
											className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
											onClick={() => void navigate({ to: "/login" })}
										>
											Se connecter
										</Button>
									</>
								)}
							</div>
						</div>
					</div>
				</BorderGlow>
			</AnimatedContent>
		</section>
	);
}
