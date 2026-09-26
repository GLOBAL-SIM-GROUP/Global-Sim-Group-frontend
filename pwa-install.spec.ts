import { expect, type Page, test } from "@playwright/test";

/**
 * Test PWA contre la production déployée (pas de serveur local requis).
 *
 * Playwright ne peut pas installer/désinstaller réellement une PWA — ce
 * test vérifie la chaîne observable côté navigateur : enregistrement du
 * service worker, réaction de la bannière à `beforeinstallprompt`
 * (événement synthétique fidèle à l'API Chromium : preventDefault +
 * prompt/userChoice), disparition sur `appinstalled`, et re-proposition
 * après un « cycle » installation → désinstallation → rechargement.
 */
const BASE_URL = "https://sim.strife-cyber.org";

/** Émet un `beforeinstallprompt` synthétique complet (comme Chromium). */
function emitBeforeInstallPrompt(page: Page) {
	return page.evaluate(() => {
		const event = new Event("beforeinstallprompt", { cancelable: true });
		Object.assign(event, {
			prompt: () => Promise.resolve(),
			userChoice: Promise.resolve({ outcome: "accepted" as const }),
		});
		window.dispatchEvent(event);
	});
}

test.describe("PWA — bannière d'installation (prod)", () => {
	test("le service worker s'enregistre et est actif", async ({ page }) => {
		await page.goto(BASE_URL, { waitUntil: "networkidle" });

		const registration = await page.evaluate(async () => {
			const reg = await navigator.serviceWorker.getRegistration();
			return reg ? { scope: reg.scope, active: Boolean(reg.active) } : null;
		});

		expect(registration).not.toBeNull();
		expect(registration?.active).toBe(true);
		expect(registration?.scope).toBe(`${BASE_URL}/`);
	});

	test("la bannière apparaît sur beforeinstallprompt et se masque après installation", async ({
		page,
	}) => {
		// Trace l'événement natif avant le chargement (s'il est émis par le
		// navigateur lui-même, la bannière doit apparaître d'elle-même).
		await page.addInitScript(() => {
			(
				window as unknown as { __bipNatif: boolean }
			).__bipNatif = false;
			window.addEventListener("beforeinstallprompt", () => {
				(window as unknown as { __bipNatif: boolean }).__bipNatif = true;
			});
		});
		await page.goto(BASE_URL, { waitUntil: "networkidle" });

		// Attendre l'hydratation React (la bannière écoute côté client).
		await page.waitForTimeout(3000);
		const bipNatif = await page.evaluate(
			() => (window as unknown as { __bipNatif: boolean }).__bipNatif,
		);
		// eslint-disable-next-line no-console
		console.log(`beforeinstallprompt natif émis par le navigateur : ${bipNatif}`);

		// Si le navigateur ne l'a pas émis de lui-même, on simule l'événement
		// fidèlement — la bannière doit réagir dans les deux cas.
		if (!(await page.getByText("Installer SIM").isVisible())) {
			await emitBeforeInstallPrompt(page);
		}
		await expect(page.getByText("Installer SIM")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Installer" }),
		).toBeVisible();

		// Clic « Installer » → dialogue natif (stub) → bannière consommée.
		await page.getByRole("button", { name: "Installer" }).click();
		await expect(page.getByText("Installer SIM")).toBeHidden();

		// `appinstalled` confirme — la bannière ne doit plus jamais revenir,
		// même si un beforeinstallprompt tardif arrive encore.
		await page.evaluate(() =>
			window.dispatchEvent(new Event("appinstalled")),
		);
		await emitBeforeInstallPrompt(page);
		await expect(page.getByText("Installer SIM")).toBeHidden();
	});

	test("après désinstallation + rechargement, la proposition revient", async ({
		page,
	}) => {
		await page.goto(BASE_URL, { waitUntil: "networkidle" });
		await page.waitForTimeout(2000);

		// Installation simulée : bannière → installée → masquée.
		await emitBeforeInstallPrompt(page);
		await expect(page.getByText("Installer SIM")).toBeVisible();
		await page.evaluate(() =>
			window.dispatchEvent(new Event("appinstalled")),
		);
		await expect(page.getByText("Installer SIM")).toBeHidden();

		// Désinstallation + nouvelle visite : nouveau chargement, l'app
		// n'étant plus installée le navigateur réémet l'événement → retour
		// de la bannière (état local réinitialisé à chaque montage).
		await page.reload({ waitUntil: "networkidle" });
		await page.waitForTimeout(2000);
		await emitBeforeInstallPrompt(page);
		await expect(page.getByText("Installer SIM")).toBeVisible();

		// Fermeture : masquée pour la vue, mais re-proposée au rechargement
		// suivant tant que l'app n'est pas installée.
		await page.getByRole("button", { name: "Fermer" }).click();
		await expect(page.getByText("Installer SIM")).toBeHidden();
		await page.reload({ waitUntil: "networkidle" });
		await page.waitForTimeout(2000);
		await emitBeforeInstallPrompt(page);
		await expect(page.getByText("Installer SIM")).toBeVisible();
	});
});
