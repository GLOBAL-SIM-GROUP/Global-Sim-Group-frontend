/**
 * Télécharge un blob en fichier local (ancre temporaire + object URL).
 * Factorise le pattern répété dans les exports/reçus PDF.
 */
export function telechargerBlob(blob: Blob, nomFichier: string): void {
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}
