import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";

export function LandingHero() {
	const navigate = useNavigate();
	const currentUser = useCurrentUser();

	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-sea-ink via-lagoon/10 to-background py-20 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8">
			{/* Decorative blobs */}
			<div className="absolute top-0 -right-40 w-80 h-80 bg-lagoon/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-0 -left-40 w-80 h-80 bg-palm/10 rounded-full blur-3xl pointer-events-none" />

			<div className="relative max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Left content */}
					<div className="space-y-8">
						<div className="space-y-4">
							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
								GLOBAL SIM GROUP
							</h1>
							<p className="text-xl text-muted-foreground">
								Vos services à portée de main
							</p>
						</div>

						<p className="text-lg text-muted-foreground max-w-lg">
							Découvrez une plateforme complète pour gérer votre résidence,
							boutique, restaurant et bien plus. Accédez à tous nos services
							depuis un seul endroit.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<Button
								size="lg"
								className="bg-lagoon hover:bg-lagoon/90 text-white"
								onClick={() =>
									document
										.getElementById("services")
										?.scrollIntoView({ behavior: "smooth" })
								}
							>
								Explorer nos services
								<ArrowRight className="ml-2 size-5" />
							</Button>
							{!currentUser && (
								<Button
									size="lg"
									variant="outline"
									onClick={() => navigate({ to: "/login" })}
								>
									Connexion rapide
								</Button>
							)}
						</div>
					</div>

					{/* Right image */}
					<div className="flex justify-center">
						<div className="relative w-full max-w-md">
							<div className="absolute inset-0 bg-gradient-to-r from-lagoon to-palm opacity-20 rounded-2xl blur-2xl" />
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="relative w-full h-auto max-w-md mx-auto object-contain"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
