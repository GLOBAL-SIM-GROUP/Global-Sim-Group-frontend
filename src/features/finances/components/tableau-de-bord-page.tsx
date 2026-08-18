import { Breadcrumb } from "#/components/ui/breadcrumb";
import { useCan } from "#/core/auth";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useTableauBord } from "../hooks/use-finances";

function periodeAffichee(periode: string): string {
	// Période wire ex. "2026-08" ou "2026-08-01" → « août 2026 »
	const [annee, mois] = periode.slice(0, 7).split("-");
	if (!annee || !mois) return periode;
	const nom = new Date(Number(annee), Number(mois) - 1, 1).toLocaleDateString(
		"fr-FR",
		{ month: "long" },
	);
	return `${nom} ${annee}`;
}

/**
 * Page « Tableau de bord financier » (module Finances, M8) : synthèse des
 * encaissements / décaissements / marge par période.
 */
export function TableauDeBordPage() {
	const canVoir = useCan("FINANCES.VOIR");
	const tableauBordQuery = useTableauBord();

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au tableau de bord financier.
			</div>
		);
	}

	const lignes = tableauBordQuery.data ?? [];

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Tableau de bord financier" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Tableau de bord financier
				</h1>
				<p className="text-muted-foreground">
					Synthèse de la trésorerie par période.
				</p>
			</section>

			{tableauBordQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : tableauBordQuery.isError ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger le tableau de bord.</p>
				</div>
			) : lignes.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune donnée financière disponible.
				</div>
			) : (
				<div className="space-y-6">
					{lignes.map((ligne) => (
						<section
							key={ligne.periode}
							className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm"
						>
							<h2 className="text-lg font-semibold text-foreground">
								{periodeAffichee(ligne.periode)}
							</h2>
							<div className="grid grid-cols-2 gap-3 md:grid-cols-5">
								<Indicateur
									label="Encaissements"
									valeur={formatMontantFCFA(ligne.encaissements)}
									couleur="text-[#27AE60]"
								/>
								<Indicateur
									label="Décaissements"
									valeur={formatMontantFCFA(ligne.decaissements)}
									couleur="text-destructive"
								/>
								<Indicateur
									label="Marge nette"
									valeur={formatMontantFCFA(ligne.marge_nette)}
									couleur="text-foreground"
								/>
								<Indicateur
									label="Factures émises"
									valeur={ligne.factures_emises}
									couleur="text-muted-foreground"
								/>
								<Indicateur
									label="Montant facturé"
									valeur={formatMontantFCFA(ligne.montant_factures)}
									couleur="text-muted-foreground"
								/>
							</div>
						</section>
					))}
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
		<div className="rounded-lg border border-border bg-sea-ink/5 p-3">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className={`mt-1 text-lg font-semibold ${couleur}`}>{valeur}</p>
		</div>
	);
}
