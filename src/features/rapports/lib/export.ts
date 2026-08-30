import { getApiClient } from "#/core/api";
import { imprimerPdfBlob } from "#/lib/print-pdf";

/**
 * Télécharge un texte (CSV) dans un fichier local. BOM UTF-8 pour une ouverture
 * correcte sous Excel.
 */
export function telechargerTexte(nomFichier: string, contenu: string): void {
	const blob = new Blob([`﻿${contenu}`], {
		type: "text/csv;charset=utf-8;",
	});
	telechargerBlob(blob, nomFichier);
}

/**
 * Imprime un rapport PDF via `GET ...&format=pdf` : le blob est récupéré
 * avec le même auth que le reste de l'app (backend).
 */
export async function imprimerPdf(chemin: string): Promise<void> {
	const blob = await getApiClient().download(chemin);
	imprimerPdfBlob(blob);
}

/**
 * Télécharge un rapport Excel via `GET ...&format=xlsx` : le blob est récupéré
 * avec le même auth que le reste de l'app (backend).
 */
export async function telechargerExcel(
	chemin: string,
	nomFichier: string,
): Promise<void> {
	const blob = await getApiClient().download(chemin);
	telechargerBlob(blob, nomFichier);
}

function telechargerBlob(blob: Blob, nomFichier: string): void {
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}
