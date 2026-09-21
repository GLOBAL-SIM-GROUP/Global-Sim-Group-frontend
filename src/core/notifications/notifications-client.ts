import { io, type Socket } from "socket.io-client";

import type { AuthSession } from "#/core/auth";
import { env } from "#/env";

import { createClearedIdsStore, createReadIdsStore } from "./id-set-store";
import type { NotificationConnectionUser, NotificationEnvelope } from "./types";

/** Borne la liste en mémoire (l'historique serveur est déjà plafonné à 50). */
const MAX_NOTIFICATIONS = 100;

export type NotificationsStatus =
	| "idle"
	| "connecting"
	| "connected"
	| "disconnected";

export interface NotificationsSnapshot {
	status: NotificationsStatus;
	/** Triées du plus récent au plus ancien. */
	notifications: NotificationEnvelope[];
	unreadCount: number;
	connectedUser: NotificationConnectionUser | null;
}

export interface NotificationsClient {
	subscribe(listener: () => void): () => void;
	getSnapshot(): NotificationsSnapshot;
	isRead(id: string): boolean;
	markAsRead(id: string): void;
	markAllAsRead(): void;
	/**
	 * Masque toutes les notifications actuellement connues (état 100%
	 * frontend, persisté — voir `id-set-store.ts`). Le serveur ne connaît pas
	 * cette notion : une reconnexion repousse le même historique, mais les
	 * ids vidés restent masqués pour cet utilisateur/navigateur.
	 */
	clearAll(): void;
	/** Redemande l'historique au serveur (rafraîchissement manuel). */
	refreshHistory(): void;
}

/**
 * Dérive l'URL du namespace `/notifications` à partir de `VITE_API_URL` :
 * même host que l'API REST, mais SANS le préfixe `/api/v1` — Socket.IO route
 * la poignée de main via `/socket.io/` et rejoint le namespace donné dans
 * l'URL passée à `io(...)`.
 */
function resolveNotificationsUrl(): string {
	const apiUrl = env.VITE_API_URL;
	if (/^https?:\/\//.test(apiUrl)) {
		return `${new URL(apiUrl).origin}/notifications`;
	}
	// Chemin relatif (même origine, ex. proxy dev) : window est toujours défini
	// ici (le client de notifications n'est créé/connecté que côté client).
	return `${window.location.origin}/notifications`;
}

/**
 * Client Socket.IO des notifications temps réel (non-React, même architecture
 * que `core/auth/session.ts` : factory fermant sur un état privé, exposé via
 * `subscribe`/`getSnapshot` pour `useSyncExternalStore`).
 *
 * Cycle de vie piloté par la session d'auth :
 * - connecte quand `auth.isAuthenticated` devient vrai (login, restore) ;
 * - déconnecte quand elle redevient fausse (logout, session expirée) ;
 * - reconnecte avec un token frais à chaque rotation (`subscribeTokenChange`).
 *
 * Aucun endpoint REST : l'historique (`notifications:history`) et le flux
 * temps réel (`notification`) arrivent uniquement par ce socket.
 */
