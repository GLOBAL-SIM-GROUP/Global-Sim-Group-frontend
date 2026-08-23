import { getApiClient } from "#/core/api";

import type {
	ConfigurationSauvegardes,
	Sauvegarde,
	SauvegardeStatut,
	SauvegardeType,
} from "../models/sauvegardes";

type SauvegardeWire = Omit<Sauvegarde, "id"> & { id_sauvegarde: string };

type SauvegardeBackend = {
	id_sauvegarde: string;
	date_creation: string;
	date_debut: string;
	date_fin: string;
	type: "AUTOMATIQUE" | "MANUELLE";
	statut: "SUCCES" | "ERREUR" | "EN_COURS";
	taille_octets: string | null;
	taille_humaine: string | null;
	chemin: string;
	message_erreur: string | null;
};

/** Liste l'historique des sauvegardes (GET /admin/sauvegardes). */
export function listSauvegardes(): Promise<Sauvegarde[]> {
	return getApiClient()
		.apiFetch<{ total: number; items: SauvegardeBackend[] }>("/api/v1/admin/sauvegardes")
		.then(({ items }) =>
			items.map((item) => ({
				id: item.id_sauvegarde,
				date: item.date_creation,
				type: item.type.toLowerCase() as SauvegardeType,
				taille: item.taille_octets ? Number(item.taille_octets) : 0,
				statut: (
					item.statut === "SUCCES"
						? "succes"
						: item.statut === "ERREUR"
							? "echec"
							: "en_cours"
				) as SauvegardeStatut,
			})),
		);
}

/** Récupère la planification des sauvegardes automatiques. */
export function getConfigurationSauvegardes(): Promise<ConfigurationSauvegardes> {
	return getApiClient().apiFetch<ConfigurationSauvegardes>(
		"/api/v1/admin/sauvegardes/planification",
	);
}

/** Met à jour la planification des sauvegardes automatiques. */
export function majConfigurationSauvegardes(config: {
	frequence: "quotidienne" | "hebdomadaire";
	activee: boolean;
}): Promise<ConfigurationSauvegardes> {
	return getApiClient().apiFetch("/api/v1/admin/sauvegardes/planification", {
		method: "PUT",
		body: JSON.stringify(config),
	});
}

/** Déclenche une sauvegarde manuelle (POST /admin/sauvegardes/declencher). */
export function creerSauvegardeManuelle(): Promise<Sauvegarde> {
	return getApiClient()
		.apiFetch<SauvegardeWire>("/api/v1/admin/sauvegardes/declencher", { method: "POST" })
		.then(({ id_sauvegarde: id, ...reste }) => ({ id, ...reste }));
}

/** Restaure une sauvegarde (POST /admin/sauvegardes/{id}/restaurer). */
export function restaurerSauvegarde(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/admin/sauvegardes/${id}/restaurer`, {
		method: "POST",
		body: JSON.stringify({ confirmation: true }),
	});
}
