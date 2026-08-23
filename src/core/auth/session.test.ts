import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAuthSession } from "./session";
import type { StoredTokens } from "./token-store";

/** Mock fetch : seul `/api/v1/auth/refresh` répond 200 (rotation réussie). */
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
