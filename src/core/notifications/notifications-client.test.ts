import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "#/core/auth";
import { createNotificationsClient } from "./notifications-client";
import type { NotificationEnvelope } from "./types";

/**
 * Faux socket.io-client : pas de connexion réseau réelle en test. `io()` est
 * mocké pour retourner une instance contrôlable (déclenchement manuel des
 * événements serveur via `trigger`), et chaque instance créée est collectée
 * dans `createdSockets` pour inspection par les tests.
 */
const { createdSockets, mockIo } = vi.hoisted(() => {
	class FakeSocket {
		auth: unknown;
		connected = false;
		private handlers = new Map<string, Set<(...args: unknown[]) => void>>();
		emitted: { event: string; args: unknown[] }[] = [];

		constructor(opts: { auth: unknown }) {
			this.auth = opts.auth;
		}

		on(event: string, cb: (...args: unknown[]) => void) {
			if (!this.handlers.has(event)) this.handlers.set(event, new Set());
			this.handlers.get(event)?.add(cb);
			return this;
		}

		removeAllListeners() {
			this.handlers.clear();
			return this;
		}

		emit(event: string, ...args: unknown[]) {
			this.emitted.push({ event, args });
			return this;
		}

		connect() {
			this.connected = true;
			return this;
		}

		disconnect() {
			this.connected = false;
			this.trigger("disconnect", "io client disconnect");
			return this;
		}

		/** Simule un événement poussé par le serveur. */
		trigger(event: string, ...args: unknown[]) {
			if (event === "connect") this.connected = true;
			for (const cb of this.handlers.get(event) ?? []) cb(...args);
		}
	}

	const sockets: FakeSocket[] = [];
	const io = vi.fn((_url: string, opts: { auth: unknown }) => {
		const socket = new FakeSocket(opts);
		sockets.push(socket);
		return socket;
	});
	return { createdSockets: sockets, mockIo: io };
});

vi.mock("socket.io-client", () => ({ io: mockIo }));

function envelope(
	overrides: Partial<NotificationEnvelope> = {},
): NotificationEnvelope {
	return {
		id: overrides.id ?? "n1",
		event: overrides.event ?? "signalement.resolu",
		priority: overrides.priority ?? "MEDIUM",
		timestamp: overrides.timestamp ?? "2026-08-29T10:00:00.000Z",
		data: overrides.data ?? {},
		message: overrides.message ?? { title: "Titre", body: "Corps" },
		recipients: overrides.recipients ?? { rooms: [], userIds: [] },
	};
}

/** Fausse session d'auth : seuls les membres consommés par le client sont utiles. */
function createFakeAuth(initial: {
	isAuthenticated: boolean;
	token: string | null;
}) {
	let isAuthenticated = initial.isAuthenticated;
	let token = initial.token;
	const listeners = new Set<() => void>();
	const tokenListeners = new Set<() => void>();

	const auth: AuthSession = {
		get isAuthenticated() {
			return isAuthenticated;
		},
		user: null,
		login: vi.fn(),
		logout: vi.fn(),
		refresh: vi.fn(),
		restore: vi.fn(),
		handleSessionExpired: vi.fn(),
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot: () => ({ isAuthenticated, user: null }),
		getAccessToken: () => token,
		subscribeTokenChange(listener) {
			tokenListeners.add(listener);
			return () => tokenListeners.delete(listener);
		},
	};

	return {
		auth,
		setAuthenticated(next: boolean) {
			isAuthenticated = next;
			for (const listener of listeners) listener();
		},
		setToken(next: string | null) {
			token = next;
			for (const listener of tokenListeners) listener();
		},
	};
}

/** Fausse `localStorage` en mémoire — évite toute dépendance à l'environnement. */
function stubLocalStorage() {
	const store = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: (key: string) => {
			store.delete(key);
		},
		clear: () => {
			store.clear();
		},
	});
}

