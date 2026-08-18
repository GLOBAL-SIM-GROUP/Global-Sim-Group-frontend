import { useQuery } from "@tanstack/react-query";

import { listServices } from "../api/services";
import { servicesKeys } from "../permissions";

/** Liste des services RH. */
export function useServices() {
	return useQuery({
		queryKey: servicesKeys.list(),
		queryFn: listServices,
	});
}
