/**
 * Tarif au kilo (module Pressing, mode `POIDS`) — historique append-only :
 * `POST /pressing/tarif-kg` ajoute un nouveau tarif courant, il n'existe ni
 * mise à jour ni suppression. Les commandes déjà créées gardent le total
 * calculé avec le tarif en vigueur au moment de leur création/modification —
 * changer le tarif n'affecte jamais rétroactivement une commande existante.
 * Clé primaire wire `id_tarif_kg` → `id`.
 */
export interface TarifKg {
	id: string;
	prix_kg: string;
	date_effet: string;
	id_utilisateur: string | null;
}
