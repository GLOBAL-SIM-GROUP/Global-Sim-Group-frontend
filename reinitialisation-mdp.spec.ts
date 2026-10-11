import { expect, test } from "@playwright/test";

/**
 * Flux « mot de passe oublié » (client ET résident — même endpoints
 * `POST /auth/mot-de-passe-oublie` + `POST /auth/reinitialiser-mot-de-passe`,
 * partagés par les deux rôles). Le dev server proxifie `/api/v1` vers le
 * backend de dev : les appels sont réels.
 *
 * Comportements backend vérifiés en direct (2026-10-10) :
 * - login inconnu → 400 « Compte inconnu ou inactif : <login> » (pas
 *   d'anti-énumération — choix assumé, outil interne)
 * - login connu → 200 `{ envoye: true }`
 * - jeton invalide → 400 « Jeton invalide ou expiré »
 * - admin `POST /admin/utilisateurs/{id}/reinitialiser-mot-de-passe` → 201
 *   `{ reinitialise: true }`, révoque les sessions (ancien mdp → 401)
 *
 * La page de réinitialisation sert aussi le lien « définir mon mot de
 * passe » envoyé à la création d'un compte résident — même jeton.
 */
const BASE = process.env.PW_BASE_URL ?? "http://localhost:3001";

test.describe("Réinitialisation du mot de passe — flux public", () => {
	test("le lien « Mot de passe oublié ? » mène de /login au formulaire", async ({
		page,
	}) => {
		// Pas de `networkidle` ici : la page login garde le canal Socket.IO
		// ouvert, le réseau n'est jamais inactif.
		await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
		await page.getByRole("link", { name: /mot de passe oublié/i }).click();
		await expect(page).toHaveURL(/\/mot-de-passe-oublie/);
		await expect(
			page.getByRole("button", {
				name: /envoyer le lien de réinitialisation/i,
			}),
		).toBeVisible();
	});

	test("login inconnu → message d'erreur du backend affiché", async ({
		page,
	}) => {
		await page.goto(`${BASE}/mot-de-passe-oublie`, {
			waitUntil: "networkidle",
		});
		await page.getByLabel(/identifiant/i).fill("inconnu.totalement.pw");
		await page
			.getByRole("button", {
				name: /envoyer le lien de réinitialisation/i,
			})
			.click();
		await expect(
			page.getByRole("alert").filter({ hasText: /compte inconnu/i }),
		).toBeVisible();
	});

	test("login connu → confirmation d'envoi de l'email", async ({ page }) => {
		await page.goto(`${BASE}/mot-de-passe-oublie`, {
			waitUntil: "networkidle",
		});
		await page.getByLabel(/identifiant/i).fill("resident");
		await page
			.getByRole("button", {
				name: /envoyer le lien de réinitialisation/i,
			})
			.click();
		await expect(page.getByText(/un email a été envoyé/i)).toBeVisible();
		await expect(
			page.getByRole("link", { name: /retour à la connexion/i }),
		).toBeVisible();
	});

	test("/reinitialiser-mot-de-passe sans token → état « lien invalide »", async ({
		page,
	}) => {
		await page.goto(`${BASE}/reinitialiser-mot-de-passe`, {
			waitUntil: "networkidle",
		});
		await expect(
			page.getByRole("alert").filter({ hasText: /n'est plus valide/i }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /demander un nouveau lien/i }),
		).toHaveAttribute("href", "/mot-de-passe-oublie");
	});

	test("validation locale : mot de passe trop court et confirmation différente", async ({
		page,
	}) => {
		await page.goto(`${BASE}/reinitialiser-mot-de-passe?token=faux-token`, {
			waitUntil: "networkidle",
		});
		await page
			.getByLabel(/nouveau mot de passe/i)
			.fill("court");
		await page.getByLabel(/confirmer le mot de passe/i).fill("autre");
		await page
			.getByRole("button", { name: /réinitialiser le mot de passe/i })
			.click();
		await expect(page.getByText(/minimum 8 caractères/i)).toBeVisible();
		await expect(
			page.getByText(/ne correspondent pas/i),
		).toBeVisible();
	});

	test("token invalide → erreur + lien vers une nouvelle demande", async ({
		page,
	}) => {
		await page.goto(`${BASE}/reinitialiser-mot-de-passe?token=faux-token`, {
			waitUntil: "networkidle",
		});
		await page
			.getByLabel(/nouveau mot de passe/i)
			.fill("NouveauMot8!");
		await page.getByLabel(/confirmer le mot de passe/i).fill("NouveauMot8!");
		await page
			.getByRole("button", { name: /réinitialiser le mot de passe/i })
			.click();
		await expect(
			page.getByRole("alert").filter({ hasText: /n'est plus valide/i }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /demander un nouveau lien/i }),
		).toBeVisible();
	});
});
