/**
 * Génération PDF minimaliste côté client — même données que l'export CSV.
 *
 * Aucune dépendance : le PDF est assemblé à la main (une page, texte). Les
 * chaînes sont encodées en WinAnsi (Latin-1) pour que les accents français
 * s'affichent correctement. Fonction pure (`construirePdf`) → testable.
 */

/** Normaliations des caractères hors WinAnsi vers des substituts lisibles. */
const NORMALISATIONS: Record<string, string> = {
	"—": "-",
	"–": "-",
	"’": "'",
	"‘": "'",
	"…": "...",
	"€": "EUR",
	"°": " deg",
	"½": "1/2",
};

/** Octets d'une chaîne ASCII structurelle (keywords du PDF). */
function ascii(texte: string): number[] {
	return [...texte].map((caractere) => caractere.charCodeAt(0));
}

/**
 * Octets WinAnsi (Latin-1) d'un texte utilisateur, avec échappement des
 * parenthèses et des barres obliques inverses pour une chaîne PDF.
 */
function octetsTexte(texte: string): number[] {
	const octets: number[] = [];
	for (const caractere of texte) {
		if (caractere in NORMALISATIONS) {
			octets.push(...octetsTexte(NORMALISATIONS[caractere]));
			continue;
		}
		const code = caractere.codePointAt(0) ?? 0;
		if (code === 40 || code === 41 || code === 92) {
			octets.push(92, code);
		} else if (code <= 0xff) {
			octets.push(code);
		} else {
			octets.push(63); // « ? » pour les caractères hors WinAnsi
		}
	}
	return octets;
}

/** Coordonnées : 1 0 0 1 x y Tm. */
function position(x: number, y: number): number[] {
	return ascii(`1 0 0 1 ${x} ${y} Tm (`);
}

/**
 * Construit un PDF d'une page : titre en gras puis lignes de texte (cellules
 * jointes par des espaces). Retourne les octets bruts du fichier.
 */
export function construirePdf(
	lignes: readonly (readonly (string | number)[])[],
	titre: string,
): Uint8Array<ArrayBuffer> {
	const largeur = 612;
	const hauteur = 792;
	const marge = 50;
	const hauteurLigne = 15;

	// Flux de contenu de la page (objets 4 et 5 = polices Helvetica).
	const flux: number[] = [
		...ascii("BT /F2 14 Tf "),
		...position(marge, hauteur - marge),
		...octetsTexte(titre),
		...ascii(") Tj ET\n"),
	];
	let y = hauteur - marge - 30;
	for (const ligne of lignes) {
		if (y < marge) break;
		flux.push(
			...ascii("BT /F1 11 Tf "),
			...position(marge, y),
			...octetsTexte(ligne.map(String).join("   ")),
			...ascii(") Tj ET\n"),
		);
		y -= hauteurLigne;
	}

	const objets: { numero: number; corps: number[] }[] = [
		{ numero: 1, corps: ascii("<< /Type /Catalog /Pages 2 0 R >>") },
		{ numero: 2, corps: ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>") },
		{
			numero: 3,
			corps: ascii(
				`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${largeur} ${hauteur}] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>`,
			),
		},
		{
			numero: 4,
			corps: ascii(
				"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
			),
		},
		{
			numero: 5,
			corps: ascii(
				"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
			),
		},
		{
			numero: 6,
			corps: [
				...ascii(`<< /Length ${flux.length} >>\nstream\n`),
				...flux,
				...ascii("endstream"),
			],
		},
	];

	const sortie: number[] = [...ascii("%PDF-1.4\n")];
	const offsets: number[] = [0];
	for (const objet of objets) {
		offsets[objet.numero] = sortie.length;
		sortie.push(
			...ascii(`${objet.numero} 0 obj\n`),
			...objet.corps,
			...ascii("\nendobj\n"),
		);
	}
	const xrefPosition = sortie.length;
	const nbObjets = 7;
	sortie.push(...ascii(`xref\n0 ${nbObjets}\n0000000000 65535 f \n`));
	for (let index = 1; index < nbObjets; index += 1) {
		sortie.push(
			...ascii(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`),
		);
	}
	sortie.push(
		...ascii(
			`trailer\n<< /Size ${nbObjets} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF\n`,
		),
	);
	return Uint8Array.from(sortie);
}

/** Télécharge les octets d'un PDF dans un fichier local. */
export function telechargerPdf(
	octets: Uint8Array<ArrayBuffer>,
	nomFichier: string,
): void {
	const blob = new Blob([octets], { type: "application/pdf" });
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}
