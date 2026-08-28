import { construirePdf, telechargerPdf } from "#/lib/pdf";

import {
	construireCsv,
	libelleMoisAnnee,
	type RecuEcheance,
	type RecuPaiement,
} from "../models/portail";

/** Télécharge un texte (CSV) dans un fichier local. BOM UTF-8 pour Excel. */
export function telechargerTexte(nomFichier: string, contenu: string): void {
	const blob = new Blob([`﻿${contenu}`], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}

/** Lignes d'un reçu d'échéance (base commune CSV/PDF). */
export function recuEcheanceEnLignes(
	recu: RecuEcheance,
): (string | number)[][] {
	return [
		["Type", recu.type],
		["Référence", recu.reference],
		["Date", recu.date],
		["Montant", recu.montant],
		["Mode de paiement", recu.mode_paiement],
		[],
		["Client", `${recu.client.prenoms} ${recu.client.nom}`],
		["Logement", recu.logement],
		["Période", libelleMoisAnnee(recu.echeance.mois, recu.echeance.annee)],
		["Numéro de contrat", recu.echeance.numero_contrat],
		["Statut", recu.echeance.statut],
	];
}

/** Lignes d'un reçu de paiement (base commune CSV/PDF). */
export function recuPaiementEnLignes(
	recu: RecuPaiement,
): (string | number)[][] {
	const lignes: (string | number)[][] = [
		["Type", recu.type],
		["Référence", recu.reference],
		["Date", recu.date],
		["Montant", recu.montant],
		["Mode de paiement", recu.mode_paiement],
		[],
		["Client", `${recu.client.prenoms} ${recu.client.nom}`],
	];
	if (recu.echeance) {
		lignes.push(
			["Période", libelleMoisAnnee(recu.echeance.mois, recu.echeance.annee)],
			["Numéro de contrat", recu.echeance.numero_contrat],
		);
	}
	if (recu.facture) {
		lignes.push(
			[],
			["Facture", recu.facture.numero],
			["Date facture", recu.facture.date],
			["Montant total", recu.facture.montant_total],
			["Montant payé", recu.facture.montant_paye],
			[],
			["Libellé", "Quantité", "Prix unitaire", "Total"],
			...recu.facture.lignes.map((ligne) => [
				ligne.libelle,
				ligne.quantite,
				ligne.prix_unitaire,
				ligne.total,
			]),
		);
	}
	return lignes;
}

/** CSV d'un reçu d'échéance. */
export function recuEcheanceEnCsv(recu: RecuEcheance): string {
	return construireCsv(recuEcheanceEnLignes(recu));
}

/** CSV d'un reçu de paiement. */
export function recuPaiementEnCsv(recu: RecuPaiement): string {
	return construireCsv(recuPaiementEnLignes(recu));
}

/** Télécharge le reçu d'une échéance en PDF (client-side). */
export function telechargerRecuEcheancePdf(recu: RecuEcheance): void {
	telechargerPdf(
		construirePdf(recuEcheanceEnLignes(recu), "Reçu de paiement"),
		`recu-echeance-${recu.reference}.pdf`,
	);
}

/** Télécharge le reçu d'un paiement en PDF (client-side). */
export function telechargerRecuPaiementPdf(recu: RecuPaiement): void {
	telechargerPdf(
		construirePdf(recuPaiementEnLignes(recu), "Reçu de paiement"),
		`recu-paiement-${recu.reference}.pdf`,
	);
}
