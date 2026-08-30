import { Camera, Plus, Trash2, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useEtatDesLieux,
	useSupprimerEtatDesLieux,
} from "../hooks/use-etat-des-lieux";
import {
	ETAT_DES_LIEUX_TYPE_BADGE,
	ETAT_DES_LIEUX_TYPE_LABELS,
	type EtatDesLieuxPhoto,
	type EtatDesLieuxType,
} from "../models/etat-des-lieux";
import { formatDateHeureISO } from "../models/format";
import { ConfirmDialog } from "./confirm-dialog";
import { EtatDesLieuxFormDialog } from "./etat-des-lieux-form-dialog";

type FiltreType = "TOUS" | EtatDesLieuxType;

const FILTRES: { valeur: FiltreType; libelle: string }[] = [
	{ valeur: "TOUS", libelle: "Toutes" },
	{ valeur: "ENTREE", libelle: "Entrée" },
	{ valeur: "SORTIE", libelle: "Sortie" },
];

interface EtatDesLieuxTabProps {
	idContrat: string;
}

/**
 * Onglet « État des lieux » de la fiche contrat : photos liées au contrat
 * (GET `/contrats/{id}/etat-des-lieux`), filtrées par type, avec ajout
 * (upload puis liaison) et suppression.
 */
export function EtatDesLieuxTab({ idContrat }: EtatDesLieuxTabProps) {
	const canAjouterFichier = useCan("CLIENT.MODIFIER");
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canAjouter = canAjouterFichier && canModifier;

	const [filtre, setFiltre] = useState<FiltreType>("TOUS");
	const photosQuery = useEtatDesLieux(
		idContrat,
		filtre === "TOUS" ? undefined : filtre,
	);
	const supprimerMutation = useSupprimerEtatDesLieux();

	const [formulaireOuvert, setFormulaireOuvert] = useState(false);
	const [photoOuverte, setPhotoOuverte] = useState<EtatDesLieuxPhoto | null>(
		null,
	);
	const [aSupprimer, setASupprimer] = useState<EtatDesLieuxPhoto | null>(null);

	const photos = photosQuery.data ?? [];

	return (
		<section className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div
					role="tablist"
					aria-label="Filtrer les photos par type"
					className="flex gap-1 rounded-lg border border-border bg-card p-1"
				>
					{FILTRES.map(({ valeur, libelle }) => (
						<button
							key={valeur}
							type="button"
							role="tab"
							aria-selected={filtre === valeur}
							onClick={() => setFiltre(valeur)}
							className={cn(
								"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
								filtre === valeur
									? "bg-lagoon text-white"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{libelle}
						</button>
					))}
				</div>

				{canAjouter ? (
					<Button size="sm" onClick={() => setFormulaireOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter une photo
					</Button>
				) : null}
			</div>

			{photosQuery.isLoading ? (
				<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Chargement…
				</p>
			) : photosQuery.isError ? (
				<p className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
					Impossible de charger les photos d'état des lieux.
				</p>
			) : photos.length === 0 ? (
				<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Aucune photo d'état des lieux pour ce filtre.
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{photos.map((photo) => (
						<PhotoCard
							key={photo.id}
							photo={photo}
							canModifier={canModifier}
							onOuvrir={() => setPhotoOuverte(photo)}
							onSupprimer={() => setASupprimer(photo)}
						/>
					))}
				</div>
			)}

			<EtatDesLieuxFormDialog
				open={formulaireOuvert}
				idContrat={idContrat}
				onOpenChange={setFormulaireOuvert}
				onSaved={() => setFormulaireOuvert(false)}
			/>

			<PhotoViewerDialog
				photo={photoOuverte}
				onOpenChange={(ouvert) => {
					if (!ouvert) setPhotoOuverte(null);
				}}
			/>

			<ConfirmDialog
				open={aSupprimer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setASupprimer(null);
				}}
				title="Supprimer la photo"
				message="Voulez-vous vraiment supprimer cette photo d'état des lieux ? Cette action est irréversible."
				confirmLabel="Supprimer"
				cancelLabel="Annuler"
				destructive
				busy={supprimerMutation.isPending}
				onConfirm={() => {
					if (!aSupprimer) return;
					supprimerMutation.mutate(aSupprimer.id, {
						onSettled: () => setASupprimer(null),
					});
				}}
			/>
		</section>
	);
}

/** Carte d'une photo : thumbnail (blob authentifié), métadonnées, actions. */
function PhotoCard({
	photo,
	canModifier,
	onOuvrir,
	onSupprimer,
}: {
	photo: EtatDesLieuxPhoto;
	canModifier: boolean;
	onOuvrir: () => void;
	onSupprimer: () => void;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(photo.cle_objet);

	return (
		<div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
			<button
				type="button"
				onClick={onOuvrir}
				className="block h-40 w-full bg-muted"
				aria-label={`Voir la photo${photo.piece ? ` — ${photo.piece}` : ""}`}
			>
				{isLoading ? (
					<div className="flex h-full items-center justify-center text-xs text-muted-foreground">
						Chargement…
					</div>
				) : blobUrl ? (
					<img
						src={blobUrl}
						alt={photo.piece ?? "Photo d'état des lieux"}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						<Camera className="size-8" aria-hidden />
					</div>
				)}
			</button>
			<div className="space-y-2 p-3">
				<div className="flex items-center justify-between gap-2">
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
							ETAT_DES_LIEUX_TYPE_BADGE[photo.type],
						)}
					>
						{ETAT_DES_LIEUX_TYPE_LABELS[photo.type]}
					</span>
					{canModifier ? (
						<Button
							variant="ghost"
							size="icon-sm"
							title="Supprimer la photo"
							onClick={onSupprimer}
						>
							<Trash2 className="size-4 text-destructive" aria-hidden />
							<span className="sr-only">Supprimer la photo</span>
						</Button>
					) : null}
				</div>
				<p className="text-sm font-medium text-foreground">
					{photo.piece ?? "Pièce non précisée"}
				</p>
				{photo.commentaire ? (
					<p className="line-clamp-2 text-xs text-muted-foreground">
						{photo.commentaire}
					</p>
				) : null}
				<p className="text-xs text-muted-foreground">
					{formatDateHeureISO(photo.date_ajout)}
				</p>
			</div>
		</div>
	);
}

/** Aperçu en grand (lightbox) — réutilise le cache blob de la carte. */
function PhotoViewerDialog({
	photo,
	onOpenChange,
}: {
	photo: EtatDesLieuxPhoto | null;
	onOpenChange: (open: boolean) => void;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(photo?.cle_objet);

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
						) : blobUrl ? (
							<img
								src={blobUrl}
								alt={photo?.piece ?? "Photo d'état des lieux"}
								className="max-h-[70vh] w-full object-contain"
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
