import { getApiClient, toApiError } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import type {
	FactureDetail,
	LigneFacture,
} from "#/features/facturation/models/factures";

import type {
	LogementPortail,
	SejourPortail,
	SejourType,
} from "../models/sejours";

type CreerSejourPortailDto = components["schemas"]["CreerSejourPortailDto"];

type SejourPortailWire = Omit<SejourPortail, "id"> & { id_sejour: string };

type FactureDetailWire = Omit<FactureDetail, "id" | "lignes"> & {
	id_facture: string;
	lignes: (Omit<LigneFacture, "id"> & { id_ligne: string })[];
};

const toSejourPortail = ({
	id_sejour: id,
	...reste
}: SejourPortailWire): SejourPortail => ({ id, ...reste });

/**
 * Appels API du portail — demandes de séjour court
 * (`/residence/portail/sejours`, residence 087+088). Le client est déduit du
 * JWT. Une demande `EN_ATTENTE` n'occupe PAS le logement : la validation
 * staff re-vérifie la disponibilité — le `409` de disponibilité est donc un
 * cas normal à deux endroits (création et validation), pas une erreur.
 */

/**
 * Catalogue des logements proposables (`GET .../logements`, PORTAIL.VOIR).
 * Sans dates : tout le catalogue actif. Avec `date_arrivee`/`date_depart`
 * (`YYYY-MM-DD`) : uniquement les logements libres sur la période — hors
 * séjours `EN_COURS` chevauchants et contrats de location `ACTIF` couvrant
 * la période.
 */
export function listLogementsPortail(periode?: {
	dateArrivee: string;
	dateDepart: string;
}): Promise<LogementPortail[]> {
	const params = new URLSearchParams();
	if (periode?.dateArrivee) params.set("date_arrivee", periode.dateArrivee);
	if (periode?.dateDepart) params.set("date_depart", periode.dateDepart);
	const qs = params.toString();
	return getApiClient().apiFetch<LogementPortail[]>(
		`/api/v1/residence/portail/sejours/logements${qs ? `?${qs}` : ""}`,
	);
}

/** Liste des demandes de séjour du compte connecté (PORTAIL.VOIR). */
export async function listMesSejoursPortail(): Promise<SejourPortail[]> {
	const response = await getApiClient().apiFetch<SejourPortailWire[]>(
		"/api/v1/residence/portail/sejours",
	);
	return response.map(toSejourPortail);
}

/** Détail d'une demande (PORTAIL.VOIR). 404 = inconnu ou d'autrui. */
export async function getSejourPortail(id: string): Promise<SejourPortail> {
	const response = await getApiClient().apiFetch<SejourPortailWire>(
		`/api/v1/residence/portail/sejours/${id}`,
	);
	return toSejourPortail(response);
}

/**
 * Corps de la demande de séjour — `id_logement` choisi dans le catalogue
 * (`type_logement` est déduit côté backend, pas envoyé). Pas de tarif : le
 * personnel chiffre à la validation.
 */
export interface CreerSejourPortailBody {
	idLogement: string;
	typePrestation: SejourType;
	/** Date-heure au format backend `YYYY-MM-DD HH:MM:SS` (futur requis). */
	dateHeureArrivee: string;
	dateHeureDepartPrevue?: string | null;
	nombrePersonnes?: number | null;
	observations?: string | null;
}

/**
 * Soumet une demande de séjour (POST, RESIDENCE.DEMANDER → `EN_ATTENTE`).
 * 409 si le logement a été pris entre l'affichage du catalogue et l'envoi —
 * l'appelant rafraîchit alors le catalogue et propose un autre logement.
 */
export async function creerSejourPortail(
	body: CreerSejourPortailBody,
): Promise<SejourPortail> {
	// Corps conforme à `CreerSejourPortailDto` (le DTO généré type les champs
	// nullables en `Record<string, never>` — schéma opaque) : typé
	// explicitement ici, `nombre_personnes` part en string wire comme livré.
	const corps = {
		id_logement: body.idLogement,
		type_prestation: body.typePrestation,
		date_heure_arrivee: body.dateHeureArrivee,
		...(body.dateHeureDepartPrevue
			? { date_heure_depart_prevue: body.dateHeureDepartPrevue }
			: {}),
		...(body.nombrePersonnes != null
			? { nombre_personnes: String(body.nombrePersonnes) }
			: {}),
		...(body.observations?.trim()
			? { observations: body.observations.trim() }
			: {}),
	} satisfies {
		id_logement: string;
		type_prestation: CreerSejourPortailDto["type_prestation"];
		date_heure_arrivee: string;
		date_heure_depart_prevue?: string;
		nombre_personnes?: string;
		observations?: string;
	};
	const response = await getApiClient().apiFetch<SejourPortailWire>(
		"/api/v1/residence/portail/sejours",
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
	return toSejourPortail(response);
}

/**
 * Annule une demande encore `EN_ATTENTE` (POST `.../annuler`,
 * RESIDENCE.DEMANDER — 409 si le personnel a déjà traité la demande).
 */
export function annulerSejourPortail(
	id: string,
	motif?: string,
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/residence/portail/sejours/${id}/annuler`,
		{
			method: "POST",
			body: JSON.stringify(motif?.trim() ? { motif: motif.trim() } : {}),
		},
	);
}

/**
 * Facture d'un séjour (`GET .../sejours/:id/facture`, PORTAIL.VOIR). La
 * facture n'existe qu'après un premier encaissement : le `404` avant tout
 * paiement est l'état normal (`null`), pas une erreur — état vide côté UI.
 */
export async function getSejourPortailFacture(
	id: string,
): Promise<FactureDetail | null> {
	try {
		const wire = await getApiClient().apiFetch<FactureDetailWire>(
			`/api/v1/residence/portail/sejours/${id}/facture`,
		);
		return {
			...wire,
			id: wire.id_facture,
			lignes: wire.lignes.map(({ id_ligne: idLigne, ...reste }) => ({
				id: idLigne,
				...reste,
			})),
		};
	} catch (error) {
		if (toApiError(error).status === 404) return null;
		throw error;
	}
}
