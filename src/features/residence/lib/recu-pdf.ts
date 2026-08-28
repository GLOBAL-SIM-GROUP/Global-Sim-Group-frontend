import { construirePdf, telechargerPdf } from "#/lib/pdf";
import type { RecuEcheance } from "../api/contrats";

/**
 * Génère un PDF de reçu d'échéance.
 * Inclut : montant payé, mode de paiement, statut, date de paiement.
 */
export function genererRecuEcheance(recu: RecuEcheance): void {
	const moisLibelle = new Intl.DateTimeFormat("fr-FR", {
		month: "long",
		year: "numeric",
	}).format(new Date(recu.echeance.annee, recu.echeance.mois - 1));

	const lignes: (string | number)[][] = [
		[""],
		["CONTRAT", recu.echeance.numero_contrat],
		["LOCATAIRE", `${recu.client.prenoms} ${recu.client.nom}`],
		["LOGEMENT", recu.logement],
		[""],
		["ECHÉANCE", moisLibelle],
		["Date d'échéance", recu.echeance.date_echeance],
		[""],
		["Type de paiement", recu.type],
		["Mode de paiement", recu.mode_paiement],
		["Montant écheance", recu.echeance.montant, "FCFA"],
		["Montant payé", recu.montant, "FCFA"],
		["Statut", recu.echeance.statut],
		["Date paiement", recu.date],
		[""],
		["Référence", recu.reference],
		[""],
		[
			"Date génération",
			new Date().toLocaleDateString("fr-FR", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}),
		],
	];

	const pdf = construirePdf(lignes, "REÇU D'ÉCHÉANCE DE LOYER");
	telechargerPdf(
		pdf,
		`recu-${recu.echeance.numero_contrat}-${recu.echeance.annee}-${String(recu.echeance.mois).padStart(2, "0")}.pdf`,
	);
}
