import { Loader2, UserRound } from "lucide-react";

import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { cn } from "#/lib/utils";

/**
 * Avatar du client (catégorie MinIO `client-photo`) — silhouette par défaut.
 * `compacte` : petite taille pour les lignes de tableau, sans spinner (le
 * visuel arrive quand le blob est chargé — éviter un loader par ligne).
 */
export function PhotoClientAvatar({
	cle,
	nom,
	compacte = false,
}: {
	cle: string | null;
	nom: string;
	compacte?: boolean;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(cle);

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
				compacte ? "size-9" : "size-16 sm:size-20",
			)}
		>
			{!compacte && isLoading ? (
				<Loader2
					className="size-5 animate-spin text-muted-foreground"
					aria-hidden
				/>
			) : blobUrl ? (
				<img src={blobUrl} alt={nom} className="size-full object-cover" />
			) : (
				<UserRound
					className={
						compacte
							? "size-4 text-muted-foreground"
							: "size-8 text-muted-foreground"
					}
					aria-hidden
				/>
			)}
		</div>
	);
}
