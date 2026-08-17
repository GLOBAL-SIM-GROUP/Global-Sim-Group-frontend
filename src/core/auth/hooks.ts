import type { AuthMeResponse } from "#/core/api";
import { hasPermission, type PermissionCode } from "#/core/permissions";
import { useAuth } from "./auth-context";

/** Hooks canoniques (prompt-adapted.md §31) — jamais de `useEverything()`. */

export function useCurrentUser(): AuthMeResponse | null {
	return useAuth().user;
}

export function usePermissions(): string[] {
	return useAuth().user?.permissions ?? [];
}

export function useCan(code: PermissionCode): boolean {
	return hasPermission(usePermissions(), code);
}
