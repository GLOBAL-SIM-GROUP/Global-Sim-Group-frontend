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
		.apiFetch<{ total: number; items: SauvegardeBackend[] }>(
			"/api/v1/admin/sauvegardes",
		)
		.then(({ items }) =>
			items.map((item) => ({
				id: item.id_sauvegarde,
				date: item.date_creation,
				type: item.type.toLowerCase() as SauvegardeType,
				taille: item.taille_octets ? Number(item.taille_octets) : 0,
				statut: (item.statut === "SUCCES"
					? "succes"
					: item.statut === "ERREUR"
						? "echec"
						: "en_cours") as SauvegardeStatut,
			})),
		);
}

/**
 * Forme réelle de la planification côté backend — vérifiée en direct
 * (2026-09-06) : `frequence` en MAJUSCULES, `active` (pas `activee`), et
 * `heure` obligatoire sur le PUT. Le frontend envoyait jusqu'ici `frequence`
 * en minuscules, `activee`, et jamais `heure` — chaque tentative de
 * modification échouait avec un 400 VALIDATION_ERROR, et la lecture (`active`
 * lu comme `activee`, toujours `undefined`) affichait « Désactivée » et une
 * case décochée quel que soit l'état réel.
 */
type ConfigurationSauvegardesWire = {
	id_planification: string;
	frequence: "QUOTIDIENNE" | "HEBDOMADAIRE";
	/** `HH:MM:SS` en lecture, mais le PUT exige `HH:MM` (sans les secondes). */
	heure: string;
	active: boolean;
	date_maj: string;
};

function depuisWireConfiguration(
	wire: ConfigurationSauvegardesWire,
): ConfigurationSauvegardes {
	return {
		frequence: wire.frequence.toLowerCase() as "quotidienne" | "hebdomadaire",
		heure: wire.heure.slice(0, 5),
		activee: wire.active,
	};
}

/** Récupère la planification des sauvegardes automatiques. */
export function getConfigurationSauvegardes(): Promise<ConfigurationSauvegardes> {
	return getApiClient()
		.apiFetch<ConfigurationSauvegardesWire>(
			"/api/v1/admin/sauvegardes/planification",
		)
		.then(depuisWireConfiguration);
}

/** Met à jour la planification des sauvegardes automatiques. */
export function majConfigurationSauvegardes(config: {
	frequence: "quotidienne" | "hebdomadaire";
	heure: string;
	activee: boolean;
}): Promise<ConfigurationSauvegardes> {
	const corps = {
		frequence: config.frequence.toUpperCase(),
		heure: config.heure,
		active: config.activee,
	};
	return getApiClient()
		.apiFetch<ConfigurationSauvegardesWire>(
			"/api/v1/admin/sauvegardes/planification",
			{
				method: "PUT",
				body: JSON.stringify(corps),
			},
		)
		.then(depuisWireConfiguration);
}

/** Déclenche une sauvegarde manuelle (POST /admin/sauvegardes/declencher). */
export function creerSauvegardeManuelle(): Promise<Sauvegarde> {
	return getApiClient()
		.apiFetch<SauvegardeWire>("/api/v1/admin/sauvegardes/declencher", {
			method: "POST",
		})
		.then(({ id_sauvegarde: id, ...reste }) => ({ id, ...reste }));
}

/** Restaure une sauvegarde (POST /admin/sauvegardes/{id}/restaurer). */
export function restaurerSauvegarde(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/admin/sauvegardes/${id}/restaurer`, {
		method: "POST",
		body: JSON.stringify({ confirmation: true }),
	});
}
