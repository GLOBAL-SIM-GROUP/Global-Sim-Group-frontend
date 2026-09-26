import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	createSignalement,
	getSignalement,
	getSignalementPhotoBlobUrl,
	listSignalementPhotos,
	listSignalements,
	type ModuleCible,
	prendreEnChargeSignalement,
	rejeterSignalement,
	resoudreSignalement,
	type SignalementCreatePayload,
	uploaderSignalementPhoto,
} from "#/core/api/signalements";
import { uploadCache } from "#/core/api/upload-cache";
import { usePermissions } from "#/core/auth";

import { signalementsKeys } from "../permissions";

export interface SignalementsFiltre {
	moduleCible?: ModuleCible;
}

/**
 * Liste complète des signalements — statut et recherche texte sont filtrés
 * côté client (même pattern que `useFactures`/`useReservations`), mais
 * `module_cible` est envoyé au serveur (supporté nativement par
 * `GET /signalements`) : un changement de ce filtre refait la requête.
 */
export function useSignalements(filtre: SignalementsFiltre = {}) {
	const { moduleCible } = filtre;
	return useQuery({
		queryKey: signalementsKeys.list(moduleCible ?? "tous"),
		queryFn: () =>
			listSignalements({
				limit: 200,
				module_cible: moduleCible,
			}),
	});
}

/** Détail d'un signalement (fiche). `retry: false` : 404 = introuvable. */
export function useSignalement(id: string) {
	return useQuery({
		queryKey: signalementsKeys.detail(id),
		queryFn: () => getSignalement(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Invalide la liste et le détail après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: signalementsKeys.all });
	};
}

export function useCreerSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (payload: SignalementCreatePayload) =>
			createSignalement(payload),
		onSuccess: invalider,
	});
}

/** Prise en charge (pas de note — l'API n'accepte aucun payload). */
export function usePrendreEnChargeSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => prendreEnChargeSignalement(id),
		onSuccess: invalider,
	});
}

export function useResoudreSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			noteResolution,
		}: {
			id: string;
			noteResolution: string;
		}) => resoudreSignalement(id, { note_resolution: noteResolution }),
		onSuccess: invalider,
	});
}

export function useRejeterSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			noteResolution,
		}: {
			id: string;
			noteResolution: string;
		}) => rejeterSignalement(id, { note_resolution: noteResolution }),
		onSuccess: invalider,
	});
}

/**
 * Blob URL d'une photo de signalement, via son propre endpoint de lecture
 * (`GET /signalements/photos/:id/fichier`) — jamais `GET /uploads?key=...`
 * pour ce module (la visibilité hérite du signalement parent, une garantie
 * que la clé MinIO seule ne porte pas). Même cache LRU partagé que
 * `useUploadBlobUrl`, sous un espace de clés distinct (préfixe
 * `signalement-photo-fichier/`) pour ne jamais collisionner avec les clés
 * MinIO des autres modules.
 */
export function useSignalementPhotoBlobUrl(idPhoto: string | null | undefined) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const cacheKey = idPhoto ? `signalement-photo-fichier/${idPhoto}` : null;

	useEffect(() => {
		if (!cacheKey) {
			setBlobUrl(null);
			return;
		}

		let monte = true;
		setIsLoading(true);

		(async () => {
			const encache = uploadCache.get(cacheKey);
			if (encache) {
				if (monte) {
					setBlobUrl(encache);
					setIsLoading(false);
				}
				return;
			}

			const url = await getSignalementPhotoBlobUrl(idPhoto);
			if (monte) {
				if (url) uploadCache.set(cacheKey, url);
				setBlobUrl(url);
				setIsLoading(false);
			}
		})();

		return () => {
			monte = false;
		};
	}, [cacheKey, idPhoto]);

	useEffect(() => {
		return () => {
			if (cacheKey) uploadCache.release(cacheKey);
		};
	}, [cacheKey]);

	return { blobUrl, isLoading };
}

export function useSignalementPhotos(id: string) {
	return useQuery({
		queryKey: signalementsKeys.photos(id),
		queryFn: () => listSignalementPhotos(id),
		enabled: Boolean(id),
	});
}

/** Upload en un seul appel (`POST /signalements/:id/photos/upload`, multipart). */
export function useUploaderSignalementPhoto() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, file }: { id: string; file: File }) =>
			uploaderSignalementPhoto(id, file),
		onSuccess: (_photo, variables) => {
			void queryClient.invalidateQueries({
				queryKey: signalementsKeys.photos(variables.id),
			});
		},
	});
}

/**
 * `SIGNALEMENT.DECLARER_TIERS` est un verbe propre à ce module (pas un des 4
 * verbes génériques `VOIR/CREER/MODIFIER/SUPPRIMER` de `PermissionCode`) : il
 * ne s'intègre pas au modèle `<MODULE>.<VERBE>` croisé de `core/permissions`
 * sans y ajouter un verbe qui n'a de sens que pour SIGNALEMENT. Vérifié en
 * direct (2026-09-12) : seuls Administrateur/Dirigeant/RH le portent, les
 * responsables et employés ne l'ont pas. Contrôle brut sur la chaîne, comme
 * `hasPermission`, mais hors du type `PermissionCode`.
 */
export function useCanDeclarerTiers(): boolean {
	return usePermissions().includes("SIGNALEMENT.DECLARER_TIERS");
}
