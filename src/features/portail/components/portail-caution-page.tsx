import { Link } from "@tanstack/react-router";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { usePortailCaution } from "../hooks/use-portail";
import { CAUTION_STATUT_BADGE, CAUTION_STATUT_LABELS } from "../models/portail";

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[12rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/**
 * Page « Ma caution » (M2.5.4) : montant, versement, statut (en cours,
 * restituée, retenue — avec motif) et historique des événements.
 */
export function PortailCautionPage() {
	const cautionQuery = usePortailCaution();

	if (cautionQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (cautionQuery.isError || !cautionQuery.data) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Ma caution</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger votre caution.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void cautionQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const { caution, historique } = cautionQuery.data;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Ma caution" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Ma caution</h1>
					<p className="text-muted-foreground">
						Suivi de votre caution de location.
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/portail">Retour à mon espace</Link>
				</Button>
			</div>

			{caution ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<dl className="grid gap-4 sm:grid-cols-2">
						<Ligne
							label="Montant"
							valeur={formatMontantFCFA(caution.montant)}
						/>
						<Ligne
							label="Date de versement"
							valeur={formatDateISO(caution.date_versement)}
						/>
						<Ligne
							label="Montant restitué"
							valeur={
								caution.montant_restitue
									? formatMontantFCFA(caution.montant_restitue)
									: "—"
							}
						/>
						<Ligne
							label="Retenue"
							valeur={
								caution.retenue ? formatMontantFCFA(caution.retenue) : "—"
							}
						/>
					</dl>
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								CAUTION_STATUT_BADGE[caution.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{CAUTION_STATUT_LABELS[caution.statut] ?? caution.statut}
						</span>
					</div>
					{caution.motif_retenue ? (
						<p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
							Motif de la retenue :{" "}
							<span className="text-foreground">{caution.motif_retenue}</span>
						</p>
					) : null}
				</section>
			) : (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune caution enregistrée.
				</div>
			)}

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">
					Historique de la caution
				</h2>
				{historique.length === 0 ? (
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucun événement enregistré.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										ÉVÉNEMENT
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										DATE
									</th>
									<th scope="col" className="px-4 py-3 text-right font-medium">
										MONTANT
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										MOTIF
									</th>
								</tr>
							</thead>
							<tbody>
								{historique.map((evenement) => (
									<tr
										key={`${evenement.evenement}-${evenement.date}-${evenement.montant ?? ""}`}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{evenement.evenement}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateHeureHeure(evenement.date)}
										</td>
										<td className="px-4 py-3 text-right text-foreground">
											{evenement.montant
												? formatMontantFCFA(evenement.montant)
												: "—"}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{evenement.motif ?? "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}

/** Formate une date du wire (`YYYY-MM-DD` ou `YYYY-MM-DD HH:MM:SS`). */
function formatDateHeureHeure(date: string): string {
	const jour = date.slice(0, 10);
	return jour ? formatDateISO(jour) : date;
}
