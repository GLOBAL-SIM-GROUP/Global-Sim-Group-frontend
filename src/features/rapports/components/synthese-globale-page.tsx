import { Link } from "@tanstack/react-router";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { rapportExcelPath, rapportPdfPath } from "../api/rapports";
import { useSyntheseGlobale } from "../hooks/use-rapports";
import {
	telechargerExcel,
	telechargerPdf,
	telechargerTexte,
} from "../lib/export";
import {
	construireCsv,
	periodeParDefaut,
	type RapportPeriodeSearch,
} from "../models/rapports";

interface SyntheseGlobalePageProps {
	initialSearch: RapportPeriodeSearch;
}

/**
 * Page « Rapport de synthèse globale » (M10) : recettes par activité, totaux
 * (recettes, dépenses, solde), impayés et masse salariale sur la période.
 */
export function SyntheseGlobalePage({
	initialSearch,
}: SyntheseGlobalePageProps) {
	const periode = periodeParDefaut(initialSearch);
	const rapportQuery = useSyntheseGlobale(periode.du, periode.au);
	const [pdfError, setPdfError] = useState(false);

	const exporterPdf = async () => {
		setPdfError(false);
		try {
			await telechargerPdf(
				rapportPdfPath(
					"/api/v1/rapports/synthese-globale",
					periode.du,
					periode.au,
				),
				`synthese-globale-${periode.du}-${periode.au}.pdf`,
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
					"/api/v1/rapports/synthese-globale",
					periode.du,
					periode.au,
				),
				`synthese-globale-${periode.du}-${periode.au}.xlsx`,
			);
		} catch {
			setPdfError(true);
		}
	};

	/** Lignes du rapport — base commune de l'export CSV et PDF. */
	const construireLignes = (): (string | number)[][] => {
		if (!rapportQuery.data) return [];
		const {
			recettes_par_activite,
			total_recettes,
			total_depenses,
			solde,
			impayes,
			masse_salariale,
		} = rapportQuery.data;
		return [
			["Période", `${periode.du} → ${periode.au}`],
			[],
			["Activité", "Recettes"],
			...recettes_par_activite.map((ligne) => [
				ligne.libelle,
				ligne.total_encaisse,
			]),
			[],
			["Total recettes", total_recettes],
			["Total dépenses", total_depenses],
			["Solde", solde],
			["Impayés (nombre)", impayes.nombre],
			["Impayés (montant)", impayes.montant],
			["Masse salariale", masse_salariale],
		];
	};

	const exporter = () => {
		const lignes = construireLignes();
		if (lignes.length === 0) return;
		telechargerTexte(
			`synthese-globale-${periode.du}-${periode.au}.csv`,
			construireCsv(lignes),
		);
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Rapports", to: "/rapports" },
					{ label: "Synthèse globale" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Rapport de synthèse globale
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
						onClick={exporterPdf}
						disabled={!rapportQuery.data}
						className="w-full sm:w-auto justify-center"
					>
						<FileText className="size-4" aria-hidden />
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
					<section className="grid grid-cols-2 gap-3 md:grid-cols-5">
						<Indicateur
							label="Recettes"
							valeur={formatMontantFCFA(rapportQuery.data.total_recettes)}
							couleur="text-[#27AE60]"
						/>
						<Indicateur
							label="Dépenses"
							valeur={formatMontantFCFA(rapportQuery.data.total_depenses)}
							couleur="text-destructive"
						/>
						<Indicateur
							label="Solde"
							valeur={formatMontantFCFA(rapportQuery.data.solde)}
							couleur="text-foreground"
						/>
						<Indicateur
							label="Impayés"
							valeur={`${rapportQuery.data.impayes.nombre} · ${formatMontantFCFA(rapportQuery.data.impayes.montant)}`}
							couleur="text-[#E67E22]"
						/>
						<Indicateur
							label="Masse salariale"
							valeur={formatMontantFCFA(rapportQuery.data.masse_salariale)}
							couleur="text-muted-foreground"
						/>
					</section>

					<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-foreground">
							Recettes par activité
						</h2>
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											ACTIVITÉ
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
											TOTAL ENCAISSÉ
										</th>
									</tr>
								</thead>
								<tbody>
									{rapportQuery.data.recettes_par_activite.map((ligne) => (
										<tr
											key={ligne.code}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3 text-foreground">
												{ligne.libelle}
											</td>
											<td className="px-4 py-3 text-right font-medium text-foreground">
												{formatMontantFCFA(ligne.total_encaisse)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>
				</>
			) : null}
		</div>
	);
}

function Indicateur({
	label,
	valeur,
	couleur,
}: {
	label: string;
	valeur: string;
	couleur: string;
}) {
	return (
		<div className="rounded-lg border border-border bg-sea-ink/5 p-3">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className={`mt-1 text-lg font-semibold ${couleur}`}>{valeur}</p>
		</div>
	);
}
