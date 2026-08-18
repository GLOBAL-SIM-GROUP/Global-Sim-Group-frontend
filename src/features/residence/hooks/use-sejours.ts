import { useQuery } from "@tanstack/react-query";

import { listSejours } from "../api/sejours";
import { sejoursKeys } from "../permissions";

/** Liste de tous les séjours (historique d'occupation, filtré côté client). */
export function useSejours() {
	return useQuery({ queryKey: sejoursKeys.list(), queryFn: listSejours });
}
