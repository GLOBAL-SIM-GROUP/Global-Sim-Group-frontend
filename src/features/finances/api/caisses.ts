import { getApiClient } from "#/core/api";
import type {
	Caisse,
	CaisseDashboard,
	CaisseFiltres,
	CreerCaisseDto,
	ModifierCaisseDto,
	RevenusUtilisateur,
} from "../models/caisses";

/** Lister les caisses (filtrées par activité et statut). */
export async function listerCaisses(filtres?: CaisseFiltres): Promise<Caisse[]> {
	const query = new URLSearchParams();
	if (filtres?.id_activite) query.set("id_activite", filtres.id_activite);
	if (filtres?.actif !== undefined)
		query.set("actif", filtres.actif ? "true" : "false");

	const qs = query.toString();
	return getApiClient().apiFetch(
		`/api/v1/finances/caisses${qs ? `?${qs}` : ""}`,
	);
}

/** Obtenir une caisse par ID. */
export async function obtenirCaisse(id: string): Promise<Caisse> {
	return getApiClient().apiFetch(`/api/v1/finances/caisses/${id}`);
}

/** Créer une nouvelle caisse. */
export async function creerCaisse(dto: CreerCaisseDto): Promise<Caisse> {
	return getApiClient().apiFetch("/api/v1/finances/caisses", {
		method: "POST",
		body: JSON.stringify(dto),
	});
}

/** Modifier une caisse. */
export async function modifierCaisse(
	id: string,
	dto: ModifierCaisseDto,
): Promise<Caisse> {
	return getApiClient().apiFetch(`/api/v1/finances/caisses/${id}`, {
		method: "PATCH",
		body: JSON.stringify(dto),
	});
}

/** Obtenir le tableau de bord d'une caisse (revenus du jour, paiements bruts). */
export async function obtenirDashboardCaisse(
	id: string,
): Promise<CaisseDashboard> {
	return getApiClient().apiFetch(`/api/v1/finances/caisses/${id}/dashboard`);
}

/** Obtenir les revenus par utilisateur (aggregated). */
export async function obtenirRevenusParUtilisateur(
	id_caisse?: string,
	du?: string,
	au?: string,
): Promise<RevenusUtilisateur[]> {
	const query = new URLSearchParams();
	if (id_caisse) query.set("id_caisse", id_caisse);
	if (du) query.set("du", du);
	if (au) query.set("au", au);

	const qs = query.toString();
	return getApiClient().apiFetch(
		`/api/v1/finances/paiements-par-utilisateur${qs ? `?${qs}` : ""}`,
	);
}
