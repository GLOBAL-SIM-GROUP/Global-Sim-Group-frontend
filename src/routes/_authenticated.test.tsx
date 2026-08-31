import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthenticatedLayout } from "./_authenticated";

const mocks = vi.hoisted(() => ({
	navigate: vi.fn(),
	listeners: new Set<() => void>(),
	auth: {
		isAuthenticated: true,
		subscribe: (listener: () => void) => {
			mocks.listeners.add(listener);
			return () => mocks.listeners.delete(listener);
		},
	},
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		useRouteContext: () => ({ auth: mocks.auth, notifications: null }),
		useRouter: () => ({ navigate: mocks.navigate }),
		Outlet: () => null,
	};
});

vi.mock("#/components/layout/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="app-shell">{children}</div>
	),
}));

vi.mock("#/core/notifications", () => ({
	NotificationsProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

/**
 * `beforeLoad` ne protège que la NAVIGATION. Si le refresh silencieux échoue
 * pendant que l'utilisateur est déjà sur une page protégée (session expirée
 * en arrière-plan), rien ne redirigeait auparavant vers /login — l'utilisateur
 * restait sur une page cassée (401 en boucle) sans explication. Ce correctif
 * réagit à la transition authentifié → non-authentifié.
 */
describe("AuthenticatedLayout — expiration de session en arrière-plan", () => {
	beforeEach(() => {
		mocks.navigate.mockReset();
		mocks.listeners.clear();
		mocks.auth.isAuthenticated = true;
	});

	it("redirige vers /login avec expired=1 quand la session expire pendant le montage", () => {
		render(<AuthenticatedLayout />);

		expect(mocks.navigate).not.toHaveBeenCalled();

		act(() => {
			mocks.auth.isAuthenticated = false;
			for (const listener of mocks.listeners) listener();
		});

		expect(mocks.navigate).toHaveBeenCalledWith(
			expect.objectContaining({
				href: expect.stringContaining("/login?expired=1&next="),
				replace: true,
			}),
		);
	});

	it("ne redirige pas si la session reste authentifiée", () => {
		render(<AuthenticatedLayout />);

		act(() => {
			for (const listener of mocks.listeners) listener();
		});

		expect(mocks.navigate).not.toHaveBeenCalled();
	});
});
