import { Camera } from "lucide-react";
import { useState } from "react";

import { CameraCaptureDialog } from "#/components/camera-capture-dialog";
import { Button } from "#/components/ui/button";

/**
 * Bouton « Caméra » autonome : ouvre `CameraCaptureDialog` et renvoie le
 * fichier JPEG capturé à `onCapture`. À placer à côté d'un
 * `<input type="file">` pour offrir la prise de photo directe — webcam
 * (avant) sur PC, bascule avant/arrière sur téléphone.
 */
export function BoutonCamera({
	onCapture,
	disabled = false,
	label = "Caméra",
	titre,
	description,
	facingMode,
	iconeSeule = false,
	className = "rounded-full",
}: {
	/** Fichier JPEG produit par la capture (même contrat qu'un input file). */
	onCapture: (file: File) => void;
	disabled?: boolean;
	label?: string;
	/** Titre/description de la modale — adapter au contexte (photo de
	    profil, document, photo de problème…). */
	titre?: string;
	description?: string;
	/** Caméra initiale : "environment" pour documents/objets (défaut des
	    nouveaux usages), "user" pour portrait. Ignorée sur PC. */
	facingMode?: "user" | "environment";
	/** `true` = bouton icône compact (label en aria-label) pour les zones
	    exiguës comme les drop-zones d'upload. */
	iconeSeule?: boolean;
	className?: string;
}) {
	const [ouvert, setOuvert] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size={iconeSeule ? "icon-sm" : "sm"}
				disabled={disabled}
				className={className}
				onClick={() => setOuvert(true)}
				aria-label={iconeSeule ? label : undefined}
				title={iconeSeule ? label : undefined}
			>
				<Camera className="size-4" aria-hidden />
				{iconeSeule ? null : label}
			</Button>
			<CameraCaptureDialog
				open={ouvert}
				onOpenChange={setOuvert}
				onCapture={onCapture}
				titre={titre}
				description={description}
				facingMode={facingMode}
			/>
		</>
	);
}
