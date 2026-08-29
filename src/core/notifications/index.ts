/**
 * Frontière des notifications temps réel du frontend.
 *
 * WebSocket-only par choix backend (pas de table SQL, pas d'endpoint REST) :
 * tout passe par `createNotificationsClient` (Socket.IO, namespace
 * `/notifications`), créé une fois par router à côté de `createAuthSession`
 * et consommé via `NotificationsProvider`/`useNotifications`.
 */

export type {
	NotificationsClient,
	NotificationsSnapshot,
	NotificationsStatus,
} from "./notifications-client";
export { createNotificationsClient } from "./notifications-client";
export {
	NotificationsProvider,
	useNotifications,
} from "./notifications-context";
export type {
	NotificationConnectionOk,
	NotificationConnectionUser,
	NotificationEnvelope,
	NotificationPriority,
} from "./types";
