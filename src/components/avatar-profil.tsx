import { Loader2, Trash2, Upload, UserRound } from "lucide-react";
import { useRef, useState } from "react";

import { BoutonCamera } from "#/components/bouton-camera";
import { Button } from "#/components/ui/button";
import { toApiError } from "#/core/api";
import {
	useDefinirPhotoProfil,
	useMonCompte,
	usePhotoProfilUrl,
	useSupprimerPhotoProfil,
} from "#/core/api/hooks/use-mon-compte";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { cn } from "#/lib/utils";

/** Initiales de l'avatar — ex-dupliqué `sidebar.tsx`/`client-navbar.tsx`. */
export function initialsOf(login: string): string {
	return login
		.split(/[\s._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

/**
 * Avatar du compte connecté : la photo de profil (`GET /auth/mon-compte` +
 * téléchargement authentifié) si elle existe, sinon les initiales du login.
 * Le style (taille, anneau, fond) reste à la charge de l'appelant via
 * `className` — sidebar sombre et navbar claire gardent leur habillage.
 */
export function AvatarProfil({
	login,
	className,
}: {
	login: string;
	className?: string;
}) {
	const { data: profil } = useMonCompte();
	const photoUrl = usePhotoProfilUrl(profil?.photo);

	if (photoUrl) {
		return (
			<img
				src={photoUrl}
				alt=""
				aria-hidden
				className={cn("shrink-0 rounded-full object-cover", className)}
			/>
		);
	}
	return (
		<div
			aria-hidden
			className={cn(
				"grid shrink-0 place-items-center rounded-full text-lagoon",
				className,
			)}
		>
			{initialsOf(login)}
		</div>
	);
}

/**
 * Avatar d'un compte vu par le staff (listes admin) : télécharge la photo
 * de profil via `GET /uploads?key=` (`CLIENT.VOIR` suffit pour la catégorie
 * `profil-photo`), sinon initiales du login. Sans spinner — le visuel
 * arrive quand le blob est chargé (évite un loader par ligne de tableau).
 */
export function AvatarUtilisateur({
	photo,
	login,
	className,
}: {
	photo: string | null;
	login: string;
	className?: string;
}) {
	const { blobUrl } = useUploadBlobUrl(photo);

	if (blobUrl) {
		return (
			<img
				src={blobUrl}
				alt=""
				aria-hidden
				className={cn("shrink-0 rounded-full object-cover", className)}
			/>
		);
	}
	return (
		<div
			aria-hidden
			className={cn(
				"grid shrink-0 place-items-center rounded-full bg-lagoon/15 text-lagoon",
				className,
			)}
		>
			{initialsOf(login)}
		</div>
	);
}

const PHOTO_MAX_OCTETS = 5 * 1024 * 1024;
const PHOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];

function messageErreurFichier(file: File): string | null {
	if (file.size > PHOTO_MAX_OCTETS) {
		return "La photo ne doit pas dépasser 5 Mo.";
	}
	if (!PHOTO_MIMES.includes(file.type)) {
		return "Format non supporté. Utilisez JPG, PNG ou WebP.";
	}
	return null;
}

/**
 * Avatar éditable de la page « Mon compte » : aperçu de la photo courante
 * (ou silhouette), boutons « Fichier » / « Caméra » pour en définir une
 * (PUT `/auth/mon-compte/photo`, multipart `file`) et « Retirer » (DELETE)
 * quand une photo existe. Self-service — fonctionne pour tout compte
 * authentifié (staff, résident, client).
 */
export function PhotoProfilEditable() {
	const { data: profil, isLoading } = useMonCompte();
	const photoUrl = usePhotoProfilUrl(profil?.photo);
	const definir = useDefinirPhotoProfil();
	const supprimer = useSupprimerPhotoProfil();
	const fileRef = useRef<HTMLInputElement>(null);
	const [erreur, setErreur] = useState<string | null>(null);

	const occupe = definir.isPending || supprimer.isPending;

	const envoyer = (file: File) => {
		const refus = messageErreurFichier(file);
		if (refus) {
			setErreur(refus);
			return;
		}
		setErreur(null);
		definir.mutate(file, {
			onError: (error) =>
				setErreur(
					toApiError(error).message ||
						"Impossible d'enregistrer la photo de profil.",
				),
		});
	};

	return (
		<div className="flex flex-col items-center gap-3 sm:items-start">
			<div className="relative">
				{isLoading || occupe ? (
					<div className="grid size-20 place-items-center rounded-full bg-muted">
						<Loader2
							className="size-6 animate-spin text-muted-foreground"
							aria-hidden
						/>
					</div>
				) : photoUrl ? (
					<img
						src={photoUrl}
						alt="Votre profil"
						className="size-20 rounded-full object-cover ring-2 ring-lagoon/30"
					/>
				) : (
					<div
						aria-hidden
						className="grid size-20 place-items-center rounded-full bg-lagoon/15 ring-2 ring-lagoon/30"
					>
						<UserRound className="size-9 text-lagoon" aria-hidden />
					</div>
				)}
			</div>

			<input
				ref={fileRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				aria-label="Choisir une photo de profil"
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) envoyer(file);
				}}
			/>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-full"
					disabled={occupe}
					onClick={() => fileRef.current?.click()}
				>
					<Upload className="size-4" aria-hidden />
					{photoUrl ? "Changer" : "Ajouter une photo"}
				</Button>
				<BoutonCamera
					onCapture={envoyer}
					disabled={occupe}
					titre="Photo de profil"
					description="Cadrez votre visage puis capturez."
					facingMode="user"
				/>
				{photoUrl ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="rounded-full text-destructive hover:text-destructive"
						disabled={occupe}
						onClick={() =>
							supprimer.mutate(undefined, {
								onError: (error) =>
									setErreur(
										toApiError(error).message ||
											"Impossible de supprimer la photo.",
									),
							})
						}
					>
						<Trash2 className="size-4" aria-hidden />
						Retirer
					</Button>
				) : null}
			</div>
			{erreur ? (
				<p role="alert" className="text-sm text-destructive">
					{erreur}
				</p>
			) : null}
			<p className="text-xs text-muted-foreground">
				Photo visible dans les menus de votre espace — JPG, PNG ou WebP, 5 Mo
				max.
			</p>
		</div>
	);
}
