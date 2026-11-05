import { CameraOff, Loader2, ScanLine } from "lucide-react";
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

import type { Produit } from "../models/produits";

/** Cadence d'analyse de la vidéo : ~4 détections/seconde, largement suffisant. */
const INTERVALLE_DETECTION_MS = 250;
/** Délai avant de re-accepter le MÊME code (la caméra relit en continu — sinon chaque image ajouterait une ligne). */
const DELAI_MEME_CODE_MS = 2000;

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
 * Le scan caméra n'est possible que si le navigateur expose `BarcodeDetector`
 * (Chrome, Edge, Android WebView — pas Firefox/Safari) et une caméra en
 * contexte sécurisé (HTTPS ou localhost).
 */
export function cameraDisponible(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof window.BarcodeDetector === "function" &&
		typeof navigator.mediaDevices?.getUserMedia === "function"
	);
}

interface CameraScanDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Résout le code décodé (même chemin que la douchette) ; renvoie le produit ajouté pour l'afficher. */
	onCode: (code: string) => Promise<Produit | null>;
}

/**
 * Scan par caméra : flux vidéo (caméra arrière de préférence) analysé par
 * `BarcodeDetector`. Le dialogue reste ouvert pour enchaîner les produits —
 * chaque code décodé suit le même chemin de résolution que la douchette.
 */
export function CameraScanDialog({
	open,
	onOpenChange,
	onCode,
}: CameraScanDialogProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const dernierCode = useRef<{ code: string; ts: number } | null>(null);
	// `onCode` change d'identité à chaque rendu du parent (chaque produit
	// ajouté) — on le lira via ref pour ne pas relancer la caméra à chaque scan.
	const onCodeRef = useRef(onCode);
	onCodeRef.current = onCode;
	const [erreur, setErreur] = useState<string | null>(null);
	const [pret, setPret] = useState(false);
	const [dernierProduit, setDernierProduit] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		let flux: MediaStream | null = null;
		let minuteur: ReturnType<typeof setInterval> | null = null;
		let annule = false;

		const demarrer = async () => {
			const Detecteur = window.BarcodeDetector;
			if (!Detecteur) {
				setErreur("Ce navigateur ne peut pas décoder les codes-barres.");
				return;
			}
			try {
				flux = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
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

			let detecteur: BarcodeDetector;
			try {
				detecteur = new Detecteur({ formats: FORMATS_PREFERES });
			} catch {
				detecteur = new Detecteur();
			}

			minuteur = setInterval(() => {
				void (async () => {
					if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return;
					let trouves: DetectedBarcode[];
					try {
						trouves = await detecteur.detect(video);
					} catch {
						return;
					}
					const code = trouves[0]?.rawValue?.trim();
					if (!code) return;
					const maintenant = Date.now();
					if (
						dernierCode.current &&
						dernierCode.current.code === code &&
						maintenant - dernierCode.current.ts < DELAI_MEME_CODE_MS
					) {
						return;
					}
					dernierCode.current = { code, ts: maintenant };
					const produit = await onCodeRef.current(code);
					if (produit) setDernierProduit(produit.nom);
				})();
			}, INTERVALLE_DETECTION_MS);
		};

		void demarrer();

		return () => {
			annule = true;
			if (minuteur) clearInterval(minuteur);
			for (const piste of flux?.getTracks() ?? []) piste.stop();
			if (videoRef.current) videoRef.current.srcObject = null;
			setPret(false);
			setErreur(null);
			setDernierProduit(null);
			dernierCode.current = null;
		};
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Scanner par caméra</DialogTitle>
					<DialogDescription>
						Présentez le code-barres devant la caméra. Le dialogue reste ouvert
						pour enchaîner les produits.
					</DialogDescription>
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
				</div>
				{dernierProduit ? (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<ScanLine className="size-4 text-primary" aria-hidden />
						Ajouté : {dernierProduit}
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
