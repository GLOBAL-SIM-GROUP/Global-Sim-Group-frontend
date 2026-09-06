/**
 * Impression directe d'un PDF, sans étape de téléchargement intermédiaire.
 *
 * `window.print()` imprime le document de la fenêtre COURANTE (la page HTML
 * de l'app), pas un PDF arbitraire — pour imprimer le contenu d'un blob PDF,
 * la technique standard est de le charger dans un `<iframe>` caché puis
 * d'appeler `print()` sur la fenêtre de CET iframe une fois chargé.
 */

/** Imprime un blob PDF (reçu backend, export, etc.). */
export function imprimerPdfBlob(blob: Blob): void {
	const url = URL.createObjectURL(blob);
	const iframe = document.createElement("iframe");
	iframe.style.cssText =
		"position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
	iframe.src = url;

	let nettoye = false;
	const nettoyer = () => {
		if (nettoye) return;
		nettoye = true;
		window.removeEventListener("focus", nettoyer);
		iframe.remove();
		URL.revokeObjectURL(url);
	};

	iframe.onload = () => {
		try {
			iframe.contentWindow?.focus();
			iframe.contentWindow?.print();
		} catch (error) {
			console.error("Erreur lors de l'impression du PDF", error);
		}
		// Le retour du focus sur la fenêtre principale est le signal le plus
		// fiable de fermeture de la boîte de dialogue d'impression (imprimé ou
		// annulé) — la plupart des navigateurs redonnent le focus à `window` à
		// ce moment-là. Filet de sécurité si l'événement ne se déclenche jamais
		// (ex. navigateur qui ne le supporte pas).
		window.addEventListener("focus", nettoyer, { once: true });
		setTimeout(nettoyer, 60_000);
	};

	document.body.appendChild(iframe);
}

/** Imprime des octets PDF générés côté client (voir `construirePdf`). */
export function imprimerPdfOctets(octets: Uint8Array<ArrayBuffer>): void {
	imprimerPdfBlob(new Blob([octets], { type: "application/pdf" }));
}

/**
 * Imprime un blob image (étiquette code-barres, etc.) — même mécanique que
 * `imprimerPdfBlob` : un navigateur affiche nativement une image chargée en
 * `src` d'iframe, `contentWindow.print()` fonctionne donc à l'identique.
 */
export function imprimerImageBlob(blob: Blob): void {
	imprimerPdfBlob(blob);
}

/** 96 DPI : conversion px → mm pour la mesure de hauteur d'un ticket. */
const PX_PAR_MM = 3.7795275591;

/**
 * Construit le document HTML complet d'un ticket thermique à partir du HTML
 * renvoyé par le backend (style + body extraits, largeur imposée). Fonction
 * pure réutilisée par `imprimerHtml` (boîte d'impression navigateur) ET par
 * l'impression QZ Tray (`qz-tray-client.ts`) — un seul endroit qui sait
 * comment mettre un ticket backend en forme pour du papier 58/80mm.
 */
