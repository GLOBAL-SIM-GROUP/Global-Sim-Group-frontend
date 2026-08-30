import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

import {
	CONTRAT_STATUT_LABELS,
	type Contrat,
	type ContratStatut,
} from "../models/contrats";
import {
	formatDateHeureISO,
	formatDateISO,
	formatMontantFCFA,
} from "../models/format";
import {
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type Sejour,
	type SejourStatut,
} from "../models/sejours";

const CONTRAT_STATUT_BADGE: Record<ContratStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	ACTIF: "bg-[#27AE60] text-white",
	RESILIE: "bg-[#E74C3C] text-white",
	TERMINE: "bg-[#2980B9] text-white",
};

const SEJOUR_STATUT_BADGE: Record<SejourStatut, string> = {
	EN_COURS: "bg-[#2980B9] text-white",
	TERMINE: "bg-[#27AE60] text-white",
	ANNULE: "bg-[#95A5A6] text-white",
};

interface LogementOccupationsTabProps {
	/** Contrats du logement (filtrés côté client par `id_logement`). */
	contrats: Contrat[];
	/** Séjours du logement (filtrés côté client par `id_logement`). */
	sejours: Sejour[];
}

/**
 * Onglet « Historique des occupations » de la fiche logement : contrats de
 * location passés + séjours courts, chacun filtré sur le logement courant.
 */
export function LogementOccupationsTab({
	contrats,
	sejours,
}: LogementOccupationsTabProps) {
	return (
		<div className="space-y-6">
			<section className="space-y-3">
				<h2 className="text-base font-semibold text-foreground">
					Contrats de location
				</h2>
				{contrats.length === 0 ? (
					<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
						Aucun contrat pour ce logement.
					</p>
				) : (
					<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										CONTRAT
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										TYPE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										DU
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										AU
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										LOYER
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										STATUT
									</th>
								</tr>
							</thead>
							<tbody>
								{contrats.map((contrat) => (
									<tr
										key={contrat.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-semibold">
											<Link
												to="/residence/contrats/$id"
												params={{ id: contrat.id }}
												className="text-lagoon transition-colors hover:underline"
											>
												{contrat.numero_contrat}
											</Link>
										</td>
										<td className="px-4 py-3 text-foreground">
											{contrat.type_location === "MENSUEL"
												? "Mensuel"
												: "Annuel"}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateISO(contrat.date_debut)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateISO(contrat.date_fin_prevue)}
										</td>
										<td className="px-4 py-3 text-foreground">
											{formatMontantFCFA(contrat.montant_loyer)}
										</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
													CONTRAT_STATUT_BADGE[contrat.statut],
												)}
											>
												{CONTRAT_STATUT_LABELS[contrat.statut]}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<section className="space-y-3">
				<h2 className="text-base font-semibold text-foreground">
					Séjours courts
				</h2>
				{sejours.length === 0 ? (
					<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
						Aucun séjour pour ce logement.
					</p>
				) : (
					<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										PRESTATION
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										CLIENT
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										ARRIVÉE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										DÉPART
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										TARIF
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										STATUT
									</th>
								</tr>
							</thead>
							<tbody>
								{sejours.map((sejour) => (
									<tr
										key={sejour.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 text-foreground">
											{SEJOUR_TYPE_LABELS[sejour.type_prestation]}
										</td>
										<td className="px-4 py-3 text-foreground">
											{[sejour.client_nom, sejour.client_prenoms]
												.filter(Boolean)
												.join(" ") || "—"}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateHeureISO(sejour.date_heure_arrivee)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateHeureISO(sejour.date_heure_depart_prevue)}
										</td>
										<td className="px-4 py-3 text-foreground">
											{formatMontantFCFA(sejour.tarif)}
										</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
													SEJOUR_STATUT_BADGE[sejour.statut],
												)}
											>
												{SEJOUR_STATUT_LABELS[sejour.statut]}
											</span>
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
