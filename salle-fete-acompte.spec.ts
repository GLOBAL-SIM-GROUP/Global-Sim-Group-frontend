import { expect, type Page, test } from "@playwright/test";

/**
 * Régression « acompte salle de fête » — API entièrement mockée via
 * `page.route` : on vérifie ce que le frontend ENVOIE réellement sur le wire.
 *
 * Bug rapporté : un acompte saisi à la création n'était pas pris en compte
 * (le dialog « Confirmer » ne proposait pas l'acompte). Deux causes :
 *  1. `CreerReservationFeteDto` n'a pas de champ `acompte` → la création le
 *     perdait silencieusement (le fix le reporte via PATCH post-création).
 *  2. Le dialog Confirmer pré-remplissait `montant` avec `solde` au lieu de
 *     `acompte` — l'acompte convenu.
 */
const BASE = "http://localhost:3001";

const RESERVATION_RESERVEE = {
	id_reservation: "7",
	id_client: "3",
	nom_client: "KONE Fatou",
	date_evenement: "2026-12-24",
	heure_debut: "18:00",
	duree: 5,
	type_manifestation: "Mariage",
	tarif: "200000.00",
	acompte: "50000.00",
	solde: "150000.00",
	statut: "RESERVEE",
	observations: null,
};

interface CorpsCapture {
	methode: string;
	url: string;
	body: Record<string, unknown> | null;
}

/** Installe le mock API complet et retourne la liste des corps POST/PATCH capturés. */
async function mockerApi(page: Page, captures: CorpsCapture[]) {
	await page.route("**/api/v1/**", async (route) => {
		const url = new URL(route.request().url());
		const path = url.pathname;
		const methode = route.request().method();
		const corps = route.request().postDataJSON() as Record<
			string,
			unknown
		> | null;
		if (methode === "POST" || methode === "PATCH" || methode === "PUT") {
			captures.push({ methode, url: path, body: corps });
		}
		const json = (payload: unknown) =>
			route.fulfill({ contentType: "application/json", json: payload });

		if (path.endsWith("/auth/me")) {
			return json({
				id: "1",
				login: "testeur",
				role: "ADMIN",
				idClient: null,
				permissions: [
					"SALLE_FETE.VOIR",
					"SALLE_FETE.CREER",
					"SALLE_FETE.MODIFIER",
					"SALLE_FETE.VALIDER",
					"FINANCES.VOIR",
					"FINANCES.ENCAISSER",
					"CLIENT.VOIR",
				],
			});
		}
		if (path.endsWith("/salle-fete/reservations") && methode === "GET") {
			return json([RESERVATION_RESERVEE]);
		}
		if (path.endsWith("/salle-fete/reservations") && methode === "POST") {
			return json({ id_reservation: "99", ...corps, statut: "RESERVEE" });
		}
		if (/\/salle-fete\/reservations\/\d+$/.test(path) && methode === "GET") {
			return json(RESERVATION_RESERVEE);
		}
		if (/\/salle-fete\/reservations\/\d+$/.test(path)) {
			return json({});
		}
		if (path.endsWith("/confirmer") || path.endsWith("/realiser")) {
			return json({});
		}
		if (path.includes("/client/clients")) {
			return json([
				{
					id_client: "3",
					nom: "KONE",
					prenoms: "Fatou",
					tel_principal: "90000000",
					tel_secondaire: null,
				},
			]);
		}
		if (path.endsWith("/finances/moyens-paiement")) {
			return json([{ id_moyen: "5", libelle: "Espèces", actif: true }]);
		}
		if (path.endsWith("/finances/caisses/accessibles")) {
			return json([
				{
					id_caisse: "1",
					libelle: "Caisse test",
					id_activite: "1",
					activite_libelle: "Salle de fête",
					ouverte: true,
					est_propre: true,
					utilisateur: null,
				},
			]);
		}
		return json([]);
	});
}

async function sessionAuthentifiee(page: Page) {
	await page.addInitScript(() => {
		localStorage.setItem(
			"sim.tokens",
			JSON.stringify({
				accessToken: "fake-access-token",
				accessExpiresIn: 86_400,
				refreshToken: "fake-refresh-token",
				refreshExpiresIn: 2_592_000,
			}),
		);
	});
}

