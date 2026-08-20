import { Link } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { usePortailEcheances } from "../hooks/use-portail";
import {
	ECHEANCE_STATUT_BADGE,
	ECHEANCE_STATUT_LABELS,
	libelleMoisAnnee,
} from "../models/portail";
import { RecuDialog } from "./recu-dialog";

/**
 * Page « Mes échéances de loyer » (M2.5.2) : tableau des échéances du résident
 * (payées, impayées, partielles, à venir) avec reçu téléchargeable.
 */
export function PortailEcheancesPage() {
	const echeancesQuery = usePortailEcheances();
	const [recuId, setRecuId] = useState<string | null>(null);

	if (echeancesQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (echeancesQuery.isError || !echeancesQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Mes échéances de loyer
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos échéances.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void echeancesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const { echeances, prochaine_echeance, total_impayes } = echeancesQuery.data;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Mes échéances de loyer" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Mes échéances de loyer
					</h1>
					<p className="text-muted-foreground">
						État de vos échéances de loyer.
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/portail">Retour à mon espace</Link>
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-4">
				{prochaine_echeance ? (
					<div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Prochaine échéance
						</p>
						<p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
							{libelleMoisAnnee(
								prochaine_echeance.mois,
								prochaine_echeance.annee,
							)}{" "}
							· {formatMontantFCFA(prochaine_echeance.montant)}
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
									ECHEANCE_STATUT_BADGE[prochaine_echeance.statut] ??
										"bg-[#95A5A6] text-white",
								)}
							>
								{ECHEANCE_STATUT_LABELS[prochaine_echeance.statut] ??
									prochaine_echeance.statut}
							</span>
						</p>
					</div>
				) : null}
				<div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Total impayés
					</p>
					<p className="mt-1 text-lg font-semibold text-destructive">
						{formatMontantFCFA(total_impayes)}
					</p>
				</div>
			</div>

			<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
				<table className="w-full border-collapse text-sm">
					<thead className="bg-sea-ink text-left text-white">
						<tr>
							<th scope="col" className="px-4 py-3 font-medium">
								PÉRIODE
							</th>
							<th scope="col" className="px-4 py-3 text-right font-medium">
								MONTANT
							</th>
							<th scope="col" className="px-4 py-3 text-right font-medium">
								PAYÉ
							</th>
							<th scope="col" className="px-4 py-3 font-medium">
								STATUT
							</th>
							<th scope="col" className="px-4 py-3 font-medium">
								ÉCHÉANCE
							</th>
							<th scope="col" className="px-4 py-3 font-medium">
								PAIEMENT
							</th>
							<th scope="col" className="px-4 py-3 text-right font-medium">
								REÇU
							</th>
						</tr>
					</thead>
					<tbody>
						{echeances.map((echeance) => (
							<tr
								key={echeance.id}
								className="border-t border-border transition-colors hover:bg-accent/40"
							>
								<td className="px-4 py-3 font-medium text-foreground">
									{libelleMoisAnnee(echeance.mois, echeance.annee)}
								</td>
								<td className="px-4 py-3 text-right text-foreground">
									{formatMontantFCFA(echeance.montant)}
								</td>
								<td className="px-4 py-3 text-right text-[#27AE60]">
									{echeance.montant_paye
										? formatMontantFCFA(echeance.montant_paye)
										: "—"}
								</td>
								<td className="px-4 py-3">
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
											ECHEANCE_STATUT_BADGE[echeance.statut] ??
												"bg-[#95A5A6] text-white",
										)}
									>
										{ECHEANCE_STATUT_LABELS[echeance.statut] ?? echeance.statut}
									</span>
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{formatDateISO(echeance.date_echeance)}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{echeance.date_paiement
										? formatDateISO(echeance.date_paiement.slice(0, 10))
										: "—"}
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-end">
										{echeance.statut === "PAYE" ? (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setRecuId(echeance.id)}
											>
												<FileDown className="size-4" aria-hidden />
												Reçu
											</Button>
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<RecuDialog
				open={recuId !== null}
				kind="echeance"
				id={recuId}
				onOpenChange={(ouvert) => {
					if (!ouvert) setRecuId(null);
				}}
			/>
		</div>
	);
}
