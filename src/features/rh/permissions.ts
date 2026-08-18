import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module RH. */
export const servicesKeys = createQueryKeys("rh.services");
export const employesKeys = createQueryKeys("rh.employes");
export const pointagesKeys = createQueryKeys("rh.pointages");
export const paiesKeys = createQueryKeys("rh.paies");
export const rolesKeys = createQueryKeys("admin.roles");
export const activitesKeys = createQueryKeys("finances.activites");

/** Tailles de page des paginations client. */
export const EMPLOYES_PAGE_SIZE = 10;
export const POINTAGES_PAGE_SIZE = 12;
export const PAIES_PAGE_SIZE = 10;