test.describe("Salle de fête — acompte de réservation", () => {
	test("la création envoie l'acompte saisi (POST puis PATCH de report)", async ({
		page,
	}) => {
		const captures: CorpsCapture[] = [];
		await sessionAuthentifiee(page);
		await mockerApi(page, captures);

		await page.goto(`${BASE}/salle-fete/reservations`, {
			waitUntil: "domcontentloaded",
		});
		await page
			.getByRole("button", { name: "Nouvelle réservation" })
			.waitFor();

		await page.getByRole("button", { name: "Nouvelle réservation" }).click();

		// Client : recherche → sélection dans la liste déroulante.
		await page.locator("#client-recherche").fill("KONE");
		await page.getByRole("button", { name: /KONE Fatou/ }).click();

		await page.locator("#dateEvenement").fill("2026-12-24");
		await page.locator("#heureDebut").fill("18:00");
		await page.locator("#duree").fill("5");
		await page.locator("#typeManifestation").fill("Anniversaire");
		await page.locator("#tarif").fill("200000");
		await page.locator("#acompte").fill("50000");

		await page
			.getByRole("button", { name: "Enregistrer" })
			.click();
		await page.waitForTimeout(800);

		const post = captures.find(
			(c) => c.methode === "POST" && c.url.endsWith("/salle-fete/reservations"),
		);
		const patch = captures.find((c) => c.methode === "PATCH");
		// L'acompte doit survivre à la création : dans le POST directement, ou
		// reporté via PATCH juste après (le DTO de création n'a pas ce champ).
		const montantOk = (v: unknown) =>
			typeof v === "string" && /^50000(\.0+)?$/.test(v);
		const acomptePersiste =
			montantOk(post?.body?.acompte) || montantOk(patch?.body?.acompte);
		expect(
			acomptePersiste,
			`acompte absent du wire — POST=${JSON.stringify(post?.body)} PATCH=${JSON.stringify(patch?.body)}`,
		).toBe(true);
	});

	test("le dialog Confirmer pré-remplit l'acompte convenu, pas le solde", async ({
		page,
	}) => {
		const captures: CorpsCapture[] = [];
		await sessionAuthentifiee(page);
		await mockerApi(page, captures);

		await page.goto(`${BASE}/salle-fete/reservations`, {
			waitUntil: "domcontentloaded",
		});

		// Action « Confirmer (encaisser l'acompte) » sur la ligne RESERVEE.
		const boutonConfirmer = page.getByTitle("Confirmer (encaisser l'acompte)");
		await boutonConfirmer.waitFor();
		await boutonConfirmer.click();

		// Le montant proposé doit être l'acompte (50000.00), pas le solde (150000.00).
		await expect(page.locator("#paie-montant")).toHaveValue(
			/^50000(\.0+)?$/,
		);
	});

	test("le type de manifestation vient du catalogue (hors_catalogue=false)", async ({
		page,
	}) => {
		const captures: CorpsCapture[] = [];
		await sessionAuthentifiee(page);
		await mockerApi(page, captures);
		// Enregistré après le catch-all → prioritaire (Playwright : dernier gagne).
		await page.route("**/salle-fete/catalogue", (route) =>
			route.fulfill({
				contentType: "application/json",
				json: [
					{ id_type_manifestation: "1", libelle: "Mariage", actif: true },
					{ id_type_manifestation: "2", libelle: "Anniversaire", actif: true },
					{ id_type_manifestation: "3", libelle: "Type inactif", actif: false },
				],
			}),
		);

		await page.goto(`${BASE}/salle-fete/reservations`, {
			waitUntil: "domcontentloaded",
		});
		await page
			.getByRole("button", { name: "Nouvelle réservation" })
			.waitFor();
		await page.getByRole("button", { name: "Nouvelle réservation" }).click();

		// Le champ devient un Select alimenté par le catalogue (actifs seuls).
		const selectType = page.locator("#typeManifestation");
		await selectType.waitFor();
		await selectType.click();
		await expect(
			page.getByRole("option", { name: "Type inactif" }),
		).toHaveCount(0);
		await page.getByRole("option", { name: "Anniversaire" }).click();

		await page.locator("#client-recherche").fill("KONE");
		await page.getByRole("button", { name: /KONE Fatou/ }).click();
		await page.locator("#dateEvenement").fill("2026-12-24");
		await page.locator("#heureDebut").fill("18:00");
		await page.locator("#duree").fill("5");
		await page.locator("#tarif").fill("200000");
		await page.getByRole("button", { name: "Enregistrer" }).click();
		await page.waitForTimeout(800);

		const post = captures.find(
			(c) => c.methode === "POST" && c.url.endsWith("/salle-fete/reservations"),
		);
		expect(post?.body?.type_manifestation).toBe("Anniversaire");
		expect(post?.body?.hors_catalogue).toBe(false);
	});
});
