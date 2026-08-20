import { Download, FileText, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { useTableauBord } from "../hooks/use-finances";

type PeriodeFiltre =
	| "aujourd_hui"
	| "hier"
	| "cette_semaine"
	| "ce_mois"
	| "mois_precedent"
	| "annee"
	| "personnalisee";

type ActiviteFiltre =
	| "global"
	| "RESIDENCE"
	| "MARCHANDISE"
	| "PRESSING"
	| "RESTAURANT"
	| "SALLE_FETE";

const PERIODES: Record<PeriodeFiltre, string> = {
	aujourd_hui: "Aujourd'hui",
	hier: "Hier",
	cette_semaine: "Cette semaine",
	ce_mois: "Ce mois",
	mois_precedent: "Mois précédent",
	annee: "Année",
	personnalisee: "Personnalisée",
};

const ACTIVITES: Record<ActiviteFiltre, string> = {
	global: "Global",
	RESIDENCE: "Résidence",
	MARCHANDISE: "Market",
	PRESSING: "Pressing",
	RESTAURANT: "Restaurant",
	SALLE_FETE: "Salle de fête",
};

/**
 * Page « Tableau de bord financier » (module Finances, M8) : vue consolidée
 * de la situation financière avec indicateurs, tableaux par activité et filtres.
 */
export function TableauDeBordPage() {
	const canVoir = useCan("FINANCES.VOIR");
	const tableauBordQuery = useTableauBord();

	const [periode, setPeriode] = useState<PeriodeFiltre>("ce_mois");
	const [activite, setActivite] = useState<ActiviteFiltre>("global");
	const [detailsOuvert, setDetailsOuvert] = useState(false);

	// Fonction d'export PDF
	const handleExport = () => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		let yPosition = 20;

		// En-tête
		doc.setFontSize(16);
		doc.text("Tableau de Bord Financier", pageWidth / 2, yPosition, {
			align: "center",
		});
		yPosition += 10;

		doc.setFontSize(10);
		doc.setTextColor(128, 128, 128);
		doc.text(
			`Généré le ${new Date().toLocaleDateString("fr-FR")}`,
			pageWidth / 2,
			yPosition,
			{ align: "center" },
		);
		yPosition += 15;

		// Indicateurs principaux
		doc.setTextColor(0, 0, 0);
		doc.setFontSize(11);
		doc.text("INDICATEURS PRINCIPAUX", 20, yPosition);
		yPosition += 8;

		doc.setFontSize(9);
		const indicateurs = [
			[
				"Recettes totales:",
				formatMontantFCFA(
					String(
						lignes.reduce((sum, l) => sum + Number(l.encaissements), 0),
					),
				),
			],
			[
				"Dépenses totales:",
				formatMontantFCFA(
					String(
						lignes.reduce((sum, l) => sum + Number(l.decaissements), 0),
					),
				),
			],
			[
				"Solde:",
				formatMontantFCFA(
					String(
						lignes.reduce((sum, l) => sum + Number(l.encaissements), 0) -
							lignes.reduce((sum, l) => sum + Number(l.decaissements), 0),
					),
				),
			],
			[
				"Bénéfice estimatif:",
				formatMontantFCFA(
					String(
						lignes.reduce((sum, l) => sum + Number(l.marge_nette), 0),
					),
				),
			],
		];

		indicateurs.forEach(([label, value]) => {
			doc.text(`${label} ${value}`, 25, yPosition);
			yPosition += 6;
		});

		yPosition += 5;

		// Tableau des périodes
		doc.setFontSize(11);
		doc.text("DÉTAIL PAR PÉRIODE", 20, yPosition);
		yPosition += 8;

		const tableData = lignes.map((ligne) => {
			const encaissementsNum = Number(ligne.encaissements);
			const depensesNum = Number(ligne.decaissements);
			const margeNum = Number(ligne.marge_nette);
			const marge = encaissementsNum > 0
				? ((margeNum / encaissementsNum) * 100).toFixed(1)
				: "0";

			return [
				ligne.periode,
				encaissementsNum.toLocaleString("fr-FR"),
				depensesNum.toLocaleString("fr-FR"),
				(encaissementsNum - depensesNum).toLocaleString("fr-FR"),
				`${marge}%`,
			];
		});

		// Ajouter totaux
		const totalRecettes = lignes.reduce(
			(sum, l) => sum + Number(l.encaissements),
			0,
		);
		const totalDepenses = lignes.reduce(
			(sum, l) => sum + Number(l.decaissements),
			0,
		);
		const totalBenefit = lignes.reduce(
			(sum, l) => sum + Number(l.marge_nette),
			0,
		);
		const totalMargePct = totalRecettes > 0
			? ((totalBenefit / totalRecettes) * 100).toFixed(1)
			: "0";

		tableData.push([
			"TOTAL",
			totalRecettes.toLocaleString("fr-FR"),
			totalDepenses.toLocaleString("fr-FR"),
			(totalRecettes - totalDepenses).toLocaleString("fr-FR"),
			`${totalMargePct}%`,
		]);

		// Créer le tableau PDF
		autoTable(doc, {
			head: [["Période", "Recettes", "Dépenses", "Solde", "% Marge"]],
			body: tableData,
			startY: yPosition,
			margin: 20,
			headStyles: {
				fillColor: [41, 128, 185],
				textColor: 255,
				fontStyle: "bold",
			},
			bodyStyles: {
				textColor: 0,
			},
			alternateRowStyles: {
				fillColor: [245, 245, 245],
			},
		});

		// Télécharger
		doc.save(
			`tableau-de-bord-financier-${new Date().toISOString().split("T")[0]}.pdf`,
		);
	};

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au tableau de bord financier.
			</div>
		);
	}

	const lignes = tableauBordQuery.data ?? [];

	// Calcul des indicateurs globaux (convertir strings en nombres)
	const totalRecettes = lignes.reduce(
		(sum, l) => sum + Number(l.encaissements),
		0,
	);
	const totalDepenses = lignes.reduce(
		(sum, l) => sum + Number(l.decaissements),
		0,
	);
	const solde = totalRecettes - totalDepenses;
	const beneficeEstimatif = lignes.reduce(
		(sum, l) => sum + Number(l.marge_nette),
		0,
	);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Finances", to: "/finances/tableau-de-bord" },
					{ label: "Tableau de bord" },
				]}
			/>

			<section className="space-y-2">
				<h1 className="text-2xl font-semibold text-foreground">
					Tableau de bord financier
				</h1>
				<p className="text-muted-foreground">
					Vue consolidée de la situation financière de GLOBAL SIM GROUP.
				</p>
			</section>

			{/* Filtres */}
			<div className="space-y-3 rounded-lg border border-border bg-card p-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<label className="block text-xs font-medium text-muted-foreground mb-1">
							Période
						</label>
						<Select value={periode} onValueChange={(v) => setPeriode(v as PeriodeFiltre)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(PERIODES).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="block text-xs font-medium text-muted-foreground mb-1">
							Activité
						</label>
						<Select value={activite} onValueChange={(v) => setActivite(v as ActiviteFiltre)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(ACTIVITES).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleExport}
						disabled={lignes.length === 0}
					>
						<Download className="mr-2 size-4" aria-hidden />
						Exporter PDF
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setDetailsOuvert(true)}
						disabled={lignes.length === 0}
					>
						<FileText className="mr-2 size-4" aria-hidden />
						Détails par activité
					</Button>
				</div>
			</div>

			{/* Indicateurs principaux */}
			{tableauBordQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : tableauBordQuery.isError ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger le tableau de bord.</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<Indicateur
							label="Recettes totales"
							valeur={formatMontantFCFA(totalRecettes)}
							couleur="text-[#27AE60]"
						/>
						<Indicateur
							label="Dépenses totales"
							valeur={formatMontantFCFA(totalDepenses)}
							couleur="text-destructive"
						/>
						<Indicateur
							label="Solde"
							valeur={formatMontantFCFA(solde)}
							couleur={solde >= 0 ? "text-[#27AE60]" : "text-destructive"}
						/>
						<Indicateur
							label="Bénéfice estimatif"
							valeur={formatMontantFCFA(beneficeEstimatif)}
							couleur={beneficeEstimatif >= 0 ? "text-[#27AE60]" : "text-destructive"}
						/>
					</div>

					{/* Tableau par activité */}
					{lignes.length === 0 ? (
						<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
							Aucune donnée financière disponible.
						</div>
					) : (
						<div className="overflow-x-auto rounded-lg border border-border">
							<table className="w-full text-xs sm:text-sm">
								<thead className="bg-muted">
									<tr>
										<th className="px-4 py-3 text-left font-semibold">
											Activité
										</th>
										<th className="px-4 py-3 text-right font-semibold">
											Recettes
										</th>
										<th className="px-4 py-3 text-right font-semibold">
											Dépenses
										</th>
										<th className="px-4 py-3 text-right font-semibold">
											Solde
										</th>
										<th className="px-4 py-3 text-right font-semibold">
											% Marge
										</th>
									</tr>
								</thead>
								<tbody>
									{lignes.map((ligne) => {
										const encaissementsNum = Number(ligne.encaissements);
										const margeNum = Number(ligne.marge_nette);
										const marge = encaissementsNum > 0
											? ((margeNum / encaissementsNum) * 100).toFixed(1)
											: "0";

										return (
											<tr
												key={ligne.periode}
												className="border-t border-border hover:bg-muted/50"
											>
												<td className="px-4 py-3 font-medium">
													Période {ligne.periode}
												</td>
												<td className="px-4 py-3 text-right text-[#27AE60]">
													{formatMontantFCFA(ligne.encaissements)}
												</td>
												<td className="px-4 py-3 text-right text-destructive">
													{formatMontantFCFA(ligne.decaissements)}
												</td>
												<td
													className={cn(
														"px-4 py-3 text-right font-medium",
														margeNum >= 0
															? "text-[#27AE60]"
															: "text-destructive",
													)}
												>
													{formatMontantFCFA(ligne.marge_nette)}
												</td>
												<td className="px-4 py-3 text-right">
													{marge}%
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}

			{/* Modal détails par activité */}
			{detailsOuvert && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="rounded-lg border border-border bg-card p-6 shadow-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold">Détails par activité</h2>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setDetailsOuvert(false)}
							>
								<X className="size-4" aria-hidden />
								<span className="sr-only">Fermer</span>
							</Button>
						</div>

						<div className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Détails consolidés par activité pour la période sélectionnée.
							</p>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{Object.entries(ACTIVITES).map(([key, label]) => {
									if (key === "global") return null;

									return (
										<div
											key={key}
											className="rounded-lg border border-border bg-muted/30 p-4"
										>
											<h3 className="font-semibold text-foreground">
												{label}
											</h3>
											<p className="text-xs text-muted-foreground mt-1">
												Filtrage par activité à implémenter
											</p>
											<div className="space-y-2 mt-3 text-sm">
												<div className="flex justify-between">
													<span>Recettes:</span>
													<span className="font-medium">—</span>
												</div>
												<div className="flex justify-between">
													<span>Dépenses:</span>
													<span className="font-medium">—</span>
												</div>
												<div className="flex justify-between">
													<span>Marge:</span>
													<span className="font-medium">—</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<div className="border-t border-border pt-4">
								<p className="text-xs text-muted-foreground">
									💡 Les détails par activité seront disponibles une fois que
									l'API supportera le filtrage par activité.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
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
		<div className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className={`mt-2 text-lg sm:text-2xl font-bold ${couleur} break-words overflow-hidden`}>
				{valeur}
			</p>
		</div>
	);
}
