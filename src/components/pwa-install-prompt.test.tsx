import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PwaInstallPrompt } from "./pwa-install-prompt";

/**
 * Émet un `beforeinstallprompt` factice — l'événement natif n'existe pas
 * en jsdom ; on attache les membres Chromium (`prompt`, `userChoice`)
 * directement sur l'Event avant dispatch.
 */
function emitBeforeInstallPrompt() {
	const event = new Event("beforeinstallprompt", { cancelable: true });
	const pwaEvent = Object.assign(event, {
		prompt: vi.fn().mockResolvedValue(undefined),
		userChoice: Promise.resolve({ outcome: "accepted" as const }),
	});
	act(() => {
		window.dispatchEvent(pwaEvent);
	});
	return pwaEvent;
}

function emitAppInstalled() {
	act(() => {
		window.dispatchEvent(new Event("appinstalled"));
	});
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("PwaInstallPrompt", () => {
	it("n'affiche rien tant que beforeinstallprompt n'est pas émis", () => {
		render(<PwaInstallPrompt />);

		expect(screen.queryByText("Installer SIM")).toBeNull();
	});

	it("affiche la bannière quand beforeinstallprompt est émis (et empêche l'infobar native)", () => {
		render(<PwaInstallPrompt />);

		const event = emitBeforeInstallPrompt();

		expect(screen.getByText("Installer SIM")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Installer" }),
		).toBeInTheDocument();
		// preventDefault() doit avoir été appelé : l'événement annulable
		// se retrouve `defaultPrevented`.
		expect(event.defaultPrevented).toBe(true);
	});

	it("déclenche le dialogue natif au clic sur Installer, puis masque la bannière", async () => {
		const user = userEvent.setup();
		render(<PwaInstallPrompt />);

		const event = emitBeforeInstallPrompt();
		await user.click(screen.getByRole("button", { name: "Installer" }));

		await waitFor(() => expect(event.prompt).toHaveBeenCalledOnce());
		expect(screen.queryByText("Installer SIM")).toBeNull();
	});

	it("masque la bannière quand l'app vient d'être installée (appinstalled)", () => {
		render(<PwaInstallPrompt />);

		emitBeforeInstallPrompt();
		expect(screen.getByText("Installer SIM")).toBeInTheDocument();

		emitAppInstalled();

		expect(screen.queryByText("Installer SIM")).toBeNull();
	});

	it("masque la bannière à la fermeture pour la vue courante", async () => {
		const user = userEvent.setup();
		render(<PwaInstallPrompt />);

		emitBeforeInstallPrompt();
		await user.click(screen.getByRole("button", { name: "Fermer" }));

		expect(screen.queryByText("Installer SIM")).toBeNull();
	});

	it("re-propose l'installation à la visite suivante après désinstallation", () => {
		// 1re visite : installable → bannière → installation confirmée.
		const premiereVisite = render(<PwaInstallPrompt />);
		emitBeforeInstallPrompt();
		emitAppInstalled();
		expect(screen.queryByText("Installer SIM")).toBeNull();
		premiereVisite.unmount();

		// App désinstallée + nouvelle visite (composant remonté) : le
		// navigateur réémet beforeinstallprompt → la bannière réapparaît.
		render(<PwaInstallPrompt />);
		emitBeforeInstallPrompt();

		expect(screen.getByText("Installer SIM")).toBeInTheDocument();
	});

	it("re-propose si le dialogue natif est refusé puis l'événement réémis", async () => {
		const user = userEvent.setup();
		render(<PwaInstallPrompt />);

		emitBeforeInstallPrompt();
		await user.click(screen.getByRole("button", { name: "Installer" }));
		// Refus côté dialogue natif : pas d'appinstalled, bannière masquée.
		await waitFor(() => expect(screen.queryByText("Installer SIM")).toBeNull());

		// Chrome réémet beforeinstallprompt au chargement suivant tant que
		// l'app n'est pas installée → la bannière doit revenir.
		emitBeforeInstallPrompt();

		expect(screen.getByText("Installer SIM")).toBeInTheDocument();
	});

	it("n'affiche rien en display-mode standalone (app déjà installée)", () => {
		vi.spyOn(window, "matchMedia").mockImplementation(
			(query: string) =>
				({
					matches: query.includes("standalone"),
					media: query,
					onchange: null,
					addListener: () => {},
					removeListener: () => {},
					addEventListener: () => {},
					removeEventListener: () => {},
					dispatchEvent: () => false,
				}) as MediaQueryList,
		);
		render(<PwaInstallPrompt />);

		emitBeforeInstallPrompt();

		expect(screen.queryByText("Installer SIM")).toBeNull();
	});
});
