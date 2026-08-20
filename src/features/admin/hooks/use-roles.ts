import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerRole,
	getRolePermissions,
	listPermissions,
	listRoles,
	majRolePermissions,
	modifierRole,
	supprimerRole,
} from "../api/roles";
import { permissionsKeys, rolesKeys } from "../permissions";

export function useRoles() {
	return useQuery({ queryKey: rolesKeys.list(), queryFn: listRoles });
}

export function usePermissions() {
	return useQuery({
		queryKey: permissionsKeys.list(),
		queryFn: listPermissions,
	});
}

/** Permissions d'un rôle (matrice). */
export function useRolePermissions(id: string) {
	return useQuery({
		queryKey: rolesKeys.detail(id),
		queryFn: () => getRolePermissions(id),
	});
}

/** Invalide les rôles après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
	};
}

export function useCreerRole() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (body: {
			code: string;
			libelle: string;
			description?: string | null;
		}) => creerRole(body),
		onSuccess: invalider,
	});
}

export function useMajRolePermissions() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			idPermissions,
		}: {
			id: string;
			idPermissions: string[];
		}) => majRolePermissions(id, idPermissions),
		onSuccess: invalider,
	});
}

export function useSupprimerRole() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => supprimerRole(id),
		onSuccess: invalider,
	});
}

export function useModifierRole() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			libelle?: string;
			description?: string | null;
		}) => modifierRole(id, body),
		onSuccess: invalider,
	});
}
