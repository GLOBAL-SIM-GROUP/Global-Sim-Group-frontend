import { createQueryKeys } from "#/core/query";

export const tableauBordKeys = createQueryKeys("finances.tableau-de-bord");
export const paiementsKeys = createQueryKeys("finances.paiements");
export const depensesKeys = createQueryKeys("finances.depenses");
export const impayesKeys = createQueryKeys("finances.impayes");
export const categoriesDepensesKeys = createQueryKeys(
	"finances.categories-depenses",
);
export const moyensPaiementKeys = createQueryKeys("finances.moyens-paiement");

export const PAIEMENTS_PAGE_SIZE = 10;
export const DEPENSES_PAGE_SIZE = 10;
export const IMPAYES_PAGE_SIZE = 10;
