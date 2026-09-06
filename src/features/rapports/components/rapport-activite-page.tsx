import { Link } from "@tanstack/react-router";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { usePayeursLoyer } from "#/features/finances/hooks/use-finances";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { rapportExcelPath, rapportPdfPath } from "../api/rapports";
import { useRapportActivite } from "../hooks/use-rapports";
import { imprimerPdf, telechargerExcel, telechargerTexte } from "../lib/export";
import {
	construireCsv,
	libelleIndicateur,
	libelleStatutIndicateur,
	periodeParDefaut,
	type RapportPeriodeSearch,
} from "../models/rapports";

const CLES_MONTANT = new Set([
	"ca",
	"loyers_percus",
	"recettes",
	"montant",
	"total_encaisse",
]);

interface RapportActivitePageProps {
	/** Code d'activité (paramètre `$code` de la route). */
	code: string;
	initialSearch: RapportPeriodeSearch;
}

/**
 * Page « Rapport par activité » (M10) : recettes, nombre d'opérations et
 * indicateurs propres à l'activité sur la période.
 */
export function RapportActivitePage({
	code,
	initialSearch,
}: RapportActivitePageProps) {
	const periode = periodeParDefaut(initialSearch);
	const rapportQuery = useRapportActivite(code, periode.du, periode.au);
	const [pdfError, setPdfError] = useState(false);

	// « Qui a payé son loyer sur la période » : donnée nominative absente de
	// `/rapports/activites/{code}` (qui n'a que des agrégats) — seul
	// `/finances/tableau-de-bord` l'expose (`payeurs_loyer`). Résidence
	// uniquement : ça n'a de sens pour aucune autre activité.
	const estResidence = code === "LOCATION_RESIDENTIEL";
	const payeursQuery = usePayeursLoyer(periode.du, periode.au, estResidence);

	const imprimerRapportPdf = async () => {
		setPdfError(false);
		try {
			await imprimerPdf(
				rapportPdfPath(
					`/api/v1/rapports/activites/${code}`,
					periode.du,
					periode.au,
				),
			);
		} catch {
			setPdfError(true);
		}
	};

	const exporterExcel = async () => {
		setPdfError(false);
		try {
			await telechargerExcel(
				rapportExcelPath(
					`/api/v1/rapports/activites/${code}`,
					periode.du,
					periode.au,
				),
				`rapport-${code}-${periode.du}-${periode.au}.xlsx`,
			);
		} catch {
			setPdfError(true);
		}
	};

	/**
	 * Lignes du rapport — base commune de l'export CSV. N'alimente PAS
	 * l'export PDF/Excel (ceux-là sont générés côté backend directement à
	 * partir de `/rapports/activites/{code}`, qui n'a pas les payeurs) —
	 * seul le CSV, construit ici côté client, peut les inclure.
	 */
	const construireLignes = (): (string | number)[][] => {
		if (!rapportQuery.data) return [];
		const { libelle, recettes, nombre_operations, indicateurs } =
			rapportQuery.data;
		const lignes: (string | number)[][] = [
			["Période", `${periode.du} → ${periode.au}`],
			["Activité", libelle],
			["Recettes", recettes],
			["Nombre d'opérations", nombre_operations],
			[],
			["Indicateur", "Valeur"],
			...Object.entries(indicateurs).map(([cle, valeur]) => [
				libelleIndicateur(cle),
				typeof valeur === "object" ? JSON.stringify(valeur) : valeur,
			]),
		];
		if (estResidence && payeursQuery.data && payeursQuery.data.length > 0) {
			lignes.push(
				[],
				["Locataires ayant payé leur loyer sur la période"],
				["Locataire", "Contrat", "Date", "Montant"],
				...payeursQuery.data.map((payeur) => [
					`${payeur.nom} ${payeur.prenoms}`.trim(),
					payeur.numero_contrat,
					formatDateISO(payeur.date),
					payeur.montant,
				]),
			);
		}
		return lignes;
	};

	const exporter = () => {
		const lignes = construireLignes();
		if (lignes.length === 0) return;
		telechargerTexte(
			`rapport-${code}-${periode.du}-${periode.au}.csv`,
			construireCsv(lignes),
		);
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Rapports", to: "/rapports" },
					{ label: rapportQuery.data?.libelle ?? code },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Rapport — {rapportQuery.data?.libelle ?? code}
					</h1>
					<p className="text-muted-foreground">
						Période du {periode.du} au {periode.au}.
					</p>
				</section>
				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto justify-center"
					>
						<Link to="/rapports">Nouveau rapport</Link>
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => void imprimerRapportPdf()}
						disabled={!rapportQuery.data}
						className="w-full sm:w-auto justify-center"
					>
						<Printer className="size-4" aria-hidden />
						PDF
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={exporterExcel}
						disabled={!rapportQuery.data}
						className="w-full sm:w-auto justify-center"
					>
						<FileDown className="size-4" aria-hidden />
						Excel
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={exporter}
						disabled={!rapportQuery.data}
						className="w-full sm:w-auto justify-center"
					>
						<FileSpreadsheet className="size-4" aria-hidden />
						CSV
					</Button>
				</div>
			</div>

			{pdfError ? (
				<p
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					Export PDF indisponible pour le moment (le serveur renvoie une
					erreur).
				</p>
			) : null}

			{rapportQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : rapportQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger le rapport.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void rapportQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : rapportQuery.data ? (
				<>
					<section className="grid grid-cols-2 gap-3 md:grid-cols-3">
						<div className="rounded-lg border border-border bg-sea-ink/5 p-3">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Recettes
							</p>
							<p className="mt-1 text-lg font-semibold text-[#27AE60]">
								{formatMontantFCFA(rapportQuery.data.recettes)}
							</p>
						</div>
						<div className="rounded-lg border border-border bg-sea-ink/5 p-3">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Opérations
							</p>
							<p className="mt-1 text-lg font-semibold text-foreground">
								{rapportQuery.data.nombre_operations}
							</p>
						</div>
					</section>

					<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-foreground">
							Indicateurs de l'activité
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							{Object.entries(rapportQuery.data.indicateurs).map(
								([cle, valeur]) => (
									<div
										key={cle}
										className="rounded-lg border border-border bg-sea-ink/5 p-3"
									>
										<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
											{libelleIndicateur(cle)}
										</p>
										<div className="mt-1">
											<ValeurIndicateur cle={cle} valeur={valeur} />
										</div>
									</div>
								),
							)}
						</div>
					</section>

					{estResidence ? (
						<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
							<h2 className="text-lg font-semibold text-foreground">
								Locataires ayant payé leur loyer sur la période
							</h2>
							{payeursQuery.isLoading ? (
								<p className="text-sm text-muted-foreground">Chargement…</p>
							) : payeursQuery.isError ? (
								<p className="text-sm text-destructive">
									Impossible de charger la liste des paiements.
								</p>
							) : !payeursQuery.data || payeursQuery.data.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Aucun paiement de loyer enregistré sur cette période.
								</p>
							) : (
								<div className="overflow-x-auto rounded-lg border border-border">
									<table className="w-full text-sm">
										<thead className="bg-muted">
											<tr>
												<th className="px-4 py-2 text-left font-semibold">
													Locataire
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Contrat
												</th>
												<th className="px-4 py-2 text-left font-semibold">
													Date
												</th>
												<th className="px-4 py-2 text-right font-semibold">
													Montant
												</th>
											</tr>
										</thead>
										<tbody>
											{payeursQuery.data.map((payeur) => (
												<tr
													key={payeur.id_paiement}
													className="border-t border-border"
												>
													<td className="px-4 py-2 font-medium text-foreground">
														{`${payeur.nom} ${payeur.prenoms}`.trim()}
													</td>
													<td className="px-4 py-2 text-muted-foreground">
														{payeur.numero_contrat}
													</td>
													<td className="px-4 py-2 text-muted-foreground">
														{formatDateISO(payeur.date)}
													</td>
													<td className="px-4 py-2 text-right font-medium text-[#27AE60]">
														{formatMontantFCFA(payeur.montant)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</section>
					) : null}
				</>
			) : null}
		</div>
	);
}

function ValeurIndicateur({
	cle,
	valeur,
}: {
	cle: string;
	valeur: string | number | Record<string, string | number>;
}) {
	if (typeof valeur === "object" && valeur !== null) {
		if (cle === "par_statut") {
			return (
				<div className="space-y-1">
					{Object.entries(valeur).map(([statut, nombre]) => (
						<p key={statut} className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								{libelleStatutIndicateur(statut)}
							</span>
							<span className="font-medium text-foreground">
								{String(nombre)}
							</span>
						</p>
					))}
				</div>
			);
		}
		if (cle === "impayes" && "nombre" in valeur) {
			return (
				<p className="text-sm text-foreground">
					{valeur.nombre} · {formatMontantFCFA(String(valeur.montant))}
				</p>
			);
		}
		if (cle === "top_produit" && "nom" in valeur) {
			return (
				<p className="text-sm text-foreground">
					{valeur.nom} · {formatMontantFCFA(String(valeur.ca))}
				</p>
			);
		}
		return (
			<p className="text-xs text-muted-foreground">{JSON.stringify(valeur)}</p>
		);
	}
	const brut = String(valeur);
	const affichage = CLES_MONTANT.has(cle) ? formatMontantFCFA(brut) : brut;
	return <p className="text-sm font-medium text-foreground">{affichage}</p>;
}
