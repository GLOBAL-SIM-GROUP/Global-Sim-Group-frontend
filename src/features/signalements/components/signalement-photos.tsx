import { Camera, Loader2, Trash2, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import type { SignalementPhoto } from "#/core/api/signalements";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { formatDateHeureISO } from "#/features/residence/models/format";

import {
	useSignalementPhotos,
	useSupprimerSignalementPhoto,
} from "../hooks/use-signalements";

interface SignalementPhotosProps {
	idSignalement: string;
	canDelete: boolean;
}

export function SignalementPhotos({
	idSignalement,
	canDelete,
}: SignalementPhotosProps) {
	const photosQuery = useSignalementPhotos(idSignalement);
	const supprimerMutation = useSupprimerSignalementPhoto();
	const [photoOuverte, setPhotoOuverte] = useState<SignalementPhoto | null>(
		null,
	);

	const photos = photosQuery.data ?? [];

	return (
		<section className="space-y-3">
			<h2 className="text-base font-semibold text-foreground">Photos</h2>
			{photosQuery.isLoading ? (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" aria-hidden />
					Chargement des photos…
				</div>
			) : photosQuery.isError ? (
				<p className="text-sm text-destructive">
					Impossible de charger les photos du signalement.
				</p>
			) : photos.length === 0 ? (
				<p className="text-sm text-muted-foreground">Aucune photo jointe.</p>
			) : (
				<div className="flex flex-wrap gap-3">
					{photos.map((photo) => (
						<PhotoThumbnail
							key={photo.id}
							photo={photo}
							canDelete={canDelete}
							isDeleting={
								supprimerMutation.isPending &&
								supprimerMutation.variables?.idPhoto === photo.id
							}
							onOpen={() => setPhotoOuverte(photo)}
							onDelete={() =>
								supprimerMutation.mutate({
									idSignalement,
									idPhoto: photo.id,
								})
							}
						/>
					))}
				</div>
			)}

			<PhotoViewer
				photo={photoOuverte}
				onOpenChange={(open) => {
					if (!open) setPhotoOuverte(null);
				}}
			/>
		</section>
	);
}

function PhotoThumbnail({
	photo,
	canDelete,
	isDeleting,
	onOpen,
	onDelete,
}: {
	photo: SignalementPhoto;
	canDelete: boolean;
	isDeleting: boolean;
	onOpen: () => void;
	onDelete: () => void;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(photo.cle_objet);

	return (
		<div className="relative overflow-hidden rounded-lg border border-border bg-muted">
			<button
				type="button"
				onClick={onOpen}
				className="block size-28"
				aria-label="Agrandir la photo"
			>
				{isLoading ? (
					<span className="flex h-full items-center justify-center text-xs text-muted-foreground">
						Chargement…
					</span>
				) : blobUrl ? (
					<img
						src={blobUrl}
						alt="Pièce jointe du signalement"
						className="h-full w-full object-cover"
					/>
				) : (
					<span className="flex h-full items-center justify-center text-muted-foreground">
						<Camera className="size-7" aria-hidden />
					</span>
				)}
			</button>
			{canDelete ? (
				<Button
					type="button"
					variant="destructive"
					size="icon-sm"
					disabled={isDeleting}
					onClick={onDelete}
					className="absolute top-1 right-1"
					title="Supprimer la photo"
				>
					{isDeleting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Trash2 className="size-4" aria-hidden />
					)}
					<span className="sr-only">Supprimer la photo</span>
				</Button>
			) : null}
		</div>
	);
}

function PhotoViewer({
	photo,
	onOpenChange,
}: {
	photo: SignalementPhoto | null;
	onOpenChange: (open: boolean) => void;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(photo?.cle_objet);

	return (
		<Dialog.Root open={photo !== null} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-4 shadow-lg">
					<div className="flex items-start justify-between gap-3">
						<div>
							<Dialog.Title className="text-base font-semibold text-foreground">
								Photo du signalement
							</Dialog.Title>
							<Dialog.Description className="text-sm text-muted-foreground">
								{photo ? formatDateHeureISO(photo.date_ajout) : ""}
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<Button variant="ghost" size="icon-sm">
								<X className="size-4" aria-hidden />
								<span className="sr-only">Fermer</span>
							</Button>
						</Dialog.Close>
					</div>
					<div className="mt-3 flex max-h-[75vh] items-center justify-center overflow-hidden rounded-md bg-muted">
						{isLoading ? (
							<p className="p-8 text-sm text-muted-foreground">Chargement…</p>
						) : blobUrl ? (
							<img
								src={blobUrl}
								alt="Pièce jointe agrandie"
								className="max-h-[75vh] w-full object-contain"
							/>
						) : (
							<p className="p-8 text-sm text-muted-foreground">
								Image indisponible.
							</p>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
