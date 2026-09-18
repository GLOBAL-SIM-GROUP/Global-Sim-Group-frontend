import { LegalDialog } from "./legal-dialog";

/**
 * Politique de confidentialité — modal publique ouverte depuis le footer.
 * Contenu générique volontaire : les mentions légales définitives
 * (dénomination sociale, hébergeur, délais de conservation précis) restent
 * à valider par GLOBAL SIM GROUP.
 */
export function PolitiqueConfidentialiteDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<LegalDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Politique de confidentialité"
			subtitle="Comment GLOBAL SIM GROUP collecte, utilise et protège vos données personnelles."
			sections={[
				{
					titre: "Données collectées",
					contenu: (
						<>
							<p>
								Lors de la création de votre compte et de l'utilisation de nos
								services (restaurant, pressing, salle de fête, boutique, séjours
								courts), nous collectons les informations nécessaires à leur
								fonctionnement : identité, coordonnées (email, téléphone), et
								historique de vos commandes et réservations.
							</p>
							<p>
								Des données techniques (session de connexion, signalements
								envoyés depuis votre espace) sont également enregistrées pour
								sécuriser le service et traiter vos demandes.
							</p>
						</>
					),
				},
				{
					titre: "Utilisation des données",
					contenu: (
						<p>
							Vos données servent exclusivement à gérer votre compte, traiter
							vos commandes, réservations et paiements, et vous informer du
							suivi de vos demandes. Elles ne sont ni vendues ni partagées avec
							des tiers à des fins commerciales.
						</p>
					),
				},
				{
					titre: "Conservation et sécurité",
					contenu: (
						<p>
							Les données sont conservées le temps nécessaire à la fourniture
							des services et aux obligations comptables et légales. L'accès à
							votre espace est protégé par un identifiant et un mot de passe ;
							les échanges avec nos serveurs sont chiffrés.
						</p>
					),
				},
				{
					titre: "Vos droits",
					contenu: (
						<p>
							Vous pouvez demander l'accès, la rectification ou la suppression
							de vos données personnelles, ainsi que la clôture de votre compte,
							en nous écrivant à{" "}
							<a
								href="mailto:maitresim4@gmail.com"
								className="font-medium text-lagoon hover:underline"
							>
								maitresim4@gmail.com
							</a>
							.
						</p>
					),
				},
				{
					titre: "Cookies",
					contenu: (
						<p>
							Le site utilise uniquement les éléments techniques nécessaires à
							votre session de connexion. Aucun cookie publicitaire ou de
							pistage tiers n'est déposé.
						</p>
					),
				},
			]}
		/>
	);
}
