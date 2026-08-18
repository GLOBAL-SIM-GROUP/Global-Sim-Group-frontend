import { Link } from "@tanstack/react-router";
import { FileDown } from "lucide-react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useRapportRh } from "../hooks/use-rapports";
import { telechargerTexte } from "../lib/export";
import {
	construireCsv,
	libelleStatutIndicateur,
	periodeParDefaut,
	type RapportPeriodeSearch,
} from "../models/rapports";

interface RapportRhPageProps {
	initialSearch: RapportPeriodeSearch;
}

/**
 * Page « Rapport RH » (M10) : synthèse du pointage (statuts, heures) et de la
 * paie (par statut, masse versée) sur la période.
 */
export function RapportRhPage({ initialSearch }: RapportRhPageProps) {
	const periode = periodeParDefaut(initialSearch);
	const rapportQuery = useRapportRh(periode.du, periode.au);

	const exporter = () => {
		if (!rapportQuery.data) return;
		const { pointage, paie } = rapportQuery.data;
		const lignes: (string | number)[][] = [
			["Période", `${periode.du} → ${periode.au}`],
			[],
			["POINTAGE"],
			["Statut", "Nombre"],
			...Object.entries(pointage.par_statut).map(([statut, nombre]) => [
				libelleStatutIndicateur(statut),
				nombre,
			]),
			["Total pointés", pointage.total_pointes],
			["Total heures", pointage.total_duree],
			["Heures supplémentaires", pointage.total_heures_sup],
			[],
			["PAIE"],
			["Statut", "Montant"],
			...Object.entries(paie.par_statut).map(([statut, montant]) => [
				statut,
				montant,
			]),
			["Total versé", paie.total_verse],
		];
		telechargerTexte(
			`rapport-rh-${periode.du}-${periode.au}.csv`,
			construireCsv(lignes),
		);
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Rapports", to: "/rapports" },
					{ label: "Rapport RH" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Rapport RH</h1>
					<p className="text-muted-foreground">
						Période du {periode.du} au {periode.au}.
					</p>
				</section>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/rapports">Nouveau rapport</Link>
					</Button>
					<Button size="sm" onClick={exporter} disabled={!rapportQuery.data}>
						<FileDown className="size-4" aria-hidden />
						Exporter en Excel (CSV)
					</Button>
				</div>
			</div>

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
					<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-foreground">
							Synthèse du pointage
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5 rounded-lg border border-border bg-sea-ink/5 p-3">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Répartition par statut
								</p>
								{Object.entries(rapportQuery.data.pointage.par_statut).map(
									([statut, nombre]) => (
										<p key={statut} className="flex justify-between text-sm">
											<span className="text-muted-foreground">
												{libelleStatutIndicateur(statut)}
											</span>
											<span className="font-medium text-foreground">
												{nombre}
											</span>
										</p>
									),
								)}
							</div>
							<div className="space-y-1.5 rounded-lg border border-border bg-sea-ink/5 p-3">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Totaux
								</p>
								<p className="flex justify-between text-sm">
									<span className="text-muted-foreground">Total pointés</span>
									<span className="font-medium text-foreground">
										{rapportQuery.data.pointage.total_pointes}
									</span>
								</p>
								<p className="flex justify-between text-sm">
									<span className="text-muted-foreground">Total heures</span>
									<span className="font-medium text-foreground">
										{rapportQuery.data.pointage.total_duree} h
									</span>
								</p>
								<p className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Heures supplémentaires
									</span>
									<span className="font-medium text-foreground">
										{rapportQuery.data.pointage.total_heures_sup} h
									</span>
								</p>
							</div>
						</div>
					</section>

					<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-foreground">
							Synthèse de la paie
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5 rounded-lg border border-border bg-sea-ink/5 p-3">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Montants par statut
								</p>
								{Object.entries(rapportQuery.data.paie.par_statut).map(
									([statut, montant]) => (
										<p key={statut} className="flex justify-between text-sm">
											<span className="text-muted-foreground">{statut}</span>
											<span className="font-medium text-foreground">
												{formatMontantFCFA(montant)}
											</span>
										</p>
									),
								)}
							</div>
							<div className="space-y-1.5 rounded-lg border border-border bg-sea-ink/5 p-3">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Total
								</p>
								<p className="mt-1 text-lg font-semibold text-[#27AE60]">
									{formatMontantFCFA(rapportQuery.data.paie.total_verse)}
								</p>
							</div>
						</div>
					</section>
				</>
			) : null}
		</div>
	);
}
