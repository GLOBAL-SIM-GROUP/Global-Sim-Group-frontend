import { ArrowRight, TrendingUp } from "lucide-react";
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
import { getAccessibleModules } from "#/core/permissions/modules";
import { usePermissions } from "#/core/auth";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import { useNavigate } from "@tanstack/react-router";

import { useSyntheseGlobale } from "../hooks/use-dashboard";

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
	const navigate = useNavigate();
	const permissions = usePermissions();
	const accessibleModules = getAccessibleModules(permissions);

	const [periode, setPeriode] = useState<PeriodeFiltre>("ce_mois");
	const periodeParam = periode !== "personnalisee" ? periode : undefined;

	const syntheseQuery = useSyntheseGlobale();
	const synthese = syntheseQuery.data;

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
					{/* KPIs */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<KPICard
							label="Recettes totales"
							valeur={formatMontantFCFA(String(synthese.total_recettes))}
							couleur="text-emerald-600"
						/>
						<KPICard
							label="Dépenses totales"
							valeur={formatMontantFCFA(String(synthese.total_depenses))}
							couleur="text-amber-600"
						/>
						<KPICard
							label="Solde"
							valeur={formatMontantFCFA(String(synthese.solde))}
							couleur={Number(synthese.solde) >= 0 ? "text-emerald-600" : "text-destructive"}
						/>
						<KPICard
							label="Masse salariale"
							valeur={formatMontantFCFA(String(synthese.masse_salariale))}
							couleur="text-blue-600"
						/>
						<KPICard
							label="Impayés"
							valeur={`${synthese.impayes.nombre} (${formatMontantFCFA(String(synthese.impayes.montant))})`}
							couleur="text-destructive"
						/>
					</div>

					{/* Recettes par activité */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Recettes par activité
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

					{/* Accès rapide aux modules */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-foreground">
							Accès rapide
						</h2>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							{accessibleModules.map((module) => (
								<Button
									key={module.code}
									variant="outline"
									className="h-auto flex-col items-start justify-start gap-2 p-4 text-left"
									onClick={() =>
										navigate({ to: module.path, replace: false })
									}
								>
									<div className="flex w-full items-center justify-between">
										<span className="font-semibold text-foreground">
											{module.title}
										</span>
										<ArrowRight className="size-4" />
									</div>
									<p className="text-xs text-muted-foreground">
										{module.description}
									</p>
								</Button>
							))}
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
	couleur,
}: {
	label: string;
	valeur: string;
	couleur: string;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{label}
					</p>
					<p className={cn("mt-2 text-lg font-bold sm:text-2xl break-words", couleur)}>
						{valeur}
					</p>
				</div>
				<div className="ml-4 flex size-10 items-center justify-center rounded-lg bg-muted">
					<TrendingUp className="size-5 text-muted-foreground" />
				</div>
			</div>
		</div>
	);
}
