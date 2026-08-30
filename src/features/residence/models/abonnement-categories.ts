/**
 * Catégorie d'abonnement (module Abonnement, distinct de Résidence côté
 * backend : `GET/POST /api/v1/abonnement/categories`, `GET/PATCH/DELETE
 * /api/v1/abonnement/categories/{id}`). Absent du schéma OpenAPI généré
 * (`core/api/generated/schema.ts`) — comme plusieurs autres modules de ce
 * projet (RH, rapports, sauvegardes…), le backend réel expose des routes que
 * le spec ne documente pas. Champ `libelle` et clé wire `id_categorie_abonnement`
 * déduits par analogie avec `CategorieCharge` (même rôle, même convention de
 * nommage `id_categorie_<domaine>`) : à revalider si un champ diffère.
 *
 * Ne catégorise pas directement `Abonnement` (son champ `service` reste une
 * chaîne libre, aucune FK ajoutée) — sert uniquement à proposer une liste de
 * libellés cohérente dans le formulaire d'abonnement, à la place de la saisie
 * libre d'origine.
 */
export interface AbonnementCategorie {
	id: string;
	/** Code technique court (≤ 50 caractères), requis par le backend. */
	code: string;
	libelle: string;
}
