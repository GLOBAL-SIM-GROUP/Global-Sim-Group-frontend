import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "#/components/ui/button";

export function LandingContact() {
	return (
		<section id="contact" className="py-20 sm:py-32">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
							Nous contacter
						</h2>
						<p className="text-lg text-muted-foreground">
							Une question ? Nous sommes là pour vous aider
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
						<div className="text-center">
							<div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
								<Mail className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold text-foreground mb-2">Email</h3>
							<a
								href="mailto:contact@globalsimgroup.com"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								contact@globalsimgroup.com
							</a>
						</div>

						<div className="text-center">
							<div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
								<Phone className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold text-foreground mb-2">Téléphone</h3>
							<a
								href="tel:+237123456789"
								className="text-sm text-muted-foreground hover:text-primary transition-colors"
							>
								+237 (123) 456-789
							</a>
						</div>

						<div className="text-center">
							<div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
								<MapPin className="h-6 w-6 text-primary" />
							</div>
							<h3 className="font-semibold text-foreground mb-2">Localisation</h3>
							<p className="text-sm text-muted-foreground">
								Yaoundé, Cameroun
							</p>
						</div>
					</div>

					<div className="rounded-lg border border-border bg-card p-8">
						<h3 className="font-semibold text-foreground mb-4">Envoyez-nous un message</h3>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								alert("Merci pour votre message ! Nous vous répondrons bientôt.");
								e.currentTarget.reset();
							}}
							className="space-y-4"
						>
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
									Nom
								</label>
								<input
									id="name"
									type="text"
									placeholder="Votre nom"
									required
									className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
									Email
								</label>
								<input
									id="email"
									type="email"
									placeholder="votre@email.com"
									required
									className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>
							<div>
								<label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
									Message
								</label>
								<textarea
									id="message"
									placeholder="Votre message..."
									rows={4}
									required
									className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
								/>
							</div>
							<Button type="submit" className="w-full">
								Envoyer le message
							</Button>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
