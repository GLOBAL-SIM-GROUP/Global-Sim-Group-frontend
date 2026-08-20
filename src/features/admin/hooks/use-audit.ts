import { useQuery } from "@tanstack/react-query";

import { listJournal } from "../api/audit";
import { journalKeys } from "../permissions";

/** Journal d'audit — filtres serveur portés par la clé. */
export function useJournal(filtres: {
	du?: string;
	au?: string;
	module?: string;
	utilisateur?: string;
	recherche?: string;
}) {
	return useQuery({
		queryKey: journalKeys.list(
			filtres.du,
			filtres.au,
			filtres.module,
			filtres.utilisateur,
			filtres.recherche,
		),
		queryFn: () => listJournal(filtres),
	});
}
