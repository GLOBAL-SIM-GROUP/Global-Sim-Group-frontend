import { construirePdf, telechargerPdf } from "#/lib/pdf";
import type { RecuEcheance } from "../api/contrats";

/**
 * Génère un PDF de reçu d'échéance avec bilan de paiement.
 * Inclut : montant payé, reste à payer, statut.
 */
export function genererRecuEcheance(recu: RecuEcheance): void {
	const moisLibelle = new Intl.DateTimeFormat("fr-FR", {
		month: "long",
		year: "numeric",
	}).format(new Date(recu.annee, recu.mois - 1));

	const lignes: (string | number)[][] = [
		[""],
		["CONTRAT", recu.numero_contrat],
		["LOCATAIRE", `${recu.locataire_prenom} ${recu.locataire_nom}`],
		["LOGEMENT", recu.logement_numero],
		[""],
		["ECHÉANCE", moisLibelle],
		["Date d'échéance", recu.date_echeance],
		[""],
		["Montant écheance", recu.montant_echeance, "FCFA"],
		["Montant payé", recu.montant_paye, "FCFA"],
		["Statut", recu.statut],
		...(recu.date_paiement ? [["Date paiement", recu.date_paiement]] : []),
		[""],
		["--- BILAN ---", ""],
		["Total payé (contrat)", recu.montant_total_paye, "FCFA"],
		["Reste à payer", recu.montant_total_reste, "FCFA"],
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
		`recu-${recu.numero_contrat}-${recu.annee}-${String(recu.mois).padStart(2, "0")}.pdf`,
	);
}
