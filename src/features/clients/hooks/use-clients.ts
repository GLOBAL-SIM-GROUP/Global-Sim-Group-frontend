import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type ClientBody,
	creerClient,
	creerContact,
	creerPiece,
	getClient,
	listClients,
	type ListClientsParams,
	modifierClient,
} from "../api/clients";
import { clientsKeys } from "../permissions";

/** Liste des clients, filtrée serveur par recherche (nom/téléphone/email). */
export function useClients(params?: ListClientsParams) {
	return useQuery({
		queryKey: clientsKeys.list(params?.search),
		queryFn: () => listClients(params),
	});
}

/** Détail d'un client (contacts + pièces). `retry: false` : 404 = introuvable. */
export function useClient(id: string) {
	return useQuery({
		queryKey: clientsKeys.detail(id),
		queryFn: () => getClient(id),
		retry: false,
	});
}

/** Invalide les clients après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: clientsKeys.all });
	};
}

export function useCreerClient() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerClient, onSuccess: invalider });
}

export function useModifierClient() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: ClientBody & { id: string }) =>
			modifierClient(id, body),
		onSuccess: invalider,
	});
}

export function useCreerContact() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			idClient,
			...body
		}: {
			idClient: string;
			nom: string;
			lien: string;
			telPrincipal: string;
			prenom?: string | null;
			telSecondaire?: string | null;
			adresse?: string | null;
			email?: string | null;
		}) => creerContact(idClient, body),
		onSuccess: invalider,
	});
}

export function useCreerPiece() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			idClient,
			...body
		}: {
			idClient: string;
			typePiece: string;
			numero: string;
			dateDelivrance?: string | null;
			dateExpiration?: string | null;
			autoriteDelivrance?: string | null;
			copieNum?: string | null;
		}) => creerPiece(idClient, body),
		onSuccess: invalider,
	});
}
