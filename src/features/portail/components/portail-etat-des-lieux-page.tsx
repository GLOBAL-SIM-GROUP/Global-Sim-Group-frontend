import { Camera, ImageOff, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	formatDateHeureUTC,
	formatDateISO,
} from "#/features/residence/models/format";

import { getPortailEtatDesLieuxPhoto } from "../api/portail";
import { usePortailEtatDesLieux } from "../hooks/use-portail";
import {
	ETAT_DES_LIEUX_TYPE_LABELS,
	etatDesLieuxTypeVariant,
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
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (photosQuery.isError) {
		return (
			<div className="w-full space-y-3 p-6">
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
						className="rounded-full"
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Mes états des lieux" },
				]}
				title="Mes états des lieux"
				description="Photos d'entrée et de sortie de vos logements."
			/>

			{photos.length === 0 ? (
				<EmptyState title="Aucune photo d'état des lieux disponible." />
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{photos.map((photo) => (
						<div
							key={photo.id}
							className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
						>
							<div className="flex items-center justify-between gap-2">
								<Badge variant={etatDesLieuxTypeVariant(photo.type)}>
									{ETAT_DES_LIEUX_TYPE_LABELS[
										photo.type as "ENTREE" | "SORTIE"
									] ?? photo.type}
								</Badge>
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
								className="w-full rounded-full"
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
		<Dialog open={photo !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<div className="flex items-start justify-between gap-3">
					<DialogTitle>{photo?.piece ?? "Photo d'état des lieux"}</DialogTitle>
					<DialogClose asChild>
						<Button variant="ghost" size="icon-sm">
							<X className="size-4" aria-hidden />
							<span className="sr-only">Fermer</span>
						</Button>
					</DialogClose>
				</div>
				<DialogDescription>
					{photo ? formatDateHeureUTC(photo.date_ajout) : ""}
					{photo?.commentaire ? ` — ${photo.commentaire}` : ""}
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
	);
}
