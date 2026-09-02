import type { ReactNode } from "react";
import { createContext, useContext, useSyncExternalStore } from "react";

import type { NotificationsClient } from "./notifications-client";

/**
 * Fournit le client notifications (déjà créé et logé dans le router context,
 * comme `AuthProvider`/`AuthSession`) aux composants. Re-render piloté par
 * `useSyncExternalStore` — pas de double source de vérité.
 */
const NotificationsContext = createContext<NotificationsClient | null>(null);

export function NotificationsProvider({
	client,
	children,
}: {
	client: NotificationsClient | undefined;
	children: ReactNode;
}) {
	return (
		<NotificationsContext.Provider value={client ?? null}>
			{children}
		</NotificationsContext.Provider>
	);
}

export function useNotifications() {
	const client = useContext(NotificationsContext);
	if (!client) {
		throw new Error(
			"useNotifications doit être utilisé dans un <NotificationsProvider>.",
		);
	}
	// `getServerSnapshot` (3e argument) obligatoire pour un composant rendu
	// côté serveur (cf. core/auth/session-hint.ts). `getSnapshot` convient
	// aussi comme snapshot serveur : lecture pure d'un état par défaut (le
	// socket ne se connecte jamais en SSR), identique des deux côtés avant
	// hydratation.
	const snapshot = useSyncExternalStore(
		client.subscribe,
		client.getSnapshot,
		client.getSnapshot,
	);
	return {
		...snapshot,
		isRead: client.isRead,
		markAsRead: client.markAsRead,
		markAllAsRead: client.markAllAsRead,
		refreshHistory: client.refreshHistory,
	};
}
