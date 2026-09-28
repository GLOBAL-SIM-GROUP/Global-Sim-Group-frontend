import { Link } from "@tanstack/react-router";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { rapportExcelPath, rapportPdfPath } from "../api/rapports";
import { useRapportFinancier } from "../hooks/use-rapports";
import { imprimerPdf, telechargerExcel, telechargerTexte } from "../lib/export";
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

	const imprimerRapportPdf = async () => {
		setPdfError(false);
		try {
			await imprimerPdf(
				rapportPdfPath("/api/v1/rapports/financier", periode.du, periode.au),
			);
		} catch {
			setPdfError(true);
		}
	};

	const exporterExcel = async () => {
		setPdfError(false);
		try {
			await telechargerExcel(
				rapportExcelPath("/api/v1/rapports/financier", periode.du, periode.au),
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
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Rapports", to: "/rapports" },
					{ label: "Rapport financier" },
				]}
				title="Rapport financier"
				description={`Période du ${periode.du} au ${periode.au}.`}
				actions={
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
				}
			/>

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
							<Tr key={e.id_paiement}>
								<Td className="text-muted-foreground">
									{formatDateHeureISO(e.date)}
								</Td>
								<Td className="text-foreground">{e.activite_libelle}</Td>
								<Td className="text-muted-foreground">{e.moyen_libelle}</Td>
								<Td className="text-right font-medium text-foreground">
									{formatMontantFCFA(e.montant)}
								</Td>
							</Tr>
						))}
					</SectionTableau>

					<SectionTableau
						titre={`Dépenses (${rapportQuery.data.depenses.length})`}
						entetes={["Date", "Catégorie", "Libellé", "Montant"]}
						colAlignes={["", "", "", "text-right"]}
					>
						{rapportQuery.data.depenses.map((d) => (
							<Tr key={d.id_depense}>
								<Td className="text-muted-foreground">
									{formatDateHeureISO(d.date)}
								</Td>
								<Td className="text-foreground">{d.categorie_libelle}</Td>
								<Td className="text-muted-foreground">{d.libelle}</Td>
								<Td className="text-right font-medium text-destructive">
									- {formatMontantFCFA(d.montant)}
								</Td>
							</Tr>
						))}
					</SectionTableau>

					<SectionTableau
						titre={`Impayés (${rapportQuery.data.impayes.length})`}
						entetes={["Type", "Client", "Référence", "Reste"]}
						colAlignes={["", "", "", "text-right"]}
					>
						{rapportQuery.data.impayes.map((i) => (
							<Tr key={`${i.type}-${i.reference}-${i.client}-${i.montant_du}`}>
								<Td className="text-foreground">{i.type}</Td>
								<Td className="text-foreground">{i.client}</Td>
								<Td className="text-muted-foreground">{i.reference}</Td>
								<Td className="text-right font-semibold text-destructive">
									{formatMontantFCFA(i.reste)}
								</Td>
							</Tr>
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
			<TableShell>
				<DataTable>
					<DataTableHead>
						<tr>
							{entetes.map((entete, index) => (
								<Th key={entete} className={colAlignes[index] ?? ""}>
									{entete}
								</Th>
							))}
						</tr>
					</DataTableHead>
					<tbody>{children}</tbody>
				</DataTable>
			</TableShell>
		</section>
	);
}
