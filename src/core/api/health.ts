import { getApiClient } from "./client";
import type { HealthReadyStatus, HealthStatus } from "./types";

/** Endpoints de santé du backend (vérifiés en dev : live → `{status:"ok"}`). */
export const healthApi = {
	live(): Promise<HealthStatus> {
		return getApiClient().apiFetch("/api/v1/health/live");
	},
	ready(): Promise<HealthReadyStatus> {
		return getApiClient().apiFetch("/api/v1/health/ready");
	},
};
