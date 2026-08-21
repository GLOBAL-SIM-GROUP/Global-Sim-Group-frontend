import { Link } from "@tanstack/react-router";
import { FileDown, FileText } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { rapportPdfPath, rapportExcelPath } from "../api/rapports";
import { useRapportFinancier } from "../hooks/use-rapports";
import { telechargerPdf, telechargerTexte, telechargerExcel } from "../lib/export";
import {
	construireCsv,
	periodeParDefaut,
	type RapportPeriodeSearch,
} from "../models/rapports";

interface RapportFinancierPageProps {
	initialSearch: RapportPeriodeSearch;
}

/**
 * Page « Rapport financier » (M10) : encaissements (activité, moyen), dépenses
 * (catégorie) et impayés sur la période.
 */
export function RapportFinancierPage({
	initialSearch,
}: RapportFinancierPageProps) {
	const periode = periodeParDefaut(initialSearch);
	const rapportQuery = useRapportFinancier(periode.du, periode.au);
	const [pdfError, setPdfError] = useState(false);

	const exporterPdf = async () => {
		setPdfError(false);
		try {
			await telechargerPdf(
				rapportPdfPath("/rapports/financier", periode.du, periode.au),
				`rapport-financier-${periode.du}-${periode.au}.pdf`,
			);
		} catch {
			setPdfError(true);
		}
	};

	const exporterExcel = async () => {
		setPdfError(false);
		try {
			await telechargerExcel(
				rapportExcelPath("/rapports/financier", periode.du, periode.au),
				`rapport-financier-${periode.du}-${periode.au}.xlsx`,
			);
		} catch {
			setPdfError(true);
		}
	};

	/** Lignes du rapport — base commune de l'export CSV et PDF. */
	const construireLignes = (): (string | number)[][] => {
		if (!rapportQuery.data) return [];
		const { encaissements, depenses, impayes } = rapportQuery.data;
		return [
			["Période", `${periode.du} → ${periode.au}`],
			[],
			["ENCAISSEMENTS"],
			["Date", "Activité", "Moyen", "Montant"],
			...encaissements.map((e) => [
				e.date,
				e.activite_libelle,
				e.moyen_libelle,
				e.montant,
			]),
			[],
			["DÉPENSES"],
			["Date", "Catégorie", "Libellé", "Montant"],
			...depenses.map((d) => [
				d.date,
				d.categorie_libelle,
				d.libelle,
				d.montant,
			]),
			[],
			["IMPAYÉS"],
			["Type", "Client", "Référence", "Montant dû", "Payé", "Reste"],
			...impayes.map((i) => [
				i.type,
				i.client,
				i.reference,
				i.montant_du,
				i.montant_paye,
				i.reste,
			]),
		];
	};

	const exporter = () => {
		const lignes = construireLignes();
		if (lignes.length === 0) return;
		telechargerTexte(
			`rapport-financier-${periode.du}-${periode.au}.csv`,
			construireCsv(lignes),
		);
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Rapports", to: "/rapports" },
					{ label: "Rapport financier" },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
						Rapport financier
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Période du {periode.du} au {periode.au}.
					</p>
				</section>
				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button variant="outline" size="sm" asChild className="w-full sm:w-auto justify-center">
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
					<SectionTableau
						titre={`Encaissements (${rapportQuery.data.encaissements.length})`}
						entetes={["Date", "Activité", "Moyen", "Montant"]}
						colAlignes={["", "", "", "text-right"]}
					>
						{rapportQuery.data.encaissements.map((e) => (
							<tr
								key={e.id}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 text-muted-foreground">
									{formatDateHeureISO(e.date)}
								</td>
								<td className="px-4 py-3 text-foreground">
									{e.activite_libelle}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{e.moyen_libelle}
								</td>
								<td className="px-4 py-3 text-right font-medium text-foreground">
									{formatMontantFCFA(e.montant)}
								</td>
							</tr>
						))}
					</SectionTableau>

					<SectionTableau
						titre={`Dépenses (${rapportQuery.data.depenses.length})`}
						entetes={["Date", "Catégorie", "Libellé", "Montant"]}
						colAlignes={["", "", "", "text-right"]}
					>
						{rapportQuery.data.depenses.map((d) => (
							<tr
								key={d.id}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 text-muted-foreground">
									{formatDateHeureISO(d.date)}
								</td>
								<td className="px-4 py-3 text-foreground">
									{d.categorie_libelle}
								</td>
								<td className="px-4 py-3 text-muted-foreground">{d.libelle}</td>
								<td className="px-4 py-3 text-right font-medium text-destructive">
									- {formatMontantFCFA(d.montant)}
								</td>
							</tr>
						))}
					</SectionTableau>

					<SectionTableau
						titre={`Impayés (${rapportQuery.data.impayes.length})`}
						entetes={["Type", "Client", "Référence", "Reste"]}
						colAlignes={["", "", "", "text-right"]}
					>
						{rapportQuery.data.impayes.map((i) => (
							<tr
								key={`${i.type}-${i.reference}-${i.client}-${i.montant_du}`}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 text-foreground">{i.type}</td>
								<td className="px-4 py-3 text-foreground">{i.client}</td>
								<td className="px-4 py-3 text-muted-foreground">
									{i.reference}
								</td>
								<td className="px-4 py-3 text-right font-semibold text-destructive">
									{formatMontantFCFA(i.reste)}
								</td>
							</tr>
						))}
					</SectionTableau>
				</>
			) : null}
		</div>
	);
}

function SectionTableau({
	titre,
	entetes,
	colAlignes,
	children,
}: {
	titre: string;
	entetes: string[];
	colAlignes: string[];
	children: ReactNode;
}) {
	return (
		<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-foreground">{titre}</h2>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead className="bg-sea-ink text-left text-white">
						<tr>
							{entetes.map((entete, index) => (
								<th
									key={entete}
									scope="col"
									className={`px-4 py-3 font-medium ${colAlignes[index] ?? ""}`}
								>
									{entete}
								</th>
							))}
						</tr>
					</thead>
					<tbody>{children}</tbody>
				</table>
			</div>
		</section>
	);
}