describe("createNotificationsClient", () => {
	beforeEach(() => {
		stubLocalStorage();
		createdSockets.length = 0;
		mockIo.mockClear();
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("se connecte immédiatement si déjà authentifié à la création", () => {
		const { auth } = createFakeAuth({ isAuthenticated: true, token: "tok-1" });
		createNotificationsClient(auth);

		expect(mockIo).toHaveBeenCalledTimes(1);
		const [url, opts] = mockIo.mock.calls[0];
		expect(url).toContain("/notifications");
		expect(opts).toMatchObject({ auth: { token: "tok-1" } });
	});

	it("ne se connecte pas tant que non authentifié", () => {
		const { auth } = createFakeAuth({ isAuthenticated: false, token: null });
		const client = createNotificationsClient(auth);

		expect(mockIo).not.toHaveBeenCalled();
		expect(client.getSnapshot().status).toBe("idle");
	});

	it("redemande l'historique dès la connexion (filet de sécurité)", () => {
		const { auth } = createFakeAuth({ isAuthenticated: true, token: "tok-1" });
		createNotificationsClient(auth);
		const socket = createdSockets[0];

		socket.trigger("connect");

		expect(
			socket.emitted.some((e) => e.event === "notifications:get_history"),
		).toBe(true);
	});

	it("peuple la liste depuis notifications:history, triée du plus récent au plus ancien", () => {
		const { auth } = createFakeAuth({ isAuthenticated: true, token: "tok-1" });
		const client = createNotificationsClient(auth);
		const socket = createdSockets[0];

		socket.trigger("connect");
		socket.trigger("notifications:history", [
			envelope({ id: "old", timestamp: "2026-08-29T08:00:00.000Z" }),
			envelope({ id: "new", timestamp: "2026-08-29T09:00:00.000Z" }),
		]);

		const snapshot = client.getSnapshot();
		expect(snapshot.status).toBe("connected");
		expect(snapshot.notifications.map((n) => n.id)).toEqual(["new", "old"]);
		expect(snapshot.unreadCount).toBe(2);
	});

	it("ajoute une notification live sans dupliquer l'historique existant", () => {
		const { auth } = createFakeAuth({ isAuthenticated: true, token: "tok-1" });
		const client = createNotificationsClient(auth);
		const socket = createdSockets[0];

		socket.trigger("connect");
		socket.trigger("notifications:history", [
			envelope({ id: "a", timestamp: "2026-08-29T08:00:00.000Z" }),
		]);
		socket.trigger(
			"notification",
			envelope({ id: "b", timestamp: "2026-08-29T09:00:00.000Z" }),
		);

		expect(client.getSnapshot().notifications.map((n) => n.id)).toEqual([
			"b",
			"a",
		]);

		// Renvoi redondant du même id (ex. après un refetch d'historique) : pas de doublon.
		socket.trigger(
			"notification",
			envelope({ id: "b", timestamp: "2026-08-29T09:00:00.000Z" }),
		);
		expect(client.getSnapshot().notifications).toHaveLength(2);
	});

	it("markAsRead / markAllAsRead pilotent le compteur non-lu", () => {
		const { auth } = createFakeAuth({ isAuthenticated: true, token: "tok-1" });
		const client = createNotificationsClient(auth);
		const socket = createdSockets[0];

		socket.trigger("connect");
		socket.trigger("notifications:history", [
			envelope({ id: "a" }),
			envelope({ id: "b", timestamp: "2026-08-29T11:00:00.000Z" }),
		]);
		expect(client.getSnapshot().unreadCount).toBe(2);

		client.markAsRead("a");
		expect(client.isRead("a")).toBe(true);
		expect(client.getSnapshot().unreadCount).toBe(1);

		client.markAllAsRead();
		expect(client.getSnapshot().unreadCount).toBe(0);
	});

	it("reconnecte avec un token frais sur rotation du token", () => {
		const { auth, setToken } = createFakeAuth({
			isAuthenticated: true,
			token: "ancien",
		});
		createNotificationsClient(auth);
		const socket = createdSockets[0];
		socket.trigger("connect");
		expect(socket.connected).toBe(true);

		const disconnectSpy = vi.spyOn(socket, "disconnect");
		const connectSpy = vi.spyOn(socket, "connect");

		setToken("frais");

		expect(socket.auth).toEqual({ token: "frais" });
		expect(disconnectSpy).toHaveBeenCalledTimes(1);
		expect(connectSpy).toHaveBeenCalledTimes(1);
	});

	it("déconnecte quand la session n'est plus authentifiée", () => {
		const { auth, setAuthenticated } = createFakeAuth({
			isAuthenticated: true,
			token: "tok-1",
		});
		const client = createNotificationsClient(auth);
		const socket = createdSockets[0];
		socket.trigger("connect");

		const disconnectSpy = vi.spyOn(socket, "disconnect");
		setAuthenticated(false);

		expect(disconnectSpy).toHaveBeenCalledTimes(1);
		expect(client.getSnapshot().status).toBe("idle");
	});

	it("ne se connecte pas sans token même si isAuthenticated est vrai", () => {
		const { auth } = createFakeAuth({ isAuthenticated: true, token: null });
		const client = createNotificationsClient(auth);

		expect(mockIo).not.toHaveBeenCalled();
		expect(client.getSnapshot().status).toBe("idle");
	});
});
