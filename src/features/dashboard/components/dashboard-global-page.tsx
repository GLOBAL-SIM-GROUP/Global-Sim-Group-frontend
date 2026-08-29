import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Package,
	TrendingUp,
	Users,
} from "lucide-react";
import { type ComponentProps, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import type { Client } from "#/features/residence/models/clients";
import { nomComplet } from "#/features/residence/models/clients";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import type { Reservation } from "../api/dashboard";
import {
	useCommandesPressing,
	useImpayes,
	useLogementsDispo,
	usePointagesAujourdhui,
	useProduitsCritiques,
	useReservationsSalleFutures,
	useSyntheseGlobale,
} from "../hooks/use-dashboard";
import { getPeriodeDates, type PeriodeFiltre } from "../models/periodes";

const PERIODES: Record<PeriodeFiltre, string> = {
	aujourd_hui: "Aujourd'hui",
	hier: "Hier",
	cette_semaine: "Cette semaine",
	ce_mois: "Ce mois",
	mois_precedent: "Mois précédent",
	annee: "Année",
	personnalisee: "Personnalisée",
};

/**
 * Page « Tableau de bord global » : vue consolidée de l'ensemble des activités
 * de GLOBAL SIM GROUP. Accessible aux Administrateurs et Dirigeants.
 */
export function DashboardGlobalPage() {
	const canVoir = useCan("ADMIN.VOIR");

	const [periode, setPeriode] = useState<PeriodeFiltre>("ce_mois");
	const [customDu, setCustomDu] = useState<string>("");
	const [customAu, setCustomAu] = useState<string>("");
	const dates = getPeriodeDates(periode, customDu, customAu);

	const syntheseQuery = useSyntheseGlobale(dates.du, dates.au);
	const impayesQuery = useImpayes(dates.du, dates.au);
	const reservationsQuery = useReservationsSalleFutures();
	const pointagesQuery = usePointagesAujourdhui(dates.du, dates.au);
	const produitsCritiquesQuery = useProduitsCritiques(dates.du, dates.au);
	const commandesPressingQuery = useCommandesPressing(dates.du, dates.au);
	const logementsDispoQuery = useLogementsDispo(dates.du, dates.au);

	const synthese = syntheseQuery.data;
	const impayes = impayesQuery.data ?? [];
	const reservations = reservationsQuery.data ?? [];
	const pointages = pointagesQuery.data ?? [];
	const produitsCritiques = produitsCritiquesQuery.data ?? [];
	const commandesPressing = commandesPressingQuery.data ?? [];
	const logementsDispo = logementsDispoQuery.data ?? [];

	// Le lister salle de fête ne renvoie que `id_client` — le nom est résolu
	// séparément (même pattern que la fiche réservation), sinon la colonne
	// CLIENT affiche systématiquement « — ».
	const reservationsClientIds = reservations
		.map((r) => r.id_client)
		.filter((id): id is string => Boolean(id));
	const reservationsClientsQuery = useClientsDetails(reservationsClientIds);

	const presentsAujourdhui = pointages.filter(
		(p) => p.statut === "PRESENT",
	).length;
	const retardsAujourdhui = pointages.filter(
		(p) => p.statut === "RETARD",
	).length;
	const montantImpayes = impayes.reduce((sum, i: any) => {
		const montant = Number(i.montant_impaye ?? i.reste ?? 0);
		return sum + (Number.isNaN(montant) ? 0 : montant);
	}, 0);

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au tableau de bord global.
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Tableau de bord global" },
				]}
			/>

			<section className="space-y-2">
				<h1 className="text-3xl font-bold text-foreground">
					Tableau de bord global
				</h1>
				<p className="text-muted-foreground">
					Vue consolidée de l'ensemble des activités de GLOBAL SIM GROUP.
				</p>
			</section>

			{/* Filtres */}
			<div className="rounded-lg border border-border bg-card p-4">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
						<div className="flex-1">
							<label className="block text-xs font-medium text-muted-foreground mb-1">
								Période
							</label>
							<Select
								value={periode}
								onValueChange={(v) => setPeriode(v as PeriodeFiltre)}
							>
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
					</div>

					{/* Champs de date personnalisée */}
					{periode === "personnalisee" && (
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 pt-2 border-t border-border">
							<div className="flex-1">
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									Date de début
								</label>
								<input
									type="date"
									value={customDu}
									onChange={(e) => setCustomDu(e.target.value)}
									className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
								/>
							</div>
							<div className="flex-1">
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									Date de fin
								</label>
								<input
									type="date"
									value={customAu}
									onChange={(e) => setCustomAu(e.target.value)}
									className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
								/>
							</div>
						</div>
					)}

					{/* Affichage des dates appliquées */}
					<div className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
						<span className="font-medium">Période appliquée:</span>{" "}
						{new Date(dates.du).toLocaleDateString("fr-FR")} au{" "}
						{new Date(dates.au).toLocaleDateString("fr-FR")}
					</div>
				</div>
			</div>

			{/* Indicateurs principaux */}
			{syntheseQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : syntheseQuery.isError ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger le tableau de bord.</p>
				</div>
			) : synthese ? (
				<>
					{/* KPIs Financiers */}
					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-foreground">
							Vue financière
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<KPICard
								label="Chiffre d'affaires global"
								valeur={formatMontantFCFA(String(synthese.total_recettes))}
								couleur="text-emerald-600"
								icon={TrendingUp}
							/>
							<KPICard
								label="Dépenses totales"
								valeur={formatMontantFCFA(String(synthese.total_depenses))}
								couleur="text-amber-600"
								icon={AlertTriangle}
							/>
							<KPICard
								label="Solde"
								valeur={formatMontantFCFA(String(synthese.solde))}
								couleur={
									Number(synthese.solde) >= 0
										? "text-emerald-600"
										: "text-destructive"
								}
								icon={TrendingUp}
							/>
							<KPICard
								label="Impayés"
								valeur={`${synthese.impayes.nombre}`}
								subtext={formatMontantFCFA(String(synthese.impayes.montant))}
								couleur="text-destructive"
								icon={AlertCircle}
							/>
						</div>
					</div>

					{/* Recettes par activité */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Recettes par activité ce mois-ci
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{synthese.recettes_par_activite.map((activite) => (
								<div
									key={activite.code}
									className="rounded-lg border border-border bg-card p-4 shadow-sm"
								>
									<p className="text-sm font-medium text-muted-foreground">
										{activite.libelle}
									</p>
									<p className="mt-2 text-xl font-bold text-foreground">
										{formatMontantFCFA(String(activite.total_encaisse))}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Résidence */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">Résidence</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoCard
								label="Chambres disponibles"
								valeur={String(logementsDispo.length)}
								icon={CheckCircle2}
								loading={logementsDispoQuery.isLoading}
							/>
							<InfoCard
								label="Locataires impayés"
								valeur={String(impayes.length)}
								icon={AlertCircle}
								couleur="text-destructive"
								loading={impayesQuery.isLoading}
							/>
							<InfoCard
								label="Montant des impayés"
								valeur={formatMontantFCFA(String(montantImpayes))}
								icon={AlertCircle}
								couleur="text-destructive"
								loading={impayesQuery.isLoading}
							/>
						</div>

						{/* Liste des impayés */}
						{impayes.length > 0 && (
							<div className="rounded-lg border border-border overflow-hidden">
								<div className="overflow-x-auto">
									<table className="w-full border-collapse text-sm">
										<thead className="bg-sea-ink text-left text-white">
											<tr>
												<th scope="col" className="px-4 py-3 font-medium">
													CLIENT
												</th>
												<th scope="col" className="px-4 py-3 font-medium">
													RÉFÉRENCE
												</th>
												<th
													scope="col"
													className="px-4 py-3 text-right font-medium"
												>
													PAYÉ
												</th>
												<th
													scope="col"
													className="px-4 py-3 text-right font-medium"
												>
													RESTE
												</th>
												<th scope="col" className="px-4 py-3 font-medium">
													ÉCHÉANCE
												</th>
											</tr>
										</thead>
										<tbody>
											{impayes
												.sort((a: any, b: any) => {
													const dateA = new Date(a.date_echeance).getTime();
													const dateB = new Date(b.date_echeance).getTime();
													return dateA - dateB;
												})
												.slice(0, 10)
												.map((i: any, idx) => {
													const montantPaye = Number(i.montant_paye ?? 0);
													const montantReste = Number(
														i.montant_impaye ?? i.reste ?? 0,
													);
													const locataire =
														i.locataire ?? i.nom_locataire ?? i.client ?? "—";
													const reference = i.reference ?? i.id ?? "—";
													return (
														<tr
															key={idx}
															className="relative border-t border-border transition-colors hover:bg-accent/40"
														>
															<td className="px-4 py-3 font-medium text-foreground">
																{locataire}
															</td>
															<td className="px-4 py-3 text-muted-foreground">
																{reference}
															</td>
															<td className="px-4 py-3 text-right text-emerald-600 font-medium">
																{montantPaye > 0
																	? formatMontantFCFA(String(montantPaye))
																	: "0 FCFA"}
															</td>
															<td className="px-4 py-3 text-right font-semibold text-destructive">
																{montantReste > 0
																	? formatMontantFCFA(String(montantReste))
																	: "0 FCFA"}
															</td>
															<td className="px-4 py-3 text-muted-foreground">
																{i.date_echeance
																	? new Date(
																			i.date_echeance,
																		).toLocaleDateString("fr-FR")
																	: "—"}
															</td>
														</tr>
													);
												})}
											<tr className="border-t border-border bg-sea-ink/5">
												<td
													colSpan={2}
													className="px-4 py-3 font-semibold text-foreground"
												>
													TOTAL ({impayes.length})
												</td>
												<td className="px-4 py-3 text-right font-semibold text-emerald-600">
													{formatMontantFCFA(
														String(
															impayes.reduce((sum, i: any) => {
																const montant = Number(i.montant_paye ?? 0);
																return sum + (isNaN(montant) ? 0 : montant);
															}, 0),
														),
													)}
												</td>
												<td className="px-4 py-3 text-right font-semibold text-destructive">
													{formatMontantFCFA(
														String(
															impayes.reduce((sum, i: any) => {
																const montant = Number(
																	i.montant_impaye ?? i.reste ?? 0,
																);
																return sum + (isNaN(montant) ? 0 : montant);
															}, 0),
														),
													)}
												</td>
												<td className="px-4 py-3"></td>
											</tr>
										</tbody>
									</table>
								</div>
								{impayes.length > 10 && (
									<div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground border-t border-border">
										+{impayes.length - 10} autres impayés…
									</div>
								)}
							</div>
						)}
					</div>

					{/* RH - Détails */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Ressources humaines
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoCard
								label="Présents aujourd'hui"
								valeur={String(presentsAujourdhui)}
								icon={CheckCircle2}
								couleur="text-emerald-600"
								loading={pointagesQuery.isLoading}
							/>
							<InfoCard
								label="Retards aujourd'hui"
								valeur={String(retardsAujourdhui)}
								icon={Clock}
								couleur={
									retardsAujourdhui > 0
										? "text-amber-600"
										: "text-muted-foreground"
								}
								loading={pointagesQuery.isLoading}
							/>
							<InfoCard
								label="Masse salariale à payer"
								valeur={formatMontantFCFA(String(synthese.masse_salariale))}
								icon={Users}
								loading={syntheseQuery.isLoading}
							/>
						</div>

						{/* Liste des retards */}
						{retardsAujourdhui > 0 && (
							<div className="rounded-lg border border-amber-600/40 bg-amber-600/10 p-4">
								<p className="text-sm font-medium text-amber-600 mb-3">
									Employés arrivés en retard:
								</p>
								<ul className="space-y-2 text-xs">
									{pointages
										.filter((p) => p.statut === "RETARD")
										.slice(0, 10)
										.map((p) => (
											<li
												key={p.id_employe}
												className="flex items-center justify-between text-foreground"
											>
												<span>
													{p.employe_prenom} {p.employe_nom}
												</span>
												<span className="text-muted-foreground">
													{p.heure_arrivee
														? new Date(p.heure_arrivee).toLocaleTimeString(
																"fr-FR",
																{ hour: "2-digit", minute: "2-digit" },
															)
														: "—"}
												</span>
											</li>
										))}
								</ul>
							</div>
						)}
					</div>

					{/* Market et Stock */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Market & Inventaire
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoCard
								label="Produits en stock critique"
								valeur={String(produitsCritiques.length)}
								icon={AlertTriangle}
								couleur={
									produitsCritiques.length > 0
										? "text-destructive"
										: "text-muted-foreground"
								}
								loading={produitsCritiquesQuery.isLoading}
							/>
						</div>
						{produitsCritiques.length > 0 && (
							<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
								<p className="text-sm font-medium text-destructive mb-2">
									Produits à réapprovisionner:
								</p>
								<ul className="space-y-1 text-xs">
									{produitsCritiques.map((p) => (
										<li key={p.id_produit}>
											{p.nom} (stock: {p.quantite_stock})
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					{/* Pressing */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Blanchisserie
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoCard
								label="Commandes en cours"
								valeur={String(commandesPressing.length)}
								icon={Package}
								to="/pressing/commandes"
								loading={commandesPressingQuery.isLoading}
							/>
						</div>
					</div>

					{/* Services - Salle de fête */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">Services</h2>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoCard
								label="Réservations à venir"
								valeur={String(reservations.length)}
								icon={TrendingUp}
								loading={reservationsQuery.isLoading}
							/>
						</div>

						{/* Réservations Salle de Fête */}
						{reservationsQuery.isLoading ? (
							<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
								<p className="text-xs text-muted-foreground">
									Chargement des réservations…
								</p>
							</div>
						) : reservations.length === 0 ? (
							<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
								<p className="text-sm font-medium text-muted-foreground">
									Prochaines réservations (Salle de fête)
								</p>
								<p className="text-xs text-muted-foreground mt-2">
									Aucune réservation pour cette période
								</p>
							</div>
						) : (
							<div className="rounded-lg border border-border overflow-hidden">
								<div className="overflow-x-auto">
									<table className="w-full border-collapse text-sm">
										<thead className="bg-sea-ink text-left text-white">
											<tr>
												<th scope="col" className="px-4 py-3 font-medium">
													CLIENT
												</th>
												<th scope="col" className="px-4 py-3 font-medium">
													DATE
												</th>
												<th scope="col" className="px-4 py-3 font-medium">
													TYPE
												</th>
												<th scope="col" className="px-4 py-3 font-medium">
													STATUT
												</th>
											</tr>
										</thead>
										<tbody>
											{reservations
												.sort(
													(a: any, b: any) =>
														new Date(a.date_evenement || a.date).getTime() -
														new Date(b.date_evenement || b.date).getTime(),
												)
												.slice(0, 5)
												.map((r: any, idx) => (
													<tr
														key={idx}
														className="relative border-t border-border transition-colors hover:bg-accent/40"
													>
														<td className="px-4 py-3 font-medium text-foreground">
															{nomClientReservation(
																r,
																reservationsClientsQuery.data,
															)}
														</td>
														<td className="px-4 py-3 text-muted-foreground">
															{new Date(
																r.date_evenement || r.date,
															).toLocaleDateString("fr-FR")}
														</td>
														<td className="px-4 py-3 text-muted-foreground">
															{r.type_manifestation}
														</td>
														<td className="px-4 py-3">
															<span
																className={cn(
																	"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
																	r.statut === "CONFIRMEE"
																		? "bg-emerald-600/20 text-emerald-600"
																		: r.statut === "RESERVEE"
																			? "bg-amber-600/20 text-amber-600"
																			: "bg-gray-600/20 text-gray-600",
																)}
															>
																{r.statut}
															</span>
														</td>
													</tr>
												))}
										</tbody>
									</table>
								</div>
								{reservations.length > 5 && (
									<div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground border-t border-border">
										+{reservations.length - 5} autres réservations…
									</div>
								)}
							</div>
						)}
					</div>
				</>
			) : null}
		</div>
	);
}

/**
 * Nom du client d'une réservation salle de fête. Le lister backend ne renvoie
 * que `id_client` (jamais de nom embarqué) — résolu séparément via
 * `useClientsDetails` (même pattern que la fiche réservation). Repli sur les
 * champs spéculatifs de `Reservation` pour les cas où l'id manque encore.
 */
function nomClientReservation(
	reservation: Reservation,
	clients: Map<string, Client> | undefined,
): string {
	const client = reservation.id_client
		? clients?.get(reservation.id_client)
		: undefined;
	if (client) return nomComplet(client);

	const brut = reservation as {
		client?: string;
		nom_client?: string;
		name?: string;
		nom?: string;
		prenom?: string;
	};
	return (
		brut.client ??
		brut.nom_client ??
		brut.name ??
		brut.nom ??
		(brut.prenom ? `${brut.prenom} ${brut.nom}` : "—")
	);
}

/**
 * Dérive un fond teinté + couleur d'icône à partir de la couleur sémantique
 * déjà passée à la carte (`couleur`, ex. `text-destructive`) — une seule
 * source de vérité, pas de prop supplémentaire à chaque site d'appel.
 */
function iconTint(couleur: string): string {
	if (couleur.includes("emerald")) return "bg-emerald-600/15 text-emerald-600";
	if (couleur.includes("amber")) return "bg-amber-600/15 text-amber-600";
	if (couleur.includes("destructive"))
		return "bg-destructive/15 text-destructive";
	if (couleur.includes("muted-foreground"))
		return "bg-muted text-muted-foreground";
	// Défaut (ex. `text-foreground`) : accent de marque plutôt qu'un gris neutre.
	return "bg-lagoon/15 text-lagoon";
}

function KPICard({
	label,
	valeur,
	subtext,
	couleur,
	icon: Icon = TrendingUp,
}: {
	label: string;
	valeur: string;
	subtext?: string;
	couleur: string;
	icon?: typeof TrendingUp;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{label}
					</p>
					<p
						className={cn(
							"mt-2 text-lg font-bold sm:text-2xl break-words",
							couleur,
						)}
					>
						{valeur}
					</p>
					{subtext && (
						<p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
					)}
				</div>
				<div
					className={cn(
						"ml-4 flex size-10 shrink-0 items-center justify-center rounded-lg",
						iconTint(couleur),
					)}
				>
					<Icon className="size-5" />
				</div>
			</div>
		</div>
	);
}

function InfoCard({
	label,
	valeur,
	icon: Icon,
	couleur = "text-foreground",
	loading = false,
	subtext,
	to,
}: {
	label: string;
	valeur: string;
	icon: typeof TrendingUp;
	couleur?: string;
	loading?: boolean;
	subtext?: string;
	/** Rend la carte cliquable, vers la page métier concernée. */
	to?: ComponentProps<typeof Link>["to"];
}) {
	const contenu = (
		<div className="flex items-start justify-between">
			<div>
				<p className="text-xs font-medium text-muted-foreground">{label}</p>
				{loading ? (
					<p className="mt-2 text-sm text-muted-foreground">Chargement…</p>
				) : (
					<>
						<p className={cn("mt-2 text-2xl font-bold", couleur)}>{valeur}</p>
						{subtext && (
							<p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
						)}
					</>
				)}
			</div>
			<div
				className={cn(
					"flex size-10 shrink-0 items-center justify-center rounded-lg",
					iconTint(couleur),
				)}
			>
				<Icon className="size-5" />
			</div>
		</div>
	);

	if (to) {
		return (
			<Link
				to={to}
				className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/40"
			>
				{contenu}
			</Link>
		);
	}

	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
			{contenu}
		</div>
	);
}
