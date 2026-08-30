import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAuthSession } from "./session";
import type { StoredTokens } from "./token-store";

/** Mock fetch : `/api/v1/auth/refresh` et `/api/v1/auth/me` répondent 200. */
function stubFetch() {
	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: RequestInfo | URL) => {
			if (String(input).includes("/auth/refresh")) {
				return new Response(
					JSON.stringify({
						accessToken: "nouveau-access",
						accessExpiresIn: 900,
						refreshToken: "nouveau-refresh",
						refreshExpiresIn: 604800,
						utilisateur: { id: "2", login: "admin", role: "ADMINISTRATEUR" },
					}),
					{ status: 200, headers: { "content-type": "application/json" } },
				);
			}
			if (String(input).includes("/auth/me")) {
				return new Response(
					JSON.stringify({
						id: "2",
						login: "admin",
						role: "ADMINISTRATEUR",
						permissions: [],
					}),
					{ status: 200, headers: { "content-type": "application/json" } },
				);
			}
			return new Response("{}", {
				status: 404,
				headers: { "content-type": "application/json" },
			});
		}),
	);
}

const tokens: StoredTokens = {
	accessToken: "ancien-access",
	accessExpiresIn: 900,
	refreshToken: "refresh-1",
	refreshExpiresIn: 604800,
};

describe("createAuthSession — refresh", () => {
	beforeEach(() => {
		stubFetch();
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("déduplique les rafraîchissements concurrents (un seul appel API)", async () => {
		const session = createAuthSession({
			tokenStorage: {
				get: () => tokens,
				set: () => {},
				clear: () => {},
			},
		});

		// Le refresh planifié et le refresh déclenché par un 401 peuvent partir
		// ensemble : le backend révoque la session si un refresh token est rejoué.
		const [r1, r2] = await Promise.all([session.refresh(), session.refresh()]);
		expect(r1).toBe(true);
		expect(r2).toBe(true);

		const refreshCalls = vi
			.mocked(fetch)
			.mock.calls.filter(([input]) => String(input).includes("/auth/refresh"));
		expect(refreshCalls).toHaveLength(1);
	});

	it("retourne false sans tokens (session expirée)", async () => {
		const session = createAuthSession({
			tokenStorage: {
				get: () => null,
				set: () => {},
				clear: () => {},
			},
		});
		expect(await session.refresh()).toBe(false);
	});
});

describe("createAuthSession — sync inter-onglets", () => {
	beforeEach(() => {
		stubFetch();
	});
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("sollicite navigator.locks quand disponible (sérialisation inter-onglets)", async () => {
		const lockRequest = vi.fn((_name: string, cb: () => Promise<unknown>) =>
			cb(),
		);
		vi.stubGlobal("navigator", { locks: { request: lockRequest } });

		const session = createAuthSession({
			tokenStorage: { get: () => tokens, set: () => {}, clear: () => {} },
		});
		await session.refresh();

		expect(lockRequest).toHaveBeenCalledWith(
			"sim-auth-refresh",
			expect.any(Function),
		);
	});

	it("adopte les tokens déjà rafraîchis par un autre onglet sans rejouer l'ancien refresh token", async () => {
		vi.stubGlobal("navigator", {
			locks: { request: (_name: string, cb: () => Promise<unknown>) => cb() },
		});

		const tokensRafraichisAilleurs: StoredTokens = {
			accessToken: "access-autre-onglet",
			accessExpiresIn: 900,
			refreshToken: "refresh-autre-onglet",
			refreshExpiresIn: 604800,
		};
		// 1er appel (avant le verrou) : ancien token. À l'intérieur du verrou :
		// un autre onglet a déjà tourné le refresh token entre-temps.
		let appel = 0;
		const session = createAuthSession({
			tokenStorage: {
				get: () => (appel++ === 0 ? tokens : tokensRafraichisAilleurs),
				set: () => {},
				clear: () => {},
			},
		});

		expect(await session.refresh()).toBe(true);

		const refreshCalls = vi
			.mocked(fetch)
			.mock.calls.filter(([input]) => String(input).includes("/auth/refresh"));
		expect(refreshCalls).toHaveLength(0);
	});

	it("un logout dans un autre onglet (tokens purgés) déconnecte aussi cet onglet", async () => {
		let stored: StoredTokens | null = tokens;
		const session = createAuthSession({
			tokenStorage: {
				get: () => stored,
				set: (next) => {
					stored = next;
				},
				clear: () => {
					stored = null;
				},
			},
		});

		await session.restore();
		expect(session.isAuthenticated).toBe(true);

		// Un autre onglet vient de se déconnecter : il a purgé le storage puis
		// déclenché l'événement `storage` (celui-ci ne se déclenche jamais dans
		// l'onglet auteur du changement — on le simule ici pour cet onglet-ci).
		stored = null;
		window.dispatchEvent(
			new StorageEvent("storage", { key: "sim.tokens", newValue: null }),
		);

		expect(session.isAuthenticated).toBe(false);
	});
});
