import { useQuery } from "@tanstack/react-query";
import { useCan } from "#/core/auth";
import { listerCaisses } from "../api/caisses";

/**
 * Caisse(s) accessible(s) à l'utilisateur connecté.
 *
 * `GET /finances/caisses` est scopé par le backend : un utilisateur assigné à
 * une caisse ne voit que la sienne (même principe documenté pour
 * `GET /finances/tirages`). `/auth/me` n'expose aucun `id_caisse` — la seule
 * source de vérité pour « quelle est ma caisse » est cette liste déjà filtrée
 * par le backend, jamais une résolution côté client.
 */
export function useMesCaisses() {
	const canVoir = useCan("FINANCES.VOIR");

	return useQuery({
		queryKey: ["finances", "caisses", "moi"],
		queryFn: () => listerCaisses(),
		enabled: canVoir,
	});
}
