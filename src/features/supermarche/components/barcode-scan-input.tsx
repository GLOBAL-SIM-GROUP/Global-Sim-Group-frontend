import { Camera, Loader2, ScanLine } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { toApiError } from "#/core/api";
import { cn } from "#/lib/utils";

import { useScannerProduit } from "../hooks/use-produits";
import type { Produit } from "../models/produits";
import { CameraScanDialog, cameraDisponible } from "./camera-scan-dialog";

/** Délai anti-rebond : un même code renvoyé deux fois par la douchette en dessous de ce délai est ignoré. */
const DELAI_ANTI_REBOND_MS = 500;

interface BarcodeScanInputProps {
	/** Appelé quand le code scanné correspond à un produit. */
	onResolu: (produit: Produit) => void;
	/** Appelé sur un 404 (aucun produit pour ce code) — le parent décide de l'affichage (message, proposer une création…). */
	onIntrouvable?: (codeBarre: string) => void;
	label?: string;
	placeholder?: string;
	className?: string;
}

/**
 * Champ de scan réutilisable. Une douchette se comporte comme un clavier :
 * elle tape le code très vite puis envoie `Entrée`. On capte donc juste
 * `Entrée` sur un champ texte auto-focus, on résout via `GET
 * /market/produits/scan/:code_barre`, et on rend le focus au champ pour
 * enchaîner les scans sans reclic. Le bouton caméra ouvre
 * `CameraScanDialog` (API `BarcodeDetector` — masqué si le navigateur ne
 * l'expose pas) et le code décodé emprunte le même chemin de résolution.
 */
export function BarcodeScanInput({
	onResolu,
	onIntrouvable,
	label = "Scanner un code-barres",
	placeholder = "Scannez ou saisissez un code…",
	className,
}: BarcodeScanInputProps) {
	const inputId = useId();
	const [valeur, setValeur] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const dernierScan = useRef<{ code: string; ts: number } | null>(null);
	const mutation = useScannerProduit();
	const [cameraOuverte, setCameraOuverte] = useState(false);

	const resoudre = async (code: string): Promise<Produit | null> => {
		const maintenant = Date.now();
		if (
			dernierScan.current &&
			dernierScan.current.code === code &&
			maintenant - dernierScan.current.ts < DELAI_ANTI_REBOND_MS
		) {
			return null;
		}
		dernierScan.current = { code, ts: maintenant };
		setErreur(null);
		try {
			const produit = await mutation.mutateAsync(code);
			setValeur("");
			onResolu(produit);
			return produit;
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 404) {
				setValeur("");
				onIntrouvable?.(code);
			} else {
				setErreur(apiError.message || "Erreur lors de la résolution du scan.");
			}
			return null;
		} finally {
			inputRef.current?.focus();
		}
	};

	return (
		<div className={cn("space-y-2", className)}>
			{label ? <Label htmlFor={inputId}>{label}</Label> : null}
			<div className="flex items-start gap-2">
				<div className="relative flex-1">
					<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
						{mutation.isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<ScanLine className="size-4" aria-hidden />
						)}
					</span>
					<input
						ref={inputRef}
						id={inputId}
						type="text"
						placeholder={placeholder}
						autoComplete="off"
						// biome-ignore lint/a11y/noAutofocus: poste de scan dédié — la douchette doit pouvoir taper dès l'ouverture, sans clic préalable.
						autoFocus
						aria-invalid={erreur ? true : undefined}
						className={cn(
							"h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 pr-3 pl-9 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
							"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
							"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
						)}
						value={valeur}
						onChange={(event) => setValeur(event.target.value)}
						onKeyDown={(event) => {
							if (event.key !== "Enter") return;
							event.preventDefault();
							const code = valeur.trim();
							if (!code) return;
							void resoudre(code);
						}}
					/>
				</div>
				{cameraDisponible() ? (
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Scanner par caméra"
						title="Scanner par caméra"
						onClick={() => setCameraOuverte(true)}
					>
						<Camera className="size-4" aria-hidden />
					</Button>
				) : null}
			</div>
			{erreur ? <p className="text-sm text-destructive">{erreur}</p> : null}
			<CameraScanDialog
				open={cameraOuverte}
				onOpenChange={setCameraOuverte}
				onCode={resoudre}
			/>
		</div>
	);
}
