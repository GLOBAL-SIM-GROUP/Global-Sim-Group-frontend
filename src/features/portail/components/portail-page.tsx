import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { usePortailResume } from "../hooks/use-portail";
import {
	ECHEANCE_STATUT_BADGE,
	ECHEANCE_STATUT_LABELS,
	libelleMoisAnnee,
} from "../models/portail";

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/**
 * Page « Mon espace résident » (M2.5.1) : récapitulatif de la situation
 * locative du résident connecté + liens vers ses échéances, paiements, caution.
 */
export function PortailPage() {
	const resumeQuery = usePortailResume();

	if (resumeQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (resumeQuery.isError || !resumeQuery.data) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Mon espace résident
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger votre espace résident.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void resumeQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const { client, contrat_en_cours, prochaine_echeance } = resumeQuery.data;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Mon espace résident
				</h1>
				<p className="text-muted-foreground">
					{client.prenoms} {client.nom} — récapitulatif de votre situation.
				</p>
			</section>

			{contrat_en_cours ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Contrat en cours
					</h2>
					<dl className="mt-3 grid gap-4 sm:grid-cols-2">
						<Ligne label="Numéro" valeur={contrat_en_cours.numero_contrat} />
						<Ligne
							label="Logement"
							valeur={`${contrat_en_cours.logement.numero} — ${contrat_en_cours.logement.nom} (bât. ${contrat_en_cours.logement.batiment})`}
						/>
						<Ligne
							label="Montant du loyer"
							valeur={formatMontantFCFA(contrat_en_cours.montant_loyer)}
						/>
						<Ligne label="Périodicité" valeur={contrat_en_cours.periodicite} />
						<Ligne
							label="Début"
							valeur={formatDateISO(contrat_en_cours.date_debut)}
						/>
						<Ligne
							label="Fin prévue"
							valeur={formatDateISO(contrat_en_cours.date_fin_prevue)}
						/>
					</dl>
				</section>
			) : null}

			{prochaine_echeance ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Prochaine échéance
					</h2>
					<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">
							{libelleMoisAnnee(
								prochaine_echeance.mois,
								prochaine_echeance.annee,
							)}{" "}
							—{" "}
							<span className="font-semibold text-foreground">
								{formatMontantFCFA(prochaine_echeance.montant)}
							</span>
						</p>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								ECHEANCE_STATUT_BADGE[prochaine_echeance.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{ECHEANCE_STATUT_LABELS[prochaine_echeance.statut] ??
								prochaine_echeance.statut}
						</span>
					</div>
				</section>
			) : null}
		</div>
	);
}
