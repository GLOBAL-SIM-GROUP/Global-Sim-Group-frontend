import type { UseQueryResult } from "@tanstack/react-query";
import { FileDown, FileText, Loader2, Printer, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import {
	type DashboardActivite,
	getDashboardActivitePath,
} from "#/features/dashboard/api/dashboard";
import { useDashboardActivite } from "#/features/dashboard/hooks/use-dashboard";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import {
	downloadTableauBordExcel,
	getTableauBordExcelPath,
	getTableauBordPdfPath,
	printTableauBordPdf,
} from "../api/finances";
import { useCurrentCaisse } from "../hooks/use-current-caisse";
import { useTableauBord } from "../hooks/use-finances";

type PeriodeFiltre =
	| "aujourd_hui"
	| "hier"
	| "cette_semaine"
	| "ce_mois"
	| "mois_precedent"
	| "annee"
	| "personnalisee";

/**
 * Codes réels de `finances.activite.code` côté backend (`GET
 * /dashboard?activite=...`, vérifié en direct le 2026-09-06) — ne
 * correspondent pas aux anciens libellés inventés (`RESIDENCE`,
 * `MARCHANDISE`, `RESTAURANT`) : la résidence se scinde en deux
 * (résidentiel/commercial), le reste change de nom.
 */
type ActiviteFiltre =
	| "global"
	| "VENTE_MARCHANDISES"
	| "PRESSING"
	| "RESTAURATION"
	| "SALLE_FETE"
	| "LOCATION_RESIDENTIEL"
	| "LOCATION_COMMERCIAL";

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
	VENTE_MARCHANDISES: "Vente de marchandises",
	PRESSING: "Pressing",
	RESTAURATION: "Restauration",
	SALLE_FETE: "Salle de fête",
	LOCATION_RESIDENTIEL: "Location résidentielle",
	LOCATION_COMMERCIAL: "Location commerciale",
};

// Composants locaux, pas `toISOString()` (UTC) : décalerait la date d'un
// jour selon le fuseau du navigateur, faussant les bornes de mois/semaine.
const formatDateISO = (date: Date): string => {
	const annee = date.getFullYear();
	const mois = String(date.getMonth() + 1).padStart(2, "0");
	const jour = String(date.getDate()).padStart(2, "0");
	return `${annee}-${mois}-${jour}`;
};

/**
 * Traduit un préréglage de période en bornes `du`/`au` réelles — seul
 * filtrage supporté par le backend (`periodo` n'existe pas côté API, vérifié
 * en direct : il n'avait strictement aucun effet). Les périodes renvoyées
 * sont des buckets mensuels : les préréglages plus fins qu'un mois (« Hier »,
 * « Cette semaine ») retombent donc sur le même bucket que « Ce mois », mais
 * le calcul reste correct si le backend gagne un jour une granularité plus fine.
 */
function calculerPlagePeriode(
	periode: PeriodeFiltre,
	personnalise: { du: string; au: string },
): { du?: string; au?: string } {
	const aujourdhui = new Date();
	switch (periode) {
		case "aujourd_hui":
			return { du: formatDateISO(aujourdhui), au: formatDateISO(aujourdhui) };
		case "hier": {
			const hier = new Date(aujourdhui);
			hier.setDate(hier.getDate() - 1);
			return { du: formatDateISO(hier), au: formatDateISO(hier) };
		}
		case "cette_semaine": {
			// Lundi = début de semaine (getDay() : 0 = dimanche).
			const jour = aujourdhui.getDay();
			const decalage = jour === 0 ? 6 : jour - 1;
			const debut = new Date(aujourdhui);
			debut.setDate(debut.getDate() - decalage);
			return { du: formatDateISO(debut), au: formatDateISO(aujourdhui) };
		}
		case "ce_mois": {
			const debut = new Date(
				aujourdhui.getFullYear(),
				aujourdhui.getMonth(),
				1,
			);
			const fin = new Date(
				aujourdhui.getFullYear(),
				aujourdhui.getMonth() + 1,
				0,
			);
			return { du: formatDateISO(debut), au: formatDateISO(fin) };
		}
		case "mois_precedent": {
			const debut = new Date(
				aujourdhui.getFullYear(),
				aujourdhui.getMonth() - 1,
				1,
			);
			const fin = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 0);
			return { du: formatDateISO(debut), au: formatDateISO(fin) };
		}
		case "annee":
			return {
				du: `${aujourdhui.getFullYear()}-01-01`,
				au: `${aujourdhui.getFullYear()}-12-31`,
			};
		case "personnalisee":
			return {
				du: personnalise.du || undefined,
				au: personnalise.au || undefined,
			};
		default:
			return {};
	}
}

