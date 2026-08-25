import type { ReactNode } from "react";
import { createContext, useContext, useSyncExternalStore } from "react";
import type { AuthSession } from "./session";

/**
 * Fournit la session (déjà créée et logée dans le router context) aux
 * composants. Le re-render est piloté par `useSyncExternalStore` sur la
 * snapshot de la session — pas de double source de vérité.
 */
const AuthContext = createContext<AuthSession | null>(null);

export function AuthProvider({
	session,
	children,
}: {
	session: AuthSession | undefined;
	children: ReactNode;
}) {
	return (
		<AuthContext.Provider value={session ?? null}>{children}</AuthContext.Provider>
	);
}

export function useAuth(): AuthSession {
	const session = useContext(AuthContext);
	if (!session) {
		throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
	}
	useSyncExternalStore(session.subscribe, session.getSnapshot);
	return session;
}
