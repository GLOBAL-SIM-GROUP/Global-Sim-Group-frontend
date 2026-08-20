import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Administration (M11). */
export const utilisateursKeys = createQueryKeys("admin.utilisateurs");
export const rolesKeys = createQueryKeys("admin.roles");
export const permissionsKeys = createQueryKeys("admin.permissions");
export const journalKeys = createQueryKeys("audit.journal");
export const parametresKeys = createQueryKeys("core.parametres");

/** Tailles de page des paginations client. */
export const UTILISATEURS_PAGE_SIZE = 10;
export const JOURNAL_PAGE_SIZE = 15;
