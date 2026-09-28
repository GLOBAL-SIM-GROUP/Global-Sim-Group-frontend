import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { components } from "#/core/api/generated/schema";

import {
	creerSignalementPortail,
	getSignalementPortail,
	listMesSignalements,
	uploaderPhotoSignalementPortail,
} from "../api/signalements";
import { signalementsPortailKeys } from "../permissions";

type CreerSignalementPortailDto =
	components["schemas"]["CreerSignalementPortailDto"];

/** « Mes signalements » — uniquement ceux de l'appelant (scopé par le JWT). */
export function useMesSignalements() {
	return useQuery({
		queryKey: signalementsPortailKeys.list("mes"),
		queryFn: listMesSignalements,
	});
}

/**
 * Détail d'un de mes signalements. `retry: false` : un 404 signifie
 * « introuvable ou déclaré par quelqu'un d'autre » — inutile de réessayer.
 */
export function useSignalementPortail(id: string) {
	return useQuery({
		queryKey: signalementsPortailKeys.detail(id),
		queryFn: () => getSignalementPortail(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Déclaration portail — invalide la liste « Mes signalements ». */
export function useCreerSignalementPortail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreerSignalementPortailDto) =>
			creerSignalementPortail(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: signalementsPortailKeys.all,
			});
		},
	});
}

/**
 * Upload d'une photo après création du signalement (`POST
 * /signalements/portail/:id/photos/upload`, multipart). Invalide le détail
 * (les photos y sont embarquées) et la liste.
 */
export function useUploaderPhotoSignalementPortail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, file }: { id: string; file: File }) =>
			uploaderPhotoSignalementPortail(id, file),
		onSuccess: (_photo, variables) => {
			void queryClient.invalidateQueries({
				queryKey: signalementsPortailKeys.detail(variables.id),
			});
		},
	});
}

/**
 * Pour l'affichage des photos (blob URL via `GET
 * /signalements/photos/:id/fichier`, route partagée staff/portail),
 * réutiliser `useSignalementPhotoBlobUrl` de
 * `#/features/signalements/hooks/use-signalements` — la lecture hérite du
 * périmètre du signalement parent côté backend.
 */
