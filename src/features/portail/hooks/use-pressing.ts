import { useQuery } from "@tanstack/react-query";
import {
	getPressingCommande,
	listPressingCommandes,
} from "../api/pressing";

/**
 * Récupère la liste des commandes de pressing du résident actuel.
 */
export function usePressingCommandes() {
	return useQuery({
		queryKey: ["pressing-commandes"],
		queryFn: () => listPressingCommandes(),
	});
}

/**
 * Récupère le détail d'une commande de pressing.
 */
export function usePressingCommande(id: string) {
	return useQuery({
		queryKey: ["pressing-commande", id],
		queryFn: () => getPressingCommande(id),
		enabled: typeof window !== "undefined" && !!id,
	});
}
