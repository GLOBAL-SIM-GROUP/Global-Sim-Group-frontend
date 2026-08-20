import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Package,
	TrendingUp,
	Users,
	AlertTriangle,
} from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
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

import {
	useSyntheseGlobale,
	useLogementsDispo,
	useProduitsCritiques,
	useCommandesPressing,
	useReservationsSalle,
	usePointagesAujourdhui,
	useImpayes,
} from "../hooks/use-dashboard";

type PeriodeFiltre =
	| "aujourd_hui"
	| "hier"
	| "cette_semaine"
	| "ce_mois"
	| "mois_precedent"
	| "annee"
	| "personnalisee";

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
	const periodeParam = periode !== "personnalisee" ? periode : undefined;

	const syntheseQuery = useSyntheseGlobale(periodeParam);
	const logementsQuery = useLogementsDispo();
	const produitsQuery = useProduitsCritiques();
	const commandesQuery = useCommandesPressing();
	const reservationsQuery = useReservationsSalle();
	const pointagesQuery = usePointagesAujourdhui();
	const impayesQuery = useImpayes();

	const synthese = syntheseQuery.data;
	const logementsDispo = logementsQuery.data ?? [];
	const produitsCritiques = produitsQuery.data ?? [];
	const commandesPressing = commandesQuery.data ?? [];
	const reservations = reservationsQuery.data ?? [];
	const pointages = pointagesQuery.data ?? [];
	const impayes = impayesQuery.data ?? [];

	// Calcul des statistiques
	const presentsAujourdhui = pointages.filter((p) => p.statut === "present").length;
	const retardsAujourdhui = pointages.filter((p) => p.retard).length;

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
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
					<div className="flex-1">
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
								couleur={Number(synthese.solde) >= 0 ? "text-emerald-600" : "text-destructive"}
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
						<h2 className="text-lg font-semibold text-foreground">
							Résidence
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoCard
								label="Chambres disponibles"
								valeur={String(logementsDispo.length)}
								icon={CheckCircle2}
								loading={logementsQuery.isLoading}
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
								valeur={formatMontantFCFA(String(synthese.impayes.montant))}
								icon={AlertCircle}
								couleur="text-destructive"
								loading={syntheseQuery.isLoading}
							/>
						</div>

						{/* Liste des impayés */}
						{impayes.length > 0 && (
							<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
								<p className="text-sm font-medium text-destructive mb-3">
									Locataires ayant des impayés:
								</p>
								<div className="overflow-x-auto">
									<table className="w-full text-xs">
										<thead>
											<tr className="border-b border-destructive/20">
												<th className="text-left py-2 px-2 text-destructive font-semibold">
													Locataire
												</th>
												<th className="text-right py-2 px-2 text-destructive font-semibold">
													Montant
												</th>
												<th className="text-right py-2 px-2 text-destructive font-semibold">
													Échéance
												</th>
											</tr>
										</thead>
										<tbody>
											{impayes.slice(0, 10).map((i, idx) => (
												<tr key={idx} className="border-b border-destructive/10">
													<td className="py-2 px-2 text-foreground">{i.locataire}</td>
													<td className="text-right py-2 px-2 text-foreground">
														{formatMontantFCFA(String(i.montant))}
													</td>
													<td className="text-right py-2 px-2 text-muted-foreground">
														{new Date(i.date_echeance).toLocaleDateString("fr-FR")}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{impayes.length > 10 && (
									<p className="text-xs text-destructive mt-2">
										+{impayes.length - 10} autres impayés…
									</p>
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
								couleur={retardsAujourdhui > 0 ? "text-amber-600" : "text-muted-foreground"}
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
						{retardsAujourdhui > 0 && pointages.some((p) => p.retard) && (
							<div className="rounded-lg border border-amber-600/40 bg-amber-600/10 p-4">
								<p className="text-sm font-medium text-amber-600 mb-3">
									Employés arrivés en retard:
								</p>
								<ul className="space-y-2 text-xs">
									{pointages
										.filter((p) => p.retard)
										.slice(0, 10)
										.map((p, idx) => (
											<li key={idx} className="flex items-center justify-between text-foreground">
												<span>{p.nom}</span>
												<span className="text-muted-foreground">
													{p.heure_arrivee ? new Date(p.heure_arrivee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
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
								couleur={produitsCritiques.length > 0 ? "text-destructive" : "text-muted-foreground"}
								loading={produitsQuery.isLoading}
							/>
						</div>
						{produitsCritiques.length > 0 && (
							<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
								<p className="text-sm font-medium text-destructive mb-2">
									Produits à réapprovisionner:
								</p>
								<ul className="space-y-1 text-xs">
									{produitsCritiques.slice(0, 5).map((p) => (
										<li key={p.id_produit}>
											{p.nom} (stock: {p.stock})
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
								loading={commandesQuery.isLoading}
							/>
						</div>
					</div>

					{/* Restaurant & Salle */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Services
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
								<p className="text-sm font-medium text-muted-foreground mb-2">
									Prochaines réservations (Salle de fête)
								</p>
								{reservationsQuery.isLoading ? (
									<p className="text-xs text-muted-foreground">Chargement…</p>
								) : reservations.length === 0 ? (
									<p className="text-xs text-muted-foreground">Aucune réservation</p>
								) : (
									<ul className="space-y-2 text-xs">
										{reservations.slice(0, 3).map((r, idx) => (
											<li key={idx} className="text-foreground">
												{r.nom_client} - {new Date(r.date).toLocaleDateString("fr-FR")} à {r.heure_debut}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>


				</>
			) : null}
		</div>
	);
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
					<p className={cn("mt-2 text-lg font-bold sm:text-2xl break-words", couleur)}>
						{valeur}
					</p>
					{subtext && (
						<p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
					)}
				</div>
				<div className="ml-4 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
					<Icon className="size-5 text-muted-foreground" />
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
}: {
	label: string;
	valeur: string;
	icon: typeof TrendingUp;
	couleur?: string;
	loading?: boolean;
	subtext?: string;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-xs font-medium text-muted-foreground">{label}</p>
					{loading ? (
						<p className="mt-2 text-sm text-muted-foreground">Chargement…</p>
					) : (
						<>
							<p className={cn("mt-2 text-2xl font-bold", couleur)}>
								{valeur}
							</p>
							{subtext && (
								<p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
							)}
						</>
					)}
				</div>
				<div className="flex size-10 items-center justify-center rounded-lg bg-muted">
					<Icon className="size-5 text-muted-foreground" />
				</div>
			</div>
		</div>
	);
}
