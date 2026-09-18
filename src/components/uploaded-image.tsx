import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { useAuth } from "#/core/auth";
import { cn } from "#/lib/utils";

interface UploadedImageProps {
	/** Clé MinIO (champ `image_url` des DTO — pas une URL directe). */
	imageKey: string | null | undefined;
	alt: string;
	className?: string;
}

/**
 * Affiche une image stockée dans MinIO : résout la clé via
 * GET /api/v1/uploads?key=... (JWT requis) puis crée une blob URL.
 * Sans session ou si le fichier est absent, un placeholder est rendu.
 */
export function UploadedImage({
	imageKey,
	alt,
	className,
}: UploadedImageProps) {
	// GET /uploads exige un JWT : inutile d'interroger l'API pour un visiteur
	// anonyme (landing publique) — le placeholder est rendu directement.
	const { isAuthenticated } = useAuth();
	const { blobUrl, isLoading } = useUploadBlobUrl(
		isAuthenticated ? imageKey : null,
	);

	return (
		<div
			className={cn("relative h-48 w-full overflow-hidden bg-muted", className)}
		>
			{isLoading ? (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sea-ink/10 to-lagoon/10">
					<Loader2
						className="size-5 animate-spin text-muted-foreground"
						aria-hidden
					/>
				</div>
			) : blobUrl ? (
				<img src={blobUrl} alt={alt} className="h-full w-full object-cover" />
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sea-ink/10 to-lagoon/10">
					<ImageIcon className="size-12 text-muted-foreground/50" aria-hidden />
				</div>
			)}
		</div>
	);
}
