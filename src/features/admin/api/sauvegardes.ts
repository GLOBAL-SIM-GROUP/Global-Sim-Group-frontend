import { getApiClient } from "#/core/api";

import type {
	ConfigurationSauvegardes,
	Sauvegarde,
} from "../models/sauvegardes";

type SauvegardeWire = Omit<Sauvegarde, "id"> & { id_sauvegarde: string };

/** Liste l'historique des sauvegardes (GET /core/sauvegardes). */
export function listSauvegardes(): Promise<Sauvegarde[]> {
	return getApiClient()
		.apiFetch<SauvegardeWire[]>("/core/sauvegardes")
		.then((data) =>
			data.map(({ id_sauvegarde: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Récupère la configuration des sauvegardes automatiques. */
export function getConfigurationSauvegardes(): Promise<ConfigurationSauvegardes> {
	return getApiClient().apiFetch<ConfigurationSauvegardes>(
		"/core/sauvegardes/configuration",
	);
}

/** Met à jour la fréquence des sauvegardes automatiques. */
export function majConfigurationSauvegardes(config: {
	frequence: "quotidienne" | "hebdomadaire";
	activee: boolean;
}): Promise<ConfigurationSauvegardes> {
	return getApiClient().apiFetch("/core/sauvegardes/configuration", {
		method: "PATCH",
		body: JSON.stringify(config),
	});
}

/** Déclenche une sauvegarde manuelle (POST /core/sauvegardes). */
export function creerSauvegardeManuelle(): Promise<Sauvegarde> {
	return getApiClient()
		.apiFetch<SauvegardeWire>("/core/sauvegardes", { method: "POST" })
		.then(({ id_sauvegarde: id, ...reste }) => ({ id, ...reste }));
}

/** Restaure une sauvegarde (POST /core/sauvegardes/{id}/restaurer). */
export function restaurerSauvegarde(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/core/sauvegardes/${id}/restaurer`, {
		method: "POST",
	});
}
