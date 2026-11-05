import { CameraOff, Loader2, ScanLine, SwitchCamera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

/** Cadence d'analyse de la vidéo en mode `BarcodeDetector` : ~4 détections/seconde, largement suffisant. */
const INTERVALLE_DETECTION_MS = 250;

/** Formats demandés en priorité ; si un navigateur les refuse tous, on retombe sur la détection par défaut. */
const FORMATS_PREFERES = [
	"ean_13",
	"ean_8",
	"code_128",
	"code_39",
	"qr_code",
	"upc_a",
	"upc_e",
	"itf",
	"codabar",
	"data_matrix",
];

/**
 * Le bouton caméra n'a de sens que si le navigateur peut ouvrir une caméra
 * (`getUserMedia` — contexte sécurisé HTTPS/localhost requis). Le décodage
 * passe par `BarcodeDetector` quand il existe (Chrome, Edge, Android
 * WebView), sinon par la librairie ZXing chargée à la demande.
 */
export function cameraDisponible(): boolean {
	return (
		typeof navigator !== "undefined" &&
		typeof navigator.mediaDevices?.getUserMedia === "function"
	);
}

interface CameraScanDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Traite le code décodé ; renvoie le libellé à afficher sous la vidéo (nom du produit ajouté, code lu…) ou `null`. */
	onCode: (code: string) => Promise<string | null>;
	/** Préfixe du message de confirmation (défaut « Ajouté » — ex. « Code lu » pour un champ à remplir). */
	libelleAjoute?: string;
	/** Texte d'aide sous le titre (défaut : enchaînement de plusieurs produits). */
	description?: string;
}

/**
 * Scan par caméra : flux vidéo (caméra arrière de préférence) décodé par
 * `BarcodeDetector` ou ZXing en repli. Le dialogue reste ouvert pour
 * enchaîner les produits — chaque code décodé suit le même chemin de
 * résolution que la douchette.
 */
export function CameraScanDialog({
	open,
	onOpenChange,
	onCode,
	libelleAjoute = "Ajouté",
	description = "Présentez le code-barres devant la caméra. Le dialogue reste ouvert pour enchaîner les produits.",
}: CameraScanDialogProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	// Code actuellement en vue : un même code n'ajoute qu'une ligne tant qu'il
	// reste devant la caméra — il doit disparaître du champ pour être relu
	// (comme un nouveau passage de douchette).
	const codeEnVue = useRef<string | null>(null);
	// `onCode` change d'identité à chaque rendu du parent (chaque produit
	// ajouté) — on le lira via ref pour ne pas relancer la caméra à chaque scan.
	const onCodeRef = useRef(onCode);
	onCodeRef.current = onCode;
	const [erreur, setErreur] = useState<string | null>(null);
	const [pret, setPret] = useState(false);
	const [dernierProduit, setDernierProduit] = useState<string | null>(null);
	// Caméra arrière de préférence (mode `ideal` — pas un blocage : un PC
	// fixe sans caméra arrière retombe sur sa seule caméra). Le bouton
	// « Caméra avant/arrière » permute la valeur.
	const [facing, setFacing] = useState<"environment" | "user">("environment");

	useEffect(() => {
		if (!open) return;
		let flux: MediaStream | null = null;
		let minuteur: ReturnType<typeof setInterval> | null = null;
		let controls: { stop(): void } | null = null;
		let annule = false;

		const voirCode = (code: string | null) => {
			if (!code) {
				codeEnVue.current = null;
				return;
			}
			if (code === codeEnVue.current) return;
			codeEnVue.current = code;
			void onCodeRef.current(code).then((libelle) => {
				if (libelle) setDernierProduit(libelle);
			});
		};

		const demarrer = async () => {
			try {
				flux = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: { ideal: facing } },
					audio: false,
				});
			} catch {
				setErreur(
					"Caméra inaccessible — autorisez l'accès à la caméra puis réessayez.",
				);
				return;
			}
			if (annule) {
				for (const piste of flux.getTracks()) piste.stop();
				return;
			}
			const video = videoRef.current;
			if (!video) return;
			video.srcObject = flux;
			await video.play();
			setPret(true);

			const Detecteur = window.BarcodeDetector;
			if (Detecteur) {
				let detecteur: BarcodeDetector;
				try {
					detecteur = new Detecteur({ formats: FORMATS_PREFERES });
				} catch {
					detecteur = new Detecteur();
				}
				minuteur = setInterval(() => {
					void (async () => {
						if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return;
						try {
							voirCode(
								(await detecteur.detect(video))[0]?.rawValue?.trim() ?? null,
							);
						} catch {
							/* image non décodable — l'intervalle suivant réessaiera */
						}
					})();
				}, INTERVALLE_DETECTION_MS);
			} else {
				const { BrowserMultiFormatReader } = await import("@zxing/browser");
				if (annule) return;
				const lecteur = new BrowserMultiFormatReader();
				controls = await lecteur.decodeFromVideoElement(video, (resultat) =>
					voirCode(resultat?.getText()?.trim() ?? null),
				);
			}
		};

		void demarrer();

		return () => {
			annule = true;
			if (minuteur) clearInterval(minuteur);
			controls?.stop();
			for (const piste of flux?.getTracks() ?? []) piste.stop();
			if (videoRef.current) videoRef.current.srcObject = null;
			setPret(false);
			setErreur(null);
			setDernierProduit(null);
			codeEnVue.current = null;
		};
	}, [open, facing]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Scanner par caméra</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="relative overflow-hidden rounded-md border bg-black">
					<video
						ref={videoRef}
						muted
						playsInline
						className="aspect-[4/3] w-full object-cover"
					/>
					<div
						className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-primary/80"
						aria-hidden
					/>
					{!pret && !erreur ? (
						<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
							<Loader2 className="size-6 animate-spin" aria-hidden />
						</div>
					) : null}
					{erreur ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-destructive-foreground">
							<CameraOff className="size-6" aria-hidden />
							<p>{erreur}</p>
						</div>
					) : null}
					{pret && !erreur ? (
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="absolute top-2 right-2 bg-background/80"
							aria-label={
								facing === "environment"
									? "Passer à la caméra avant"
									: "Passer à la caméra arrière"
							}
							title={
								facing === "environment"
									? "Caméra arrière — basculer en caméra avant"
									: "Caméra avant — basculer en caméra arrière"
							}
							onClick={() =>
								setFacing((valeur) =>
									valeur === "environment" ? "user" : "environment",
								)
							}
						>
							<SwitchCamera className="size-4" aria-hidden />
						</Button>
					) : null}
				</div>
				{dernierProduit ? (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<ScanLine className="size-4 text-primary" aria-hidden />
						{libelleAjoute} : {dernierProduit}
					</p>
				) : null}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Fermer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
