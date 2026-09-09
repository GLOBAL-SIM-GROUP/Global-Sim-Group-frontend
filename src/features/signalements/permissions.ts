import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Signalements. */
const baseSignalementsKeys = createQueryKeys("signalements");

export const signalementsKeys = {
	...baseSignalementsKeys,
	photos: (id: string) =>
		[...baseSignalementsKeys.detail(id), "photos"] as const,
};

/** Taille de page de la pagination client des signalements. */
export const SIGNALEMENTS_PAGE_SIZE = 10;
