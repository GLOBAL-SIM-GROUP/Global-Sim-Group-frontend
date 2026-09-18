import { ClipboardCheck, Rocket, UserRound } from "lucide-react";
import { AnimatedContent } from "#/components/animated-content";
import { SplitText } from "#/components/split-text";

const ETAPES = [
	{
		icone: UserRound,
		titre: "Je crée mon compte",
		description:
			"Inscription gratuite en moins d'une minute — nom, téléphone et identifiant suffisent.",
	},
	{
		icone: ClipboardCheck,
		titre: "Je commande ou je réserve",
		description:
			"Plats du restaurant, pressing, salle de fête, articles de la boutique : tout se fait depuis votre espace.",
	},
	{
		icone: Rocket,
		titre: "Je profite du service",
		description:
			"Suivi de vos demandes et reçus disponibles en ligne, à tout moment.",
	},
] as const;

/**
 * Section « Comment ça marche » : ancre le parcours « compte obligatoire »
 * (inscription → commande/réservation → suivi) et prépare l'arrivée de
 * l'espace client transactionnel.
 */
export function LandingSteps() {
	return (
		<section
			id="fonctionnement"
			className="scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
		>
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 space-y-4 text-center">
					<SplitText
						tag="h2"
						text="Comment ça marche ?"
						className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
						splitType="words"
						delay={60}
						duration={0.6}
					/>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Trois étapes suffisent pour profiter de tous nos services.
					</p>
				</div>

				<AnimatedContent distance={60} threshold={0.15}>
					<ol className="grid grid-cols-1 gap-8 sm:grid-cols-3">
						{ETAPES.map((etape, index) => (
							<li
								key={etape.titre}
								className="relative flex flex-col items-center gap-4 text-center"
							>
								<div className="relative">
									<div className="flex size-16 items-center justify-center rounded-2xl bg-lagoon/10 text-lagoon">
										<etape.icone className="size-8" aria-hidden />
									</div>
									<span
										className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-lagoon text-sm font-bold text-white"
										aria-hidden
									>
										{index + 1}
									</span>
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									{etape.titre}
								</h3>
								<p className="max-w-xs text-sm text-muted-foreground">
									{etape.description}
								</p>
							</li>
						))}
					</ol>
				</AnimatedContent>
			</div>
		</section>
	);
}