export function createNotificationsClient(
	auth: AuthSession,
): NotificationsClient {
	const listeners = new Set<() => void>();
	const readIds = createReadIdsStore();
	const clearedIds = createClearedIdsStore();

	let socket: Socket | null = null;
	// Liste brute (historique + live), jamais filtrée : `clearAll` doit
	// pouvoir masquer un item même après qu'il ait disparu du snapshot d'un
	// autre onglet. Le filtrage « vidé » n'a lieu que dans `buildSnapshot`.
	let notifications: NotificationEnvelope[] = [];
	let connectedUser: NotificationConnectionUser | null = null;
	let status: NotificationsStatus = "idle";
	let snapshot = buildSnapshot();
	// Anti-double : une récupération (refresh + reconnect) déjà en cours.
	let recovering = false;

	function buildSnapshot(): NotificationsSnapshot {
		const visibles = notifications.filter((n) => !clearedIds.has(n.id));
		return {
			status,
			notifications: visibles,
			unreadCount: visibles.filter((n) => !readIds.has(n.id)).length,
			connectedUser,
		};
	}

	function emit(): void {
		snapshot = buildSnapshot();
		for (const listener of listeners) listener();
	}

	/** Fusionne par id (dédoublonnage), trie du plus récent au plus ancien, plafonne. */
	function mergeNotifications(incoming: readonly NotificationEnvelope[]): void {
		const byId = new Map(notifications.map((n) => [n.id, n]));
		for (const item of incoming) byId.set(item.id, item);
		notifications = [...byId.values()]
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			)
			.slice(0, MAX_NOTIFICATIONS);
		const idsConnus = notifications.map((n) => n.id);
		readIds.prune(idsConnus);
		clearedIds.prune(idsConnus);
	}

	function attachSocketListeners(s: Socket): void {
		s.on("connect", () => {
			status = "connected";
			// Filet de sécurité : l'historique est déjà repoussé automatiquement
			// après `connection:ok`, mais on le redemande explicitement à chaque
			// (re)connexion pour couvrir le cas d'un événement manqué pendant une
			// coupure réseau (le backend garde 7 jours d'historique par room).
			s.emit("notifications:get_history");
			emit();
		});

		s.on("disconnect", (reason) => {
			status = "disconnected";
			connectedUser = null;
			emit();
			// Déconnexion initiée par le serveur = token refusé, expiré ou
			// révoqué (socket.io ne retente pas automatiquement dans ce cas) :
			// rafraîchir le token AVANT de reconnecter.
			if (reason === "io server disconnect") void recoverConnection();
		});

		s.on("connect_error", () => {
			status = "disconnected";
			emit();
			// Handshake refusé : on stoppe la reconnexion automatique (elle
			// rejouerait le token périmé), puis refresh + reconnect manuels.
			s.disconnect();
			void recoverConnection();
		});

		s.on("connection:ok", (payload: { user: NotificationConnectionUser }) => {
			connectedUser = payload.user;
			emit();
		});

		s.on("notifications:history", (items: NotificationEnvelope[]) => {
			mergeNotifications(items);
			emit();
		});

		s.on("notification", (item: NotificationEnvelope) => {
			mergeNotifications([item]);
			emit();
		});

		s.on("notifications:error", (payload: { message: string }) => {
			console.error("[notifications] erreur serveur :", payload.message);
		});
	}

	function connect(): void {
		if (socket) return;
		const token = auth.getAccessToken();
		if (!token) return;

		status = "connecting";
		emit();

		socket = io(resolveNotificationsUrl(), {
			auth: { token },
			// Le backend n'accepte que le transport WebSocket (pas de polling).
			transports: ["websocket"],
			reconnection: true,
		});
		attachSocketListeners(socket);
	}

	function disconnect(): void {
		if (!socket) return;
		socket.removeAllListeners();
		socket.disconnect();
		socket = null;
		status = "idle";
		connectedUser = null;
		emit();
	}

	/** Rejoue la connexion avec le token courant (après rotation du refresh). */
	function reconnectWithFreshToken(): void {
		if (!socket) return;
		const token = auth.getAccessToken();
		if (!token) {
			disconnect();
			return;
		}
		socket.auth = { token };
		if (socket.connected) {
			socket.disconnect();
		}
		socket.connect();
	}

	/**
	 * Reconnexion après refus serveur (`connect_error`, déconnexion initiée
	 * par le serveur) : le backend coupe les sockets à token manquant,
	 * invalide, révoqué ou expiré — on rafraîchit donc l'access token AVANT de
	 * retenter, pour ne jamais rejouer un token mort. Un refresh réussi
	 * déclenche déjà `reconnectWithFreshToken` via `subscribeTokenChange` ; on
	 * le rappelle explicitement pour couvrir le cas où le token n'a pas
	 * changé (réponse serveur idempotente) ou où le refresh est injoignable.
	 */
	async function recoverConnection(): Promise<void> {
		if (recovering || !socket) return;
		recovering = true;
		try {
			const refreshed = await auth.refresh();
			if (!socket || !auth.isAuthenticated) return;
			if (!refreshed) {
				// Refresh injoignable (coupure réseau ?) : tempo avant de
				// retenter — le token courant est peut-être encore valide.
				await new Promise((resolve) => setTimeout(resolve, 3000));
				if (!socket || !auth.isAuthenticated) return;
			}
			reconnectWithFreshToken();
		} finally {
			recovering = false;
		}
	}

	function syncWithAuth(): void {
		if (auth.isAuthenticated) {
			connect();
		} else {
			disconnect();
		}
	}

	auth.subscribe(syncWithAuth);
	auth.subscribeTokenChange(reconnectWithFreshToken);
	// Cas déjà authentifié à la création (ex. session restaurée avant que ce
	// client n'existe) : synchronise immédiatement.
	syncWithAuth();

	return {
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		getSnapshot() {
			return snapshot;
		},
		isRead(id) {
			return readIds.has(id);
		},
		markAsRead(id) {
			readIds.add(id);
			emit();
		},
		markAllAsRead() {
			for (const n of notifications) readIds.add(n.id);
			emit();
		},
		clearAll() {
			for (const n of notifications) clearedIds.add(n.id);
			emit();
		},
		refreshHistory() {
			socket?.emit("notifications:get_history");
		},
	};
}
