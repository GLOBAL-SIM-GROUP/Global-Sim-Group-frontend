import { Download, FileText } from "lucide-react";
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

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au tableau de bord financier.
			</div>
		);
	}

	const lignes = tableauBordQuery.data ?? [];

	// Calcul des indicateurs globaux
	const totalRecettes = lignes.reduce((sum, l) => sum + l.encaissements, 0);
	const totalDepenses = lignes.reduce((sum, l) => sum + l.decaissements, 0);
	const solde = totalRecettes - totalDepenses;
	const beneficeEstimatif = lignes.reduce((sum, l) => sum + l.marge_nette, 0);

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
					<Button variant="outline" size="sm">
						<Download className="mr-2 size-4" aria-hidden />
						Exporter
					</Button>
					<Button variant="outline" size="sm">
						<FileText className="mr-2 size-4" aria-hidden />
						Détails
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
										const marge = ligne.encaissements > 0
											? ((ligne.marge_nette / ligne.encaissements) * 100).toFixed(1)
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
														ligne.marge_nette >= 0
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
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className={`mt-2 text-2xl font-bold ${couleur}`}>{valeur}</p>
		</div>
	);
}
