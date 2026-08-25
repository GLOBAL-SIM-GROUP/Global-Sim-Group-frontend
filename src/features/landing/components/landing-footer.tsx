import { Link } from "@tanstack/react-router";

export function LandingFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-sea-ink text-white py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
					{/* Company info */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<img
								src="/logo.png"
								alt="GLOBAL SIM GROUP"
								className="h-8 w-auto object-contain brightness-0 invert"
							/>
							<span className="font-bold">GLOBAL SIM GROUP</span>
						</div>
						<p className="text-sm text-white/70">
							Une plateforme complète pour gérer tous vos services en un seul endroit.
						</p>
					</div>

					{/* Quick links */}
					<div className="space-y-4">
						<h3 className="font-semibold">Navigation</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/"
									className="text-white/70 hover:text-white transition-colors"
								>
									Accueil
								</Link>
							</li>
							<li>
								<a
									href="#services"
									className="text-white/70 hover:text-white transition-colors"
								>
									Services
								</a>
							</li>
						</ul>
					</div>

					{/* Services */}
					<div className="space-y-4">
						<h3 className="font-semibold">Services</h3>
						<ul className="space-y-2 text-sm text-white/70">
							<li>Résidence</li>
							<li>Boutique</li>
							<li>Restaurant</li>
							<li>Finances</li>
						</ul>
					</div>

					{/* Contact */}
					<div className="space-y-4">
						<h3 className="font-semibold">Contact</h3>
						<div className="space-y-2 text-sm text-white/70">
							<p>
								Email:{" "}
								<a
									href="mailto:support@global-sim-group.com"
									className="text-white hover:text-lagoon transition-colors"
								>
									support@global-sim-group.com
								</a>
							</p>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-white/10 pt-8">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/70">
						<p>© {currentYear} GLOBAL SIM GROUP. Tous droits réservés.</p>
						<div className="flex gap-6">
							<a href="#" className="hover:text-white transition-colors">
								Politique de confidentialité
							</a>
							<a href="#" className="hover:text-white transition-colors">
								Conditions d'utilisation
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
