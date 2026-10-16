import { Link } from "@tanstack/react-router";
import { Camera, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { BoutonCamera } from "#/components/bouton-camera";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { PageHeader } from "#/components/ui/page-header";
import { toApiError } from "#/core/api";
import type { SignalementPhoto } from "#/core/api/signalements";
import { formatDateHeureUTC } from "#/features/residence/models/format";
import { useSignalementPhotoBlobUrl } from "#/features/signalements/hooks/use-signalements";
import {
	PHOTO_TYPES_MIME,
	SIGNALEMENT_STATUT_LABELS,
	SIGNALEMENT_STATUT_VARIANT,
	validerPhotosSignalement,
} from "#/features/signalements/models/signalements";

import {
	useSignalementPortail,
	useSupprimerPhotoSignalementPortail,
	useUploaderPhotoSignalementPortail,
} from "../hooks/use-signalements";
import { libelleCiblePortail } from "../models/signalements";

interface SignalementDetailPageProps {
	id: string;
	/** Route liste pour le lien « Retour » et le fil d'Ariane. */
	lienListe: string;
	/** Libellé du lien retour (ex. « Retour à mes demandes »). */
	labelRetour: string;
	/** Fil d'Ariane : libellé racine + destination. */
	breadcrumbAccueil: { label: string; to: string };
	/** Classes du conteneur (le portail résident ajoute `p-6`). */
	className?: string;
}

/**
 * Fiche d'un signalement du compte connecté (`GET /signalements/portail/:id`)
 * — titre, description, lieu, cible, statut, dates et note de résolution en
 * lecture seule (le backend n'expose pas de mise à jour portail) ; les
 * photos restent modifiables tant que le signalement est `OUVERT` ou
 * `EN_COURS` (ajout via `POST /signalements/portail/:id/photos/upload`,
 * retrait via `DELETE /signalements/photos/:id` — 409 dès `RESOLU`/`REJETE`).
 * Miniatures cliquables = grand format via `GET /signalements/photos/:id/fichier`.
 * Tout 404 est affiché comme « introuvable » — impossible de distinguer un
 * signalement d'autrui.
 */
export function SignalementDetailPage({
	id,
	lienListe,
	labelRetour,
	breadcrumbAccueil,
	className = "w-full space-y-6 p-6",
}: SignalementDetailPageProps) {
	const signalementQuery = useSignalementPortail(id);
	const uploaderPhotoMutation = useUploaderPhotoSignalementPortail();
	const supprimerPhotoMutation = useSupprimerPhotoSignalementPortail(id);
	const [photoOuverte, setPhotoOuverte] = useState<SignalementPhoto | null>(
		null,
	);
	const [erreursPhotos, setErreursPhotos] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const photosBusy =
		uploaderPhotoMutation.isPending || supprimerPhotoMutation.isPending;

	async function ajouterPhotos(fichiers: readonly File[]) {
		const { acceptes, erreurs } = validerPhotosSignalement(fichiers);
		const resultats = await Promise.allSettled(
			acceptes.map((file) => uploaderPhotoMutation.mutateAsync({ id, file })),
		);
		const echouees = resultats.filter((r) => r.status === "rejected").length;
		setErreursPhotos(
			echouees > 0
				? [
						...erreurs,
						`${echouees} photo${echouees > 1 ? "s" : ""} n'a pas pu être envoyée${echouees > 1 ? "s" : ""}.`,
					]
				: erreurs,
		);
	}

	function supprimerPhoto(photo: SignalementPhoto) {
		supprimerPhotoMutation.mutate(photo.id, {
			onError: () =>
				setErreursPhotos(["La photo n'a pas pu être supprimée. Réessayez."]),
		});
	}

	if (signalementQuery.isLoading) {
		return (
			<div className={className}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (signalementQuery.isError || !signalementQuery.data) {
		const introuvable = toApiError(signalementQuery.error).status === 404;
		return (
			<div className={`${className} space-y-3`}>
				<h1 className="text-2xl font-semibold text-foreground">Signalement</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>
						{introuvable
							? "Ce signalement est introuvable."
							: "Impossible de charger ce signalement."}
					</p>
					{introuvable ? (
						<Button
							variant="outline"
							size="sm"
							className="rounded-full"
							asChild
						>
							<Link to={lienListe as never}>{labelRetour}</Link>
						</Button>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="rounded-full"
							onClick={() => void signalementQuery.refetch()}
						>
							Réessayer
						</Button>
					)}
				</div>
			</div>
		);
	}

	const signalement = signalementQuery.data;
	// Le backend refuse (409) upload comme suppression dès `RESOLU`/`REJETE` —
	// même fenêtre d'édition côté UI.
	const photosModifiables =
		signalement.statut === "OUVERT" || signalement.statut === "EN_COURS";

	return (
		<div className={className}>
			<PageHeader
				breadcrumb={[
					breadcrumbAccueil,
					{ label: "Signalements", to: lienListe },
					{ label: signalement.titre },
				]}
				title={
					<span className="inline-flex flex-wrap items-center gap-2">
						{signalement.titre}
						<Badge variant={SIGNALEMENT_STATUT_VARIANT[signalement.statut]}>
							{SIGNALEMENT_STATUT_LABELS[signalement.statut] ??
								signalement.statut}
						</Badge>
					</span>
				}
				description={`Signalé le ${formatDateHeureUTC(signalement.date_signalement)}`}
				actions={
					<Button variant="outline" size="sm" className="rounded-full" asChild>
						<Link to={lienListe as never}>{labelRetour}</Link>
					</Button>
				}
			/>

			<section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
				<div>
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Service concerné
					</p>
					<p className="mt-1 text-sm text-foreground">
						{libelleCiblePortail(signalement)}
					</p>
				</div>
				{signalement.lieu ? (
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Lieu
						</p>
						<p className="mt-1 text-sm text-foreground">{signalement.lieu}</p>
					</div>
				) : null}
				<div>
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Description
					</p>
					<p className="mt-1 text-sm whitespace-pre-wrap text-foreground">
						{signalement.description}
					</p>
				</div>
			</section>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-base font-semibold text-foreground">Suivi</h2>
				<ol className="space-y-2 text-sm">
					<li className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Signalement envoyé</span>
						<span className="font-medium text-foreground">
							{formatDateHeureUTC(signalement.date_signalement)}
						</span>
					</li>
					{signalement.statut === "EN_COURS" ? (
						<li className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">
								Pris en charge par nos équipes
							</span>
							<Badge variant="warning">En cours</Badge>
						</li>
					) : null}
					{signalement.date_resolution ? (
						<li className="flex items-center justify-between gap-3">
							<span className="text-muted-foreground">
								{SIGNALEMENT_STATUT_LABELS[signalement.statut] ?? "Clôturé"}
							</span>
							<span className="font-medium text-foreground">
								{formatDateHeureUTC(signalement.date_resolution)}
							</span>
						</li>
					) : null}
				</ol>
			</section>

			{signalement.note_resolution ? (
				<div
					className={`rounded-lg border p-4 text-sm ${
						signalement.statut === "REJETE"
							? "border-destructive/40 bg-destructive/10"
							: "border-success/40 bg-success-bg"
					}`}
				>
					<p className="font-medium text-foreground">
						{signalement.statut === "REJETE"
							? "Motif du rejet"
							: "Note de résolution"}
					</p>
					<p className="mt-1 text-muted-foreground">
						{signalement.note_resolution}
					</p>
				</div>
			) : null}

			<section className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-base font-semibold text-foreground">Photos</h2>
					{photosModifiables ? (
						<div className="flex items-center gap-2">
							<input
								ref={fileInputRef}
								type="file"
								accept={PHOTO_TYPES_MIME.join(",")}
								multiple
								disabled={photosBusy}
								className="sr-only"
								onChange={(event) => {
									void ajouterPhotos(Array.from(event.target.files ?? []));
									// Reset : re-sélectionner le même fichier doit
									// redéclencher onChange.
									event.target.value = "";
								}}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="rounded-full"
								disabled={photosBusy}
								onClick={() => fileInputRef.current?.click()}
							>
								{uploaderPhotoMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<ImagePlus className="size-4" aria-hidden />
								)}
								Ajouter
							</Button>
							<BoutonCamera
								label="Caméra"
								titre="Photo du signalement"
								description="Photographiez le problème dans le cadre."
								facingMode="environment"
								disabled={photosBusy}
								onCapture={(file) => void ajouterPhotos([file])}
							/>
						</div>
					) : null}
				</div>
				{erreursPhotos.length > 0 ? (
					<div role="alert" className="space-y-0.5">
						{erreursPhotos.map((erreur) => (
							<p key={erreur} className="text-xs text-destructive">
								{erreur}
							</p>
						))}
					</div>
				) : null}
				{signalement.photos.length === 0 ? (
					<p className="text-sm text-muted-foreground">Aucune photo jointe.</p>
				) : (
					<div className="flex flex-wrap gap-3">
						{signalement.photos.map((photo) => (
							<PhotoThumbnail
								key={photo.id}
								photo={photo}
								onOpen={() => setPhotoOuverte(photo)}
								onSupprimer={
									photosModifiables ? () => supprimerPhoto(photo) : undefined
								}
								suppressionEnCours={
									supprimerPhotoMutation.isPending &&
									supprimerPhotoMutation.variables === photo.id
								}
							/>
						))}
					</div>
				)}
			</section>

			<PhotoViewer
				photo={photoOuverte}
				onOpenChange={(open) => {
					if (!open) setPhotoOuverte(null);
				}}
			/>
		</div>
	);
}

function PhotoThumbnail({
	photo,
	onOpen,
	onSupprimer,
	suppressionEnCours = false,
}: {
	photo: SignalementPhoto;
	onOpen: () => void;
	/** Présent = photo retirable (signalement encore modifiable). */
	onSupprimer?: () => void;
	suppressionEnCours?: boolean;
}) {
	const { blobUrl, isLoading } = useSignalementPhotoBlobUrl(photo.id);

	return (
		<div className="relative overflow-hidden rounded-lg border border-border bg-muted">
			{onSupprimer ? (
				<button
					type="button"
					onClick={onSupprimer}
					disabled={suppressionEnCours}
					aria-label="Retirer la photo"
					className="absolute right-1 top-1 z-10 rounded-full bg-foreground/70 p-1 text-background transition-colors hover:bg-destructive disabled:opacity-50"
				>
					{suppressionEnCours ? (
						<Loader2 className="size-3.5 animate-spin" aria-hidden />
					) : (
						<Trash2 className="size-3.5" aria-hidden />
					)}
				</button>
			) : null}
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
						<p className="p-8 text-sm text-muted-foreground">
							<Loader2
								className="mr-2 inline size-4 animate-spin"
								aria-hidden
							/>
							Chargement…
						</p>
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
