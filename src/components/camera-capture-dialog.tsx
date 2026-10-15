import { Camera, Loader2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

type Phase = "demarrage" | "pret" | "apercu" | "erreur";

/**
 * Modale de capture photo via la caméra de l'appareil (`getUserMedia`) —
 * webcam sur PC, caméra frontale (`facingMode: "user"`) sur téléphone.
 *
 * Flux : ouverture → flux vidéo en direct → « Capturer » → aperçu →
 * « Utiliser cette photo » appelle `onCapture(file)` (JPEG, 90 %).
 * Le flux est arrêté dès que la modale se ferme ou qu'un aperçu est pris.
 *
 * Nécessite un contexte sécurisé (HTTPS ou localhost) — sinon
 * `navigator.mediaDevices` est absent et un message d'erreur s'affiche.
 */
export function CameraCaptureDialog({
	open,
	onOpenChange,
	onCapture,
	titre = "Prendre une photo",
	description = "Cadrez puis capturez. La photo sera associée au dossier.",
	facingMode = "user",
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Fichier JPEG produit par la capture. */
	onCapture: (file: File) => void;
	titre?: string;
	description?: string;
	/** "user" = caméra frontale/portrait (défaut) ; "environment" = caméra
	    arrière (documents, pièce d'identité…). */
	facingMode?: "user" | "environment";
}) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const ouvertRef = useRef(false);
	const [phase, setPhase] = useState<Phase>("demarrage");
	const [erreur, setErreur] = useState<string | null>(null);
	const [apercuUrl, setApercuUrl] = useState<string | null>(null);
	const fichierRef = useRef<File | null>(null);

	const arreterFlux = useCallback(() => {
		for (const track of streamRef.current?.getTracks() ?? []) {
			track.stop();
		}
		streamRef.current = null;
	}, []);

	const demarrer = useCallback(async () => {
		setPhase("demarrage");
		setErreur(null);
		setApercuUrl(null);
		fichierRef.current = null;
		if (!navigator.mediaDevices?.getUserMedia) {
			setErreur(
				"Caméra indisponible : cette fonction nécessite HTTPS (ou localhost).",
			);
			setPhase("erreur");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode, width: { ideal: 1280 } },
				audio: false,
			});
			// La modale peut s'être fermée pendant l'attente de la permission :
			// couper le flux tout de suite sinon la caméra reste allumée.
			if (!ouvertRef.current) {
				for (const track of stream.getTracks()) track.stop();
				return;
			}
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}
			setPhase("pret");
		} catch (e) {
			const nom = e instanceof DOMException ? e.name : "";
			setErreur(
				nom === "NotAllowedError"
					? "Accès à la caméra refusé — autorisez-la dans le navigateur puis réessayez."
					: nom === "NotFoundError" || nom === "OverconstrainedError"
						? "Aucune caméra détectée sur cet appareil."
						: "Impossible d'ouvrir la caméra.",
			);
			setPhase("erreur");
		}
	}, [facingMode]);

	useEffect(() => {
		ouvertRef.current = open;
		if (!open) return;
		void demarrer();
		return () => arreterFlux();
	}, [open, demarrer, arreterFlux]);

	useEffect(() => {
		if (!open && apercuUrl) {
			URL.revokeObjectURL(apercuUrl);
			setApercuUrl(null);
		}
	}, [open, apercuUrl]);

	const capturer = () => {
		const video = videoRef.current;
		if (!video?.videoWidth) return;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas
			.getContext("2d")
			?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				fichierRef.current = new File(
					[blob],
					`photo-camera-${Date.now()}.jpg`,
					{ type: "image/jpeg" },
				);
				setApercuUrl(URL.createObjectURL(blob));
				arreterFlux();
				setPhase("apercu");
			},
			"image/jpeg",
			0.9,
		);
	};

	const utiliser = () => {
		if (!fichierRef.current) return;
		onCapture(fichierRef.current);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{titre}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<div className="flex min-h-48 items-center justify-center overflow-hidden rounded-md bg-muted/40">
					{/* La vidéo reste toujours montée : `videoRef` doit exister quand
					    `demarrer()` attache le flux, y compris via « Reprendre »
					    depuis l'aperçu (où la vidéo est cachée). */}
					<video
						ref={videoRef}
						muted
						playsInline
						className={
							phase === "pret" ? "max-h-72 w-full object-contain" : "hidden"
						}
					/>
					{phase === "demarrage" && (
						<div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
							<Loader2 className="size-6 animate-spin" aria-hidden />
							<span className="text-xs">Ouverture de la caméra…</span>
						</div>
					)}
					{phase === "erreur" && (
						<p className="px-6 py-10 text-center text-sm text-destructive">
							{erreur}
						</p>
					)}
					{phase === "apercu" && apercuUrl && (
						<img
							src={apercuUrl}
							alt="Aperçu de la capture"
							className="max-h-72 w-full object-contain"
						/>
					)}
				</div>

				<DialogFooter>
					{phase === "pret" && (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="button" onClick={capturer}>
								<Camera className="size-4" aria-hidden />
								Capturer
							</Button>
						</>
					)}
					{phase === "apercu" && (
						<>
							<Button
								type="button"
								variant="outline"
								onClick={() => void demarrer()}
							>
								<RefreshCcw className="size-4" aria-hidden />
								Reprendre
							</Button>
							<Button type="button" onClick={utiliser}>
								Utiliser cette photo
							</Button>
						</>
					)}
					{phase === "erreur" && (
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Fermer
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
