import { getApiClient } from "./client";
import type { HealthReadyStatus, HealthStatus } from "./types";

/** Endpoints de santé du backend (vérifiés en dev : live → `{status:"ok"}`). */
export const healthApi = {
	live(): Promise<HealthStatus> {
		return getApiClient().apiFetch("/health/live");
	},
	ready(): Promise<HealthReadyStatus> {
		return getApiClient().apiFetch("/health/ready");
	},
};
