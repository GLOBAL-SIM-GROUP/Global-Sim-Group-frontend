import { getApiClient } from "#/core/api";
import type { CreerTirageDto, Tirage, TirageFiltres } from "../models/tirages";

/** Lister les tirages (filtrés par caisse, période, etc.) */
export async function listerTirages(
	filtres?: TirageFiltres,
): Promise<Tirage[]> {
	const query = new URLSearchParams();
	if (filtres?.du) query.set("du", filtres.du);
	if (filtres?.au) query.set("au", filtres.au);
	if (filtres?.id_caisse) query.set("id_caisse", filtres.id_caisse);
	if (filtres?.recherche) query.set("recherche", filtres.recherche);
	if (filtres?.sort) query.set("sort", filtres.sort);
	if (filtres?.order) query.set("order", filtres.order);
	if (filtres?.limit) query.set("limit", filtres.limit.toString());
	if (filtres?.offset) query.set("offset", filtres.offset.toString());

	const qs = query.toString();
	return getApiClient().apiFetch(
		`/api/v1/finances/tirages${qs ? `?${qs}` : ""}`,
	);
}

/** Créer un tirage de caisse */
export async function creerTirage(dto: CreerTirageDto): Promise<Tirage> {
	return getApiClient().apiFetch("/api/v1/finances/tirages", {
		method: "POST",
		body: JSON.stringify({
			montant_compte: dto.montant_compte.toString(),
			date: dto.date,
			id_caisse: dto.id_caisse,
			note: dto.note ?? null,
		}),
	});
}
