import { Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import { EmptyState } from "#/components/ui/empty-state";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";

import {
	CONTRAT_STATUT_LABELS,
	CONTRAT_STATUT_VARIANT,
	type Contrat,
} from "../models/contrats";
import {
	formatDateHeureISO,
	formatDateISO,
	formatMontantFCFA,
} from "../models/format";
import {
	SEJOUR_STATUT_LABELS,
	SEJOUR_STATUT_VARIANT,
	SEJOUR_TYPE_LABELS,
	type Sejour,
} from "../models/sejours";

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
					<EmptyState title="Aucun contrat pour ce logement." />
				) : (
					<TableShell>
						<DataTable>
							<DataTableHead>
								<tr>
									<Th>CONTRAT</Th>
									<Th>TYPE</Th>
									<Th>DU</Th>
									<Th>AU</Th>
									<Th>LOYER</Th>
									<Th>STATUT</Th>
								</tr>
							</DataTableHead>
							<tbody>
								{contrats.map((contrat) => (
									<Tr key={contrat.id}>
										<Td className="font-semibold">
											<Link
												to="/residence/contrats/$id"
												params={{ id: contrat.id }}
												className="text-lagoon transition-colors hover:underline"
											>
												{contrat.numero_contrat}
											</Link>
										</Td>
										<Td className="text-foreground">
											{contrat.type_location === "MENSUEL"
												? "Mensuel"
												: "Annuel"}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateISO(contrat.date_debut)}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateISO(contrat.date_fin_prevue)}
										</Td>
										<Td className="text-foreground">
											{formatMontantFCFA(contrat.montant_loyer)}
										</Td>
										<Td>
											<Badge variant={CONTRAT_STATUT_VARIANT[contrat.statut]}>
												{CONTRAT_STATUT_LABELS[contrat.statut]}
											</Badge>
										</Td>
									</Tr>
								))}
							</tbody>
						</DataTable>
					</TableShell>
				)}
			</section>

			<section className="space-y-3">
				<h2 className="text-base font-semibold text-foreground">
					Séjours courts
				</h2>
				{sejours.length === 0 ? (
					<EmptyState title="Aucun séjour pour ce logement." />
				) : (
					<TableShell>
						<DataTable>
							<DataTableHead>
								<tr>
									<Th>PRESTATION</Th>
									<Th>CLIENT</Th>
									<Th>ARRIVÉE</Th>
									<Th>DÉPART</Th>
									<Th>TARIF</Th>
									<Th>STATUT</Th>
								</tr>
							</DataTableHead>
							<tbody>
								{sejours.map((sejour) => (
									<Tr key={sejour.id}>
										<Td className="text-foreground">
											{SEJOUR_TYPE_LABELS[sejour.type_prestation]}
										</Td>
										<Td className="text-foreground">
											{[sejour.client_nom, sejour.client_prenoms]
												.filter(Boolean)
												.join(" ") || "—"}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateHeureISO(sejour.date_heure_arrivee)}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateHeureISO(sejour.date_heure_depart_prevue)}
										</Td>
										<Td className="text-foreground">
											{formatMontantFCFA(sejour.tarif)}
										</Td>
										<Td>
											<Badge variant={SEJOUR_STATUT_VARIANT[sejour.statut]}>
												{SEJOUR_STATUT_LABELS[sejour.statut]}
											</Badge>
										</Td>
									</Tr>
								))}
							</tbody>
						</DataTable>
					</TableShell>
				)}
			</section>
		</div>
	);
}