/**
 * Page « Tableau de bord financier » (module Finances, M8) : vue consolidée
 * de la situation financière avec indicateurs, tableaux par activité et filtres.
 */
const ITEMS_PER_PAGE = 10;

export function TableauDeBordPage() {
	const canVoir = useCan("FINANCES.VOIR");
	const userCaisse = useCurrentCaisse();
	const [periode, setPeriode] = useState<PeriodeFiltre>("ce_mois");
	const [activite, setActivite] = useState<ActiviteFiltre>("global");
	const [duPersonnalise, setDuPersonnalise] = useState("");
	const [auPersonnalise, setAuPersonnalise] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [detailsOuvert, setDetailsOuvert] = useState(false);
	const [exportPdfLoading, setExportPdfLoading] = useState(false);
	const [exportExcelLoading, setExportExcelLoading] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);

	const { du, au } = useMemo(
		() =>
			calculerPlagePeriode(periode, {
				du: duPersonnalise,
				au: auPersonnalise,
			}),
		[periode, duPersonnalise, auPersonnalise],
	);

	const estGlobal = activite === "global";
	const tableauBordQuery = useTableauBord(du, au, userCaisse ?? undefined);
	const activiteQuery = useDashboardActivite(estGlobal ? "" : activite, du, au);

	// Reset page quand les filtres changent (du/au servent de déclencheur,
	// pas lus dans le corps — les retirer romprait la remise à 1).
	// biome-ignore lint/correctness/useExhaustiveDependencies: déclencheur volontaire, cf. commentaire ci-dessus
	useEffect(() => {
		setCurrentPage(1);
	}, [du, au]);

	// Fonction d'impression PDF via le backend (résumé d'activité si un
	// filtre est actif — /finances/tableau-de-bord n'a pas cette dimension).
	const handlePrintPdf = async () => {
		setExportPdfLoading(true);
		setExportError(null);
		try {
			const chemin = estGlobal
				? getTableauBordPdfPath(du, au)
				: getDashboardActivitePath("pdf", activite, du, au);
			await printTableauBordPdf(chemin);
		} catch (error) {
			setExportError("Impossible de générer le PDF");
			console.error(error);
		} finally {
			setExportPdfLoading(false);
		}
	};

	// Fonction d'export Excel via le backend (même logique que le PDF).
	const handleExportExcel = async () => {
		setExportExcelLoading(true);
		setExportError(null);
		try {
			const chemin = estGlobal
				? getTableauBordExcelPath(du, au)
				: getDashboardActivitePath("xlsx", activite, du, au);
			const nomFichier = `tableau-de-bord-financier-${formatDateISO(new Date())}.xlsx`;
			await downloadTableauBordExcel(chemin, nomFichier);
		} catch (error) {
			setExportError("Impossible de générer l'Excel");
			console.error(error);
		} finally {
			setExportExcelLoading(false);
		}
	};

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au tableau de bord financier.
			</div>
		);
	}

	const toutesLignes = tableauBordQuery.data ?? [];

	// Calcul des indicateurs globaux (sur TOUTES les données, pas juste la page actuelle)
	const totalRecettes = toutesLignes.reduce(
		(sum, l) => sum + Number(l.encaissements),
		0,
	);
	const totalDepenses = toutesLignes.reduce(
		(sum, l) => sum + Number(l.decaissements),
		0,
	);
	const solde = totalRecettes - totalDepenses;
	const beneficeEstimatif = toutesLignes.reduce(
		(sum, l) => sum + Number(l.marge_nette),
		0,
	);

	// Pagination
	const totalPages = Math.ceil(toutesLignes.length / ITEMS_PER_PAGE);
	const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
	const lignes = toutesLignes.slice(startIdx, startIdx + ITEMS_PER_PAGE);

	return (
		<div className="w-full space-y-6 p-6">
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

			{userCaisse && (
				<div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100">
					Données filtrées par votre caisse assignée
				</div>
			)}

			{/* Filtres */}
			<div className="space-y-3 rounded-lg border border-border bg-card p-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<label
							htmlFor="tableau-bord-filtre-periode"
							className="block text-xs font-medium text-muted-foreground mb-1"
						>
							Période
						</label>
						<Select
							value={periode}
							onValueChange={(v) => setPeriode(v as PeriodeFiltre)}
						>
							<SelectTrigger id="tableau-bord-filtre-periode">
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
						<label
							htmlFor="tableau-bord-filtre-activite"
							className="block text-xs font-medium text-muted-foreground mb-1"
						>
							Activité
						</label>
						<Select
							value={activite}
							onValueChange={(v) => setActivite(v as ActiviteFiltre)}
						>
							<SelectTrigger id="tableau-bord-filtre-activite">
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

					{periode === "personnalisee" ? (
						<div className="grid grid-cols-1 gap-3 sm:max-w-md sm:grid-cols-2">
							<div>
								<label
									htmlFor="tableau-bord-filtre-du"
									className="block text-xs font-medium text-muted-foreground mb-1"
								>
									Du
								</label>
								<Input
									id="tableau-bord-filtre-du"
									type="date"
									value={duPersonnalise}
									onChange={(event) => setDuPersonnalise(event.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="tableau-bord-filtre-au"
									className="block text-xs font-medium text-muted-foreground mb-1"
								>
									Au
								</label>
								<Input
									id="tableau-bord-filtre-au"
									type="date"
									value={auPersonnalise}
									onChange={(event) => setAuPersonnalise(event.target.value)}
								/>
							</div>
						</div>
					) : null}
				</div>

				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => void handlePrintPdf()}
						disabled={
							(estGlobal ? lignes.length === 0 : !activiteQuery.data) ||
							exportPdfLoading
						}
						className="w-full sm:w-auto"
					>
						{exportPdfLoading ? (
							<Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
						) : (
							<Printer className="mr-2 size-4" aria-hidden />
						)}
						PDF
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExportExcel}
						disabled={
							(estGlobal ? lignes.length === 0 : !activiteQuery.data) ||
							exportExcelLoading
						}
						className="w-full sm:w-auto"
					>
						{exportExcelLoading ? (
							<Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
						) : (
							<FileDown className="mr-2 size-4" aria-hidden />
						)}
						Excel
					</Button>
					{estGlobal ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDetailsOuvert(true)}
							disabled={lignes.length === 0}
							className="w-full sm:w-auto"
						>
							<FileText className="mr-2 size-4" aria-hidden />
							Détails par activité
						</Button>
					) : null}
				</div>

				{exportError && (
					<p role="alert" className="text-sm text-destructive font-medium">
						{exportError}
					</p>
				)}
			</div>

			{!estGlobal ? (
				<ActiviteResume query={activiteQuery} libelle={ACTIVITES[activite]} />
			) : tableauBordQuery.isLoading ? (
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
							valeur={formatMontantFCFA(totalRecettes.toString())}
							couleur="text-[#27AE60]"
						/>
						<Indicateur
							label="Dépenses totales"
							valeur={formatMontantFCFA(totalDepenses.toString())}
							couleur="text-destructive"
						/>
						<Indicateur
							label="Solde"
							valeur={formatMontantFCFA(solde.toString())}
							couleur={solde >= 0 ? "text-[#27AE60]" : "text-destructive"}
						/>
						<Indicateur
							label="Bénéfice estimatif"
							valeur={formatMontantFCFA(beneficeEstimatif.toString())}
							couleur={
								beneficeEstimatif >= 0 ? "text-[#27AE60]" : "text-destructive"
							}
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
											Période
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
										const marge =
											encaissementsNum > 0
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
												<td className="px-4 py-3 text-right">{marge}%</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && lignes.length > 0 && (
						<div className="flex justify-center gap-2 mt-6 pb-4">
							<button
								type="button"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className="px-3 py-2 h-9 rounded-md border border-input bg-background text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
								aria-label="Page précédente"
							>
								Précédent
							</button>

							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map(
									(page) => (
										<button
											key={page}
											type="button"
											onClick={() => setCurrentPage(page)}
											className={`px-3 py-2 h-9 rounded-md text-sm font-medium transition-colors ${
												page === currentPage
													? "bg-sea-ink text-white"
													: "border border-input bg-background hover:bg-accent"
											}`}
											aria-label={`Page ${page}`}
											aria-current={page === currentPage ? "page" : undefined}
										>
											{page}
										</button>
									),
								)}
							</div>

							<button
								type="button"
								onClick={() =>
									setCurrentPage((p) => Math.min(totalPages, p + 1))
								}
								disabled={currentPage === totalPages}
								className="px-3 py-2 h-9 rounded-md border border-input bg-background text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
								aria-label="Page suivante"
							>
								Suivant
							</button>
						</div>
					)}
				</>
			)}

			{/* Modal détails par activité */}
			{detailsOuvert && (
				<DetailsParActiviteModal
					du={du}
					au={au}
					fermer={() => setDetailsOuvert(false)}
				/>
			)}
		</div>
	);
}

