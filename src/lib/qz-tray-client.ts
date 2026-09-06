/**
 * Pont ESC/POS via QZ Tray — voir `docs/impression.md` section 3.B.
 *
 * QZ Tray est un agent local (à installer une fois par poste de caisse,
 * https://qz.io) qui parle directement au service d'impression du système
 * d'exploitation, en contournant TOTALEMENT la boîte de dialogue d'impression
 * du navigateur. C'est le seul moyen fiable de forcer la taille réelle du
 * papier (58/80mm) sur une imprimante thermique physique — `imprimerHtml`
 * (`print-pdf.ts`) ne peut corriger que l'aperçu/le PDF, jamais le pilote.
 *
 * Le HTML du ticket (identique à celui envoyé à `imprimerHtml`) est imprimé
 * tel quel via le mode `pixel`/`html` de QZ — pas de conversion en commandes
 * ESC/POS brutes : QZ rend le HTML lui-même et pousse le résultat au pilote
 * avec une taille de page imposée à son propre niveau (Java), qui n'est pas
 * soumise au bug Chrome/`@page` documenté dans `print-pdf.ts`.
 */
import qz from "qz-tray";

import { construireDocumentTicket, mesurerHauteurTicketMm } from "./print-pdf";

let securiteConfiguree = false;

/**
 * Mode non signé : à la première impression, QZ Tray affiche UNE FOIS une
 * boîte de confirmation locale sur le poste (« Autoriser ce site à
 * imprimer ? »), à cocher « Se souvenir de cette décision » pour ne plus la
 * revoir. La signature de certificat n'apporte rien ici : elle ne sert qu'à
 * supprimer cette confirmation manuelle pour un déploiement type kiosque —
 * pas nécessaire pour un parc de postes de caisse internes avec opérateur.
 */
function configurerSecurite(): void {
	if (securiteConfiguree) return;
	securiteConfiguree = true;
	qz.security.setCertificatePromise((resolve) => resolve());
	qz.security.setSignaturePromise(() => (resolve) => resolve());
}

/**
 * Connecte à l'agent QZ Tray local, en réutilisant la connexion existante si
 * déjà active. Résout `false` (pas une erreur) si l'agent n'est pas
 * installé/lancé sur ce poste — c'est une fonctionnalité absente sur cette
 * machine, pas une panne à signaler bruyamment.
 *
 * `host: "localhost"` : par défaut QZ essaie aussi `localhost.qz.io` (utile
 * pour un accès distant), ce qui double le nombre de ports testés et ralentit
 * beaucoup la détection « absent » sur un poste sans agent (chaque tentative
 * refusée attend la résolution DNS du second hôte). L'agent tournant toujours
 * en local sur un poste de caisse, cet hôte alternatif ne sert jamais ici.
 */
export async function qzDisponible(): Promise<boolean> {
	if (typeof window === "undefined") return false;
	configurerSecurite();
	if (qz.websocket.isActive()) return true;
	try {
		await qz.websocket.connect({ retries: 0, host: "localhost" });
		return true;
	} catch {
		return false;
	}
}

/**
 * État de l'agent + imprimantes système qu'il expose sur ce poste. Un seul
 * aller-retour : évite de se reconnecter séparément pour chaque besoin de
 * l'écran de paramètres (statut, puis liste).
 */
export async function qzEtatEtImprimantes(): Promise<{
	disponible: boolean;
	imprimantes: string[];
}> {
	const disponible = await qzDisponible();
	if (!disponible) return { disponible: false, imprimantes: [] };
	const resultat = await qz.printers.find();
	return {
		disponible: true,
		imprimantes: Array.isArray(resultat) ? resultat : [resultat],
	};
}

/**
 * Imprime un ticket (HTML backend) directement sur une imprimante système via
 * QZ Tray, largeur physique imposée par la config QZ (niveau Java, pas CSS).
 * Lève une erreur si QZ Tray n'est pas disponible — à l'appelant de retomber
 * sur `imprimerHtml` (voir `printFactureTicket`).
 */
export async function imprimerTicketQZ(
	html: string,
	largeurMm: 58 | 80,
	nomImprimante: string,
): Promise<void> {
	const disponible = await qzDisponible();
	if (!disponible) {
		throw new Error("QZ Tray n'est pas disponible sur ce poste.");
	}

	const documentHtml = construireDocumentTicket(html, largeurMm);
	const hauteurMm = await mesurerHauteurTicketMm(documentHtml);

	const config = qz.configs.create(nomImprimante, {
		size: { width: largeurMm, height: hauteurMm },
		units: "mm",
		margins: 0,
		scaleContent: true,
	});

	await qz.print(config, [
		{
			type: "pixel",
			format: "html",
			data: documentHtml,
			options: { pageWidth: largeurMm, pageHeight: hauteurMm },
		},
	]);
}
