/**
 * Télécharge un texte (CSV) dans un fichier local. BOM UTF-8 pour une ouverture
 * correcte sous Excel.
 */
export function telechargerTexte(nomFichier: string, contenu: string): void {
	const blob = new Blob(["﻿" + contenu], {
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
