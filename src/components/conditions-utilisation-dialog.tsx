import { LegalDialog } from "./legal-dialog";

/**
 * Conditions d'utilisation — modal publique ouverte depuis le footer.
 * Contenu cadre volontairement générique : les clauses définitives
 * (annulations, responsabilités, litiges) restent à valider par
 * GLOBAL SIM GROUP.
 */
export function ConditionsUtilisationDialog({
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
			title="Conditions d'utilisation"
			subtitle="Les règles qui encadrent l'utilisation de votre compte et de nos services."
			sections={[
				{
					titre: "Objet",
					contenu: (
						<p>
							La plateforme GLOBAL SIM GROUP permet de commander au restaurant,
							de déposer du linge au pressing, de réserver la salle de fête,
							d'acheter en boutique et de gérer des séjours courts en résidence,
							depuis un compte unique.
						</p>
					),
				},
				{
					titre: "Compte utilisateur",
					contenu: (
						<>
							<p>
								La création d'un compte est gratuite et nécessaire pour passer
								commande ou réserver. Vous êtes responsable de la
								confidentialité de vos identifiants et des actions réalisées
								depuis votre compte.
							</p>
							<p>
								Les informations fournies à l'inscription doivent être exactes.
								Tout usage frauduleux peut entraîner la suspension du compte.
							</p>
						</>
					),
				},
				{
					titre: "Commandes, réservations et paiements",
					contenu: (
						<p>
							Les commandes et réservations sont soumises à disponibilité et
							confirmées par nos équipes. Les prix affichés sont en francs CFA.
							Les modalités de paiement, d'annulation et de remboursement sont
							précisées lors de chaque opération ou auprès de la réception.
						</p>
					),
				},
				{
					titre: "Responsabilités",
					contenu: (
						<p>
							GLOBAL SIM GROUP met en œuvre les moyens raisonnables pour
							garantir la disponibilité et l'exactitude du service, sans pouvoir
							garantir une disponibilité ininterrompue. Nous ne saurions être
							tenus responsables des dommages indirects liés à l'utilisation de
							la plateforme.
						</p>
					),
				},
				{
					titre: "Contact",
					contenu: (
						<p>
							Pour toute question relative à ces conditions, écrivez-nous à{" "}
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
			]}
		/>
	);
}
