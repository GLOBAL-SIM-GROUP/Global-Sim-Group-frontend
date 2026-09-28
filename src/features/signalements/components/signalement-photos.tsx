import { Camera, Loader2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import type { SignalementPhoto } from "#/core/api/signalements";
import { formatDateHeureUTC } from "#/features/residence/models/format";

import {
	useSignalementPhotoBlobUrl,
	useSignalementPhotos,
} from "../hooks/use-signalements";

interface SignalementPhotosProps {
	idSignalement: string;
}

export function SignalementPhotos({ idSignalement }: SignalementPhotosProps) {
	const photosQuery = useSignalementPhotos(idSignalement);
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
							onOpen={() => setPhotoOuverte(photo)}
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
	onOpen,
}: {
	photo: SignalementPhoto;
	onOpen: () => void;
}) {
	const { blobUrl, isLoading } = useSignalementPhotoBlobUrl(photo.id);

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
	const { blobUrl, isLoading } = useSignalementPhotoBlobUrl(photo?.id);

	return (
		<Dialog open={photo !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl">
				<div className="flex items-start justify-between gap-3">
					<div>
						<DialogTitle>Photo du signalement</DialogTitle>
						<DialogDescription>
							{photo ? formatDateHeureUTC(photo.date_ajout) : ""}
						</DialogDescription>
					</div>
					<DialogClose asChild>
						<Button variant="ghost" size="icon-sm">
							<X className="size-4" aria-hidden />
							<span className="sr-only">Fermer</span>
						</Button>
					</DialogClose>
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
			</DialogContent>
		</Dialog>
	);
}
