import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { authApi } from "../auth";
import type { MonCompteResponse } from "../types";

const CLE_PROFIL = ["mon-compte"] as const;

/**
 * Profil self-service du compte connecté (`GET /auth/mon-compte`) — tout
 * compte authentifié : staff, résident, client. Expose `photo` (clé MinIO
 * `profil-photo/…` ou `null`), `nom`/`prenom`/`email` et le rôle.
 */
export function useMonCompte(enabled = true) {
	return useQuery<MonCompteResponse>({
		queryKey: CLE_PROFIL,
		queryFn: () => authApi.monCompte(),
		staleTime: 60_000,
		enabled,
	});
}

/**
 * Blob URL de la photo de profil (`GET /auth/mon-compte/photo`), créée et
 * révoquée en `useEffect` — le téléchargement n'est lancé que si la clé
 * `photo` du profil est non nulle.
 */
export function usePhotoProfilUrl(photo: string | null | undefined) {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!photo) {
			setUrl(null);
			return;
		}
		let annule = false;
		let objectUrl: string | null = null;
		authApi
			.photoMonCompte()
			.then((blob) => {
				if (annule) return;
				objectUrl = URL.createObjectURL(blob);
				setUrl(objectUrl);
			})
			.catch(() => {
				if (!annule) setUrl(null);
			});
		return () => {
			annule = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [photo]);

	return url;
}

/** Upload d'une nouvelle photo de profil (PUT, multipart `file`). */
export function useDefinirPhotoProfil() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => authApi.definirPhotoMonCompte(file),
		onSuccess: (profil) => {
			qc.setQueryData(CLE_PROFIL, profil);
		},
	});
}

/** Suppression de la photo de profil (DELETE). */
export function useSupprimerPhotoProfil() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => authApi.supprimerPhotoMonCompte(),
		onSuccess: () => {
			qc.setQueryData<MonCompteResponse | undefined>(CLE_PROFIL, (profil) =>
				profil ? { ...profil, photo: null } : profil,
			);
		},
	});
}