export function construireDocumentTicket(
	html: string,
	largeurMm: 58 | 80,
): string {
	// Récupère le style et le contenu du body envoyés par le backend.
	const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	const style = styleMatch ? styleMatch[1] : "";
	const corps = bodyMatch ? bodyMatch[1] : html;

	return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style id="style-base">
html, body {
	margin: 0;
	padding: 0;
	width: ${largeurMm}mm;
	background: #fff;
	color: #000;
	font-family: 'Courier New', monospace;
	font-size: 9pt;
	-webkit-print-color-adjust: exact;
	print-color-adjust: exact;
}
</style>
<style>${style}</style>
</head>
<body>${corps}</body>
</html>`;
}

/**
 * Mesure la hauteur réelle (mm) d'un document de ticket en le chargeant dans
 * un iframe invisible et en lisant `scrollHeight` — un ticket thermique n'a
 * pas de hauteur de page fixe (rouleau continu), il faut donc la calculer à
 * partir du contenu réel plutôt que de deviner une valeur.
 */
export async function mesurerHauteurTicketMm(
	documentHtml: string,
): Promise<number> {
	const blob = new Blob([documentHtml], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	const iframe = document.createElement("iframe");
	iframe.style.cssText =
		"position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
	iframe.src = url;

	try {
		return await new Promise<number>((resolve, reject) => {
			iframe.onload = () => {
				(async () => {
					try {
						const doc = iframe.contentDocument;
						if (!doc) {
							resolve(0);
							return;
						}
						await doc.fonts?.ready;
						await new Promise((r) => requestAnimationFrame(r));
						const hauteurPx = Math.max(
							doc.body.scrollHeight,
							doc.documentElement.scrollHeight,
						);
						resolve(Math.ceil(hauteurPx / PX_PAR_MM));
					} catch (error) {
						reject(error);
					}
				})();
			};
			iframe.onerror = () =>
				reject(new Error("Échec du chargement du ticket pour mesure"));
			document.body.appendChild(iframe);
		});
	} finally {
		iframe.remove();
		URL.revokeObjectURL(url);
	}
}

/**
 * Imprime du HTML brut avec une largeur de page thermique fixe (58 ou 80mm)
 * via la boîte d'impression du navigateur.
 *
 * Charge le HTML dans un iframe caché, mesure la hauteur réelle du contenu
 * rendu, puis injecte `@page { size: <largeur>mm <hauteur>mm }` avec des
 * dimensions EXPLICITES. Chrome/Edge ignore `@page { size: 58mm auto }` (le
 * mot-clé `auto` n'est pas supporté et le navigateur retombe sur la taille
 * de papier système, ex. Lettre US) — mais il respecte les dimensions
 * explicites en mm, qui forcent la bonne taille dans la boîte d'impression.
 *
 * Cette technique ne corrige que l'aperçu/le PDF (« Enregistrer en PDF ») —
 * sur une imprimante thermique physique, la boîte Chrome reste soumise au
 * pilote (voir `docs/impression.md`). Pour un contournement total, voir
 * `imprimerTicketQZ` (`qz-tray-client.ts`), utilisée en priorité quand une
 * imprimante QZ Tray est configurée (`printFactureTicket`).
 */
export async function imprimerHtml(
	html: string,
	largeurMm: 58 | 80,
): Promise<void> {
	// Document de l'iframe. Le @page est injecté APRÈS mesure (voir onload)
	// car Chrome ignore `auto` en hauteur — il faut une valeur explicite.
	const documentHtml = construireDocumentTicket(html, largeurMm);

	// Blob URL plutôt que srcdoc : plus large compatibilité (Chrome/Edge/Firefox).
	const blob = new Blob([documentHtml], { type: "text/html" });
	const url = URL.createObjectURL(blob);

	const iframe = document.createElement("iframe");
	iframe.style.cssText =
		"position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
	iframe.src = url;

	let nettoye = false;
	const nettoyer = () => {
		if (nettoye) return;
		nettoye = true;
		window.removeEventListener("focus", nettoyer);
		iframe.remove();
		URL.revokeObjectURL(url);
	};

	iframe.onload = async () => {
		try {
			const doc = iframe.contentDocument;
			if (!doc) return;

			// Attend les polices pour une mesure de hauteur correcte.
			await doc.fonts?.ready;
			await new Promise((resolve) => requestAnimationFrame(resolve));

			// Mesure la hauteur réelle du contenu en px → mm.
			const hauteurPx = Math.max(
				doc.body.scrollHeight,
				doc.documentElement.scrollHeight,
			);
			const hauteurMm = Math.ceil(hauteurPx / PX_PAR_MM);

			// Injecte @page avec dimensions explicites — c'est ça que Chrome
			// respecte dans la boîte d'impression (le `auto` est ignoré).
			const pageStyle = doc.createElement("style");
			pageStyle.textContent = `@page { size: ${largeurMm}mm ${hauteurMm}mm; margin: 0; }`;
			doc.head.appendChild(pageStyle);

			iframe.contentWindow?.focus();
			iframe.contentWindow?.print();
		} catch (error) {
			console.error("Erreur lors de l'impression du ticket", error);
		}
		// Le retour du focus sur la fenêtre principale signale la fermeture
		// de la boîte d'impression (imprimé ou annulé). Filet de sécurité
		// si l'événement ne se déclenche jamais.
		window.addEventListener("focus", nettoyer, { once: true });
		setTimeout(nettoyer, 60_000);
	};

	document.body.appendChild(iframe);
}
