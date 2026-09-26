import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { ConditionsUtilisationDialog } from "./conditions-utilisation-dialog";
import { PolitiqueConfidentialiteDialog } from "./politique-confidentialite-dialog";

const LIEN = "text-white/70 hover:text-white transition-colors";

/** Liens « Navigation » propres à chaque contexte. */
const NAV_PUBLIC = [
	{ label: "Accueil", to: "/" },
	{ label: "S'inscrire", to: "/inscription" },
	{ label: "Se connecter", to: "/login" },
] as const;

const NAV_CLIENT = [
	{ label: "Accueil", to: "/espace-client" },
	{ label: "Mon panier", to: "/espace-client/panier" },
	{ label: "Mes demandes", to: "/espace-client/mes-demandes" },
	{ label: "Mes abonnements", to: "/espace-client/abonnements" },
	{ label: "Mon compte", to: "/espace-client/mon-compte" },
] as const;

/** Liens « Nos services » de l'espace client (pages internes). */
const SERVICES_CLIENT = [
	{ label: "Restaurant", to: "/espace-client/restaurant" },
	{ label: "Boutique", to: "/espace-client/boutique" },
	{ label: "Pressing", to: "/espace-client/pressing" },
	{ label: "Salle de fête", to: "/espace-client/salle-fete" },
	{ label: "Résidence — séjours courts", to: "/espace-client/residence" },
] as const;

/**
 * Footer du site — `variant="public"` (landing : ancres + liens auth) ou
 * `variant="client"` (espace client : les liens mènent aux pages internes
 * correspondantes au lieu des ancres de la landing).
 */
export function SiteFooter({
	variant = "public",
}: {
	variant?: "public" | "client";
}) {
	const currentYear = new Date().getFullYear();
	const [legalOuvert, setLegalOuvert] = useState<
		"confidentialite" | "conditions" | null
	>(null);
	const estClient = variant === "client";

	return (
		<footer
			id="contact"
			className="scroll-mt-16 bg-sea-ink px-4 py-5 text-white sm:px-6 lg:px-8"
		>
			<div className="mx-auto max-w-7xl">
				<div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{/* Company info */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="h-8 w-auto object-contain brightness-0 invert"
							/>
							<span className="font-bold">GLOBAL SIM GROUP</span>
						</div>
						<p className="text-sm text-white/70">
							Résidence, restaurant, pressing, salle de fête et boutique — tous
							nos services depuis un seul compte.
						</p>
					</div>

					{/* Quick links */}
					<div className="space-y-2">
						<h3 className="font-semibold">Navigation</h3>
						<ul className="space-y-2 text-sm">
							{(estClient ? NAV_CLIENT : NAV_PUBLIC).map((lien) => (
								<li key={lien.label}>
									<Link to={lien.to} className={LIEN}>
										{lien.label}
									</Link>
								</li>
							))}
							{estClient ? null : (
								<li>
									<a href="#services" className={LIEN}>
										Services
									</a>
								</li>
							)}
						</ul>
					</div>

					{/* Services */}
					<div className="space-y-3">
						<h3 className="font-semibold">Nos services</h3>
						{estClient ? (
							<ul className="space-y-2 text-sm">
								{SERVICES_CLIENT.map((service) => (
									<li key={service.label}>
										<Link to={service.to} className={LIEN}>
											{service.label}
										</Link>
									</li>
								))}
							</ul>
						) : (
							<ul className="space-y-2 text-sm text-white/70">
								<li>
									<a
										href="#carte"
										className="transition-colors hover:text-white"
									>
										Restaurant
									</a>
								</li>
								<li>
									<a
										href="#boutique"
										className="transition-colors hover:text-white"
									>
										Boutique
									</a>
								</li>
								<li>Pressing</li>
								<li>Salle de fête</li>
								<li>Résidence — séjours courts</li>
							</ul>
						)}
					</div>

					{/* Contact */}
					<div className="space-y-3">
						<h3 className="font-semibold">Contact</h3>
						<div className="space-y-2 text-sm text-white/70">
							<p>
								Email :{" "}
								<a
									href="mailto:maitresim4@gmail.com"
									className="text-white transition-colors hover:text-lagoon"
								>
									maitresim4@gmail.com
								</a>
							</p>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-white/10 pt-4">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-white/70">
						<p>© {currentYear} GLOBAL SIM GROUP. Tous droits réservés.</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setLegalOuvert("confidentialite")}
								className="transition-colors hover:text-white"
							>
								Politique de confidentialité
							</button>
							<button
								type="button"
								onClick={() => setLegalOuvert("conditions")}
								className="transition-colors hover:text-white"
							>
								Conditions d'utilisation
							</button>
						</div>
					</div>
				</div>
			</div>

			<PolitiqueConfidentialiteDialog
				open={legalOuvert === "confidentialite"}
				onOpenChange={(open) => setLegalOuvert(open ? "confidentialite" : null)}
			/>
			<ConditionsUtilisationDialog
				open={legalOuvert === "conditions"}
				onOpenChange={(open) => setLegalOuvert(open ? "conditions" : null)}
			/>
		</footer>
	);
}
