import { getApiClient } from "#/core/api";

import type {
	PortailCaution,
	PortailCautionResponse,
	PortailClient,
	PortailContrat,
	PortailEcheance,
	PortailEcheances,
	PortailPaiement,
	PortailPaiements,
	PortailResume,
	RecuEcheance,
	RecuPaiement,
} from "../models/portail";

type ClientWire = Omit<PortailClient, "id"> & { id_client: string };
type ContratWire = Omit<PortailContrat, "id"> & { id_contrat: string };
type EcheanceWire = Omit<PortailEcheance, "id"> & { id_echeance: string };
type PaiementWire = Omit<PortailPaiement, "id"> & { id_paiement: string };
type CautionWire = Omit<PortailCaution, "id"> & { id_caution: string };

function remapClient({ id_client: id, ...reste }: ClientWire): PortailClient {
	return { id, ...reste };
}

function remapContrat({
	id_contrat: id,
	...reste
}: ContratWire): PortailContrat {
	return { id, ...reste };
}

function remapEcheance({
	id_echeance: id,
	...reste
}: EcheanceWire): PortailEcheance {
	return { id, ...reste };
}

function remapPaiement({
	id_paiement: id,
	...reste
}: PaiementWire): PortailPaiement {
	return { id, ...reste };
}

function remapCaution({
	id_caution: id,
	...reste
}: CautionWire): PortailCaution {
	return { id, ...reste };
}

/** Appels API du portail résident (M2.5) — le résident est déduit du token. */
export function getPortailResume(): Promise<PortailResume> {
	return getApiClient()
		.apiFetch<
			Omit<PortailResume, "client" | "contrat_en_cours"> & {
				client: ClientWire;
				contrat_en_cours: ContratWire | null;
			}
		>("/residence/portail/resume")
		.then((data) => ({
			...data,
			client: remapClient(data.client),
			contrat_en_cours: data.contrat_en_cours
				? remapContrat(data.contrat_en_cours)
				: null,
		}));
}

export function getPortailEcheances(): Promise<PortailEcheances> {
	return getApiClient()
		.apiFetch<
			Omit<PortailEcheances, "echeances"> & { echeances: EcheanceWire[] }
		>("/residence/portail/echeances")
		.then((data) => ({
			...data,
			echeances: data.echeances.map(remapEcheance),
		}));
}

export function getPortailPaiements(): Promise<PortailPaiements> {
	return getApiClient()
		.apiFetch<{ paiements: PaiementWire[] }>("/residence/portail/paiements")
		.then((data) => ({
			paiements: data.paiements.map(remapPaiement),
		}));
}

export function getPortailCaution(): Promise<PortailCautionResponse> {
	return getApiClient()
		.apiFetch<{
			caution: CautionWire | null;
			historique: PortailCautionResponse["historique"];
		}>("/residence/portail/caution")
		.then((data) => ({
			caution: data.caution ? remapCaution(data.caution) : null,
			historique: data.historique,
		}));
}

/** Reçu d'une échéance payée. */
export function getRecuEcheance(id: string): Promise<RecuEcheance> {
	return getApiClient().apiFetch(`/api/v1/residence/portail/echeances/${id}/recu`);
}

/** Reçu d'un paiement. */
export function getRecuPaiement(id: string): Promise<RecuPaiement> {
	return getApiClient().apiFetch(`/api/v1/residence/portail/paiements/${id}/recu`);
}
