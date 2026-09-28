import { Link } from "@tanstack/react-router";
import { Camera, Loader2, X } from "lucide-react";
import { useState } from "react";

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
	SIGNALEMENT_STATUT_LABELS,
	SIGNALEMENT_STATUT_VARIANT,
} from "#/features/signalements/models/signalements";

import { useSignalementPortail } from "../hooks/use-signalements";
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
 * — lecture seule : titre, description, lieu, cible, statut, dates et
 * note de résolution, photos jointes en miniatures (clic = grand format via
 * `GET /signalements/photos/:id/fichier`). Tout 404 est affiché comme
 * « introuvable » — impossible de distinguer un signalement d'autrui.
 */
export function SignalementDetailPage({
	id,
	lienListe,
	labelRetour,
	breadcrumbAccueil,
	className = "w-full space-y-6 p-6",
}: SignalementDetailPageProps) {
	const signalementQuery = useSignalementPortail(id);
	const [photoOuverte, setPhotoOuverte] = useState<SignalementPhoto | null>(
		null,
	);

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
				<h2 className="text-base font-semibold text-foreground">Photos</h2>
				{signalement.photos.length === 0 ? (
					<p className="text-sm text-muted-foreground">Aucune photo jointe.</p>
				) : (
					<div className="flex flex-wrap gap-3">
						{signalement.photos.map((photo) => (
							<PhotoThumbnail
								key={photo.id}
								photo={photo}
								onOpen={() => setPhotoOuverte(photo)}
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
