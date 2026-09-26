import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SplitText } from "#/components/split-text";
import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";

/**
 * Hero de la landing publique : proposition de valeur orientée client
 * externe (commander, déposer, réserver — pas « gestion »). Le CTA primaire
 * mène à l'inscription (compte obligatoire pour les usages transactionnels).
 */
export function LandingHero() {
	const navigate = useNavigate();
	const currentUser = useCurrentUser();

	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-sea-ink via-sea-ink/95 to-sea-ink/90 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
			{/* Blobs décoratifs — purement visuels */}
			<div
				className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-lagoon/20 blur-3xl"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-palm/15 blur-3xl"
				aria-hidden
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					<div className="space-y-8">
						<div className="space-y-4">
							<h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
								<SplitText
									tag="span"
									text="Tous nos services,"
									textAlign="left"
									splitType="words"
									delay={80}
									duration={0.7}
								/>{" "}
								<SplitText
									tag="span"
									text="un seul compte"
									className="text-lagoon"
									textAlign="left"
									splitType="words"
									delay={80}
									duration={0.7}
								/>
							</h1>
							<p className="max-w-lg text-justify text-lg text-white/80">
								Commandez un plat, déposez votre linge au pressing, réservez la
								salle de fête ou passez en boutique — depuis votre espace
								client, où que vous soyez.
							</p>
						</div>

						<div className="flex flex-col gap-4 pt-2 sm:flex-row">
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
										onClick={() =>
											document
												.getElementById("services")
												?.scrollIntoView({ behavior: "smooth" })
										}
									>
										Découvrir nos services
									</Button>
								</>
							)}
						</div>
					</div>

					<div className="flex justify-center">
						<div className="hero-logo-float relative w-full max-w-md">
							<div
								className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lagoon to-palm opacity-20 blur-2xl"
								aria-hidden
							/>
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="relative mx-auto h-auto w-full max-w-md object-contain"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
