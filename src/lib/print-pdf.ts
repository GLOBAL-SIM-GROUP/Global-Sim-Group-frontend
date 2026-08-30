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
