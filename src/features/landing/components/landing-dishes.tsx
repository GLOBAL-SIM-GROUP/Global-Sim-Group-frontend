import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { AccordionGallery } from "#/components/accordion-gallery";
import { AnimatedContent } from "#/components/animated-content";
import { SplitText } from "#/components/split-text";
import { platImagePublicUrl } from "#/core/api/uploads";
import { listPlats } from "#/features/restaurant/api/plats";

export function LandingDishes() {
	const {
		data: plats,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["restaurant", "plats", "public"],
		queryFn: () => listPlats(),
	});

	const platsDisponibles = plats?.filter((p) => p.disponible) ?? [];

	if (isLoading) {
		return (
			<section
				id="carte"
				className="scroll-mt-16 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Restaurant
						</h2>
						<p className="text-lg text-muted-foreground">
							Nos plats et boissons
						</p>
					</div>
					<div className="flex justify-center py-12">
						<Loader2 className="size-8 animate-spin text-lagoon" />
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section
				id="carte"
				className="scroll-mt-16 bg-destructive/5 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
							Restaurant
						</h2>
					</div>
					<div className="flex flex-col items-center justify-center gap-4 py-8">
						<AlertCircle className="size-8 text-destructive" />
						<p className="text-center text-muted-foreground">
							Erreur lors du chargement des plats
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			id="carte"
			className="scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
		>
			<div className="mx-auto max-w-7xl">
				<div className="mb-14 space-y-4 text-center">
					<SplitText
						tag="h2"
						text="La carte du restaurant"
						className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
						splitType="words"
						delay={60}
						duration={0.6}
					/>
					<p className="text-lg text-muted-foreground">
						Un aperçu de nos plats et boissons du moment
					</p>
				</div>

				{platsDisponibles.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							Aucun plat disponible pour le moment.
						</p>
					</div>
				) : (
					<AnimatedContent distance={60} threshold={0.15}>
						<AccordionGallery
							items={platsDisponibles.slice(0, 6).map((plat) => ({
								image: plat.image_url ? platImagePublicUrl(plat.id) : null,
								label: plat.nom,
								link: "/restaurant/plats",
								alt: plat.nom,
							}))}
							defaultIndex={0}
							accentColor="#E67E22"
							overlayColor="#1A2B4C"
							height={420}
							radius={12}
						/>
					</AnimatedContent>
				)}
			</div>
		</section>
	);
}
