import { Camera, ImageOff, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateHeureISO,
	formatDateISO,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { getPortailEtatDesLieuxPhoto } from "../api/portail";
import { usePortailEtatDesLieux } from "../hooks/use-portail";
import {
	ETAT_DES_LIEUX_TYPE_BADGE,
	ETAT_DES_LIEUX_TYPE_LABELS,
	type PortailEtatDesLieuxPhoto,
} from "../models/portail";

/**
 * Page « Mes états des lieux » (portail résident) : liste en lecture seule
 * des photos de tous les contrats du résident (GET /portail/etat-des-lieux).
 * L'image n'est chargée qu'à l'ouverture (GET .../{id}/photo, à la demande).
 */
export function PortailEtatDesLieuxPage() {
	const photosQuery = usePortailEtatDesLieux();
	const [photoOuverte, setPhotoOuverte] =
		useState<PortailEtatDesLieuxPhoto | null>(null);

	if (photosQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (photosQuery.isError) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Mes états des lieux
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos états des lieux.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void photosQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const photos = photosQuery.data ?? [];

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Mes états des lieux" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Mes états des lieux
				</h1>
				<p className="text-muted-foreground">
					Photos d'entrée et de sortie de vos logements.
				</p>
			</section>

			{photos.length === 0 ? (
				<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Aucune photo d'état des lieux disponible.
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{photos.map((photo) => (
						<div
							key={photo.id}
							className="space-y-2 rounded-lg border border-border bg-card p-4 shadow-sm"
						>
							<div className="flex items-center justify-between gap-2">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										ETAT_DES_LIEUX_TYPE_BADGE[
											photo.type as "ENTREE" | "SORTIE"
										] ?? "bg-[#95A5A6] text-white",
									)}
								>
									{ETAT_DES_LIEUX_TYPE_LABELS[
										photo.type as "ENTREE" | "SORTIE"
									] ?? photo.type}
								</span>
								<span className="text-xs text-muted-foreground">
									{formatDateISO(photo.date_ajout)}
								</span>
							</div>
							<p className="text-sm font-medium text-foreground">
								{photo.piece ?? "Pièce non précisée"}
							</p>
							<p className="text-xs text-muted-foreground">
								Contrat {photo.numero_contrat}
							</p>
							{photo.commentaire ? (
								<p className="line-clamp-2 text-xs text-muted-foreground">
									{photo.commentaire}
								</p>
							) : null}
							<Button
								variant="outline"
								size="sm"
								className="w-full"
								onClick={() => setPhotoOuverte(photo)}
							>
								<Camera className="size-4" aria-hidden />
								Voir la photo
							</Button>
						</div>
					))}
				</div>
			)}

			<PhotoViewerDialog
				photo={photoOuverte}
				onOpenChange={(ouvert) => {
					if (!ouvert) setPhotoOuverte(null);
				}}
			/>
		</div>
	);
}

/** Aperçu en grand : charge l'image à l'ouverture uniquement (route dédiée). */
function PhotoViewerDialog({
	photo,
	onOpenChange,
}: {
	photo: PortailEtatDesLieuxPhoto | null;
	onOpenChange: (open: boolean) => void;
}) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [erreur, setErreur] = useState(false);

	useEffect(() => {
		if (!photo) {
			setBlobUrl(null);
			setErreur(false);
			return;
		}

		let annule = false;
		setIsLoading(true);
		setErreur(false);

		getPortailEtatDesLieuxPhoto(photo.id)
			.then((blob) => {
				if (annule) return;
				setBlobUrl(URL.createObjectURL(blob));
			})
			.catch(() => {
				if (!annule) setErreur(true);
			})
			.finally(() => {
				if (!annule) setIsLoading(false);
			});

		return () => {
			annule = true;
		};
	}, [photo]);

	useEffect(() => {
		return () => {
			if (blobUrl) URL.revokeObjectURL(blobUrl);
		};
	}, [blobUrl]);

	return (
		<Dialog.Root open={photo !== null} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-4 shadow-lg">
					<div className="flex items-start justify-between gap-3">
						<Dialog.Title className="text-base font-semibold text-foreground">
							{photo?.piece ?? "Photo d'état des lieux"}
						</Dialog.Title>
						<Dialog.Close asChild>
							<Button variant="ghost" size="icon-sm">
								<X className="size-4" aria-hidden />
								<span className="sr-only">Fermer</span>
							</Button>
						</Dialog.Close>
					</div>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{photo ? formatDateHeureISO(photo.date_ajout) : ""}
						{photo?.commentaire ? ` — ${photo.commentaire}` : ""}
					</Dialog.Description>
					<div className="mt-3 flex max-h-[70vh] items-center justify-center overflow-hidden rounded-md bg-muted">
						{isLoading ? (
							<p className="p-8 text-sm text-muted-foreground">Chargement…</p>
						) : erreur ? (
							<div className="flex flex-col items-center gap-2 p-8 text-sm text-muted-foreground">
								<ImageOff className="size-8" aria-hidden />
								Image indisponible.
							</div>
						) : blobUrl ? (
							<img
								src={blobUrl}
								alt={photo?.piece ?? "Photo d'état des lieux"}
								className="max-h-[70vh] w-full object-contain"
							/>
						) : null}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
