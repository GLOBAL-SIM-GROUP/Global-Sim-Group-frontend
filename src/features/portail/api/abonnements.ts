import { getApiClient } from "#/core/api";
import type {
	Souscription,
	SouscriptionDetail,
} from "#/features/abonnement/models/abonnements";

/**
 * Portail client — mes abonnements (backend 089/090, permission
 * `PORTAIL.VOIR`). `id_client` vient du JWT, jamais envoyé : la liste est
 * scopée au client connecté côté serveur, et le détail renvoie 404 pour la
 * souscription d'un autre client.
 */

/** GET /api/v1/abonnement/portail/souscriptions — toutes activités. */
export function listMesSouscriptions(): Promise<Souscription[]> {
	return getApiClient().apiFetch<Souscription[]>(
		"/api/v1/abonnement/portail/souscriptions",
	);
}

/**
 * GET /api/v1/abonnement/portail/souscriptions/{id} — détail + `mouvements`.
 * 404 si la souscription appartient à un autre client.
 */
export function getMesSouscription(id: string): Promise<SouscriptionDetail> {
	if (!id || id === "undefined") {
		throw new Error("Souscription ID must be a valid string");
	}
	return getApiClient().apiFetch<SouscriptionDetail>(
		`/api/v1/abonnement/portail/souscriptions/${id}`,
	);
}