function DetailsParActiviteModal({
	du,
	au,
	fermer,
}: {
	du?: string;
	au?: string;
	fermer: () => void;
}) {
	const { data, isLoading } = useTableauBord(du, au);
	const lignes = data ?? [];

	// Calcule les totaux globaux
	const totalRecettes = lignes.reduce(
		(sum, l) => sum + Number(l.encaissements),
		0,
	);
	const totalDepenses = lignes.reduce(
		(sum, l) => sum + Number(l.decaissements),
		0,
	);
	const totalMarge = lignes.reduce((sum, l) => sum + Number(l.marge_nette), 0);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="rounded-lg border border-border bg-card p-6 shadow-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Détails par activité</h2>
					<Button variant="ghost" size="sm" onClick={fermer}>
						<X className="size-4" aria-hidden />
						<span className="sr-only">Fermer</span>
					</Button>
				</div>

				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Détails consolidés pour la période sélectionnée.
					</p>

					{isLoading ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="rounded-lg border border-border bg-muted/30 p-4">
								<h3 className="font-semibold text-foreground">
									Totaux consolidés
								</h3>
								<div className="space-y-2 mt-3 text-sm">
									<div className="flex justify-between">
										<span>Recettes totales:</span>
										<span className="font-medium">
											{formatMontantFCFA(String(totalRecettes))}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Dépenses totales:</span>
										<span className="font-medium">
											{formatMontantFCFA(String(totalDepenses))}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Marge nette:</span>
										<span
											className={cn(
												"font-medium",
												totalMarge >= 0 ? "text-[#27AE60]" : "text-destructive",
											)}
										>
											{formatMontantFCFA(String(totalMarge))}
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/**
 * Libellés des clés d'indicateurs connues (vérifiées en direct sur les 6
 * activités réelles — `ca`/`nombre_*` ne se laissent pas déduire correctement
 * d'un simple remplacement d'underscore : "Ca" et "Nombre commandes" ne sont
 * pas du français correct). Repli générique pour le reste (codes de statut
 * dynamiques comme `EN_TRAITEMENT`, clés futures non prévues ici).
 */
const LIBELLES_INDICATEURS: Record<string, string> = {
	ca: "Chiffre d'affaires",
	nombre_ventes: "Nombre de ventes",
	nombre_commandes: "Nombre de commandes",
	nombre_operations: "Nombre d'opérations",
	top_produit: "Produit le plus vendu",
	par_statut: "Répartition par statut",
	realisees: "Réservations réalisées",
	annulees: "Réservations annulées",
	loyers_percus: "Loyers perçus",
	impayes: "Impayés",
	nom: "Nom",
	montant: "Montant",
	nombre: "Nombre",
};

/** Transforme une clé d'indicateur (`par_statut`, `top_produit`…) en libellé lisible. */
function libelleCle(cle: string): string {
	const connu = LIBELLES_INDICATEURS[cle.toLowerCase()];
	if (connu) return connu;
	const texte = cle.replaceAll("_", " ").toLowerCase();
	return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * Couleur des indicateurs dont le sens (positif/négatif) est connu à
 * l'avance — mêmes teintes que le reste de l'app (`#27AE60` vert / `text-
 * destructive` rouge). Pas de couleur pour les comptages neutres
 * (`nombre_*`) ni les objets imbriqués (`top_produit`, `par_statut`, gérés à
 * part).
 */
const COULEUR_INDICATEURS: Record<string, string> = {
	ca: "text-[#27AE60]",
	loyers_percus: "text-[#27AE60]",
	realisees: "text-[#27AE60]",
	annulees: "text-destructive",
	impayes: "text-destructive",
};

function couleurValeur(cle: string): string {
	return COULEUR_INDICATEURS[cle.toLowerCase()] ?? "text-foreground";
}

/**
 * Couleur de badge pour un code de statut générique — mêmes teintes que les
 * badges de statut utilisés ailleurs dans l'app (contrats, commandes
 * pressing…), pas une palette inventée pour l'occasion.
 */
function couleurStatutBadge(code: string): string {
	const c = code.toUpperCase();
	if (["RETIRE", "REALISEE", "REALISEES", "PAYEE", "ACTIF"].includes(c)) {
		return "bg-[#27AE60] text-white";
	}
	if (["ANNULEE", "ANNULEES", "ANNULE", "IMPAYE", "RESILIE"].includes(c)) {
		return "bg-[#E74C3C] text-white";
	}
	if (
		["EN_TRAITEMENT", "EN_ATTENTE", "PRET", "PARTIEL", "A_VENIR"].includes(c)
	) {
		return "bg-[#E67E22] text-white";
	}
	if (c === "TERMINE") return "bg-[#2980B9] text-white";
	return "bg-[#95A5A6] text-white";
}

/** Formate une valeur d'indicateur générique (nombre, montant, texte). */
function formatValeurIndicateur(valeur: unknown): string {
	if (typeof valeur === "number") return valeur.toLocaleString("fr-FR");
	if (typeof valeur === "string" && /^\d+(\.\d+)?$/.test(valeur)) {
		return formatMontantFCFA(valeur);
	}
	return String(valeur);
}

/**
 * Rendu générique des `indicateurs` d'une activité — leur forme varie
 * entièrement d'une activité à l'autre (vérifié sur les 6 codes réels :
 * PRESSING a `par_statut`, VENTE_MARCHANDISES a `top_produit`,
 * LOCATION_RESIDENTIEL a `impayes`…) : pas de mise en page dédiée par
 * activité, un seul rendu clé/valeur qui gère un niveau d'imbrication.
 * Une clé `par_*` (répartition par catégorie, ex. `par_statut`) est rendue en
 * badges colorés plutôt qu'en texte brut.
 */
function IndicateursGeneriques({
	indicateurs,
}: {
	indicateurs: Record<string, unknown>;
}) {
	const entrees = Object.entries(indicateurs);
	if (entrees.length === 0) return null;
	return (
		<div className="space-y-3 text-sm">
			{entrees.map(([cle, valeur]) => (
				<div key={cle}>
					{valeur !== null && typeof valeur === "object" ? (
						<div className="space-y-2">
							<p className="text-muted-foreground">{libelleCle(cle)}</p>
							{cle.toLowerCase().startsWith("par_") ? (
								<div className="flex flex-wrap gap-2 pl-3">
									{Object.entries(valeur as Record<string, unknown>).map(
										([sousCle, sousValeur]) => (
											<span
												key={sousCle}
												className={cn(
													"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
													couleurStatutBadge(sousCle),
												)}
											>
												{libelleCle(sousCle)} ·{" "}
												{formatValeurIndicateur(sousValeur)}
											</span>
										),
									)}
								</div>
							) : (
								<div className="space-y-1 pl-3">
									{Object.entries(valeur as Record<string, unknown>).map(
										([sousCle, sousValeur]) => (
											<div key={sousCle} className="flex justify-between gap-4">
												<span className="text-muted-foreground">
													{libelleCle(sousCle)}
												</span>
												<span
													className={cn("font-medium", couleurValeur(sousCle))}
												>
													{formatValeurIndicateur(sousValeur)}
												</span>
											</div>
										),
									)}
								</div>
							)}
						</div>
					) : (
						<div className="flex justify-between gap-4">
							<span className="text-muted-foreground">{libelleCle(cle)}</span>
							<span className={cn("font-medium", couleurValeur(cle))}>
								{formatValeurIndicateur(valeur)}
							</span>
						</div>
					)}
				</div>
			))}
		</div>
	);
}

/**
 * Résumé d'une activité filtrée (`GET /dashboard?activite=...`) : pas de
 * détail mensuel comme la vue globale (l'endpoint renvoie un seul agrégat
 * sur toute la période `du`/`au`, pas de tableau à paginer).
 */
function ActiviteResume({
	query,
	libelle,
}: {
	query: UseQueryResult<DashboardActivite>;
	libelle: string;
}) {
	if (query.isLoading) {
		return <p className="text-sm text-muted-foreground">Chargement…</p>;
	}
	if (query.isError || !query.data) {
		return (
			<div
				role="alert"
				className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
			>
				<p>Impossible de charger les données de cette activité.</p>
			</div>
		);
	}
	const { data } = query;
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Indicateur
					label={`Recettes — ${libelle}`}
					valeur={formatMontantFCFA(data.recettes_mois)}
					couleur="text-[#27AE60]"
				/>
				<Indicateur
					label="Opérations sur la période"
					valeur={data.nombre_operations_mois.toLocaleString("fr-FR")}
					couleur="text-foreground"
				/>
			</div>

			{Object.keys(data.indicateurs).length > 0 ? (
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<h3 className="mb-3 font-semibold text-foreground">
						Détails — {data.libelle}
					</h3>
					<IndicateursGeneriques indicateurs={data.indicateurs} />
				</div>
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
		<div className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p
				className={`mt-2 text-lg sm:text-2xl font-bold ${couleur} break-words overflow-hidden`}
			>
				{valeur}
			</p>
		</div>
	);
}
