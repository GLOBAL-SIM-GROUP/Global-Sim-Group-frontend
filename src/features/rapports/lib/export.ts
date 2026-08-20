import { getApiClient } from "#/core/api";

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
 * Télécharge un rapport PDF via `GET ...&format=pdf` : le blob est récupéré
 * avec le même auth que le reste de l'app (backend).
 */
export async function telechargerPdf(
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
