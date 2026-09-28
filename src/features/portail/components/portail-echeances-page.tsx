import { Link } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import {
	formatDateInstantUTC,
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { usePortailEcheances } from "../hooks/use-portail";
import {
	ECHEANCE_STATUT_LABELS,
	echeancePortailStatutVariant,
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
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (echeancesQuery.isError || !echeancesQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
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
						className="rounded-full"
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Mes échéances de loyer" },
				]}
				title="Mes échéances de loyer"
				description="État de vos échéances de loyer."
				actions={
					<Button variant="outline" size="sm" className="rounded-full" asChild>
						<Link to="/residence/portail">Retour à mon espace</Link>
					</Button>
				}
			/>

			<div className="flex flex-wrap items-center gap-4">
				{prochaine_echeance ? (
					<div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Prochaine échéance
						</p>
						<p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
							{libelleMoisAnnee(
								prochaine_echeance.mois,
								prochaine_echeance.annee,
							)}{" "}
							· {formatMontantFCFA(prochaine_echeance.montant)}
							<Badge
								variant={echeancePortailStatutVariant(
									prochaine_echeance.statut,
								)}
							>
								{ECHEANCE_STATUT_LABELS[prochaine_echeance.statut] ??
									prochaine_echeance.statut}
							</Badge>
						</p>
					</div>
				) : null}
				<div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Total impayés
					</p>
					<p className="mt-1 text-lg font-semibold text-destructive">
						{formatMontantFCFA(total_impayes)}
					</p>
				</div>
			</div>

			<TableShell>
				<DataTable>
					<DataTableHead>
						<tr>
							<Th>PÉRIODE</Th>
							<Th className="text-right">MONTANT</Th>
							<Th className="text-right">PAYÉ</Th>
							<Th>STATUT</Th>
							<Th>ÉCHÉANCE</Th>
							<Th>PAIEMENT</Th>
							<Th className="text-right">REÇU</Th>
						</tr>
					</DataTableHead>
					<tbody>
						{echeances.map((echeance) => (
							<Tr key={echeance.id}>
								<Td className="font-medium text-foreground">
									{libelleMoisAnnee(echeance.mois, echeance.annee)}
								</Td>
								<Td className="text-right text-foreground">
									{formatMontantFCFA(echeance.montant)}
								</Td>
								<Td className="text-right text-success">
									{echeance.montant_paye
										? formatMontantFCFA(echeance.montant_paye)
										: "—"}
								</Td>
								<Td>
									<Badge
										variant={echeancePortailStatutVariant(echeance.statut)}
									>
										{ECHEANCE_STATUT_LABELS[echeance.statut] ?? echeance.statut}
									</Badge>
								</Td>
								<Td className="text-muted-foreground">
									{formatDateISO(echeance.date_echeance)}
								</Td>
								<Td className="text-muted-foreground">
									{echeance.date_paiement
										? formatDateInstantUTC(echeance.date_paiement)
										: "—"}
								</Td>
								<Td>
									<div className="flex items-center justify-end">
										{echeance.statut === "PAYE" ? (
											<Button
												variant="ghost"
												size="sm"
												className="rounded-full"
												onClick={() => setRecuId(echeance.id)}
											>
												<FileDown className="size-4" aria-hidden />
												Reçu
											</Button>
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
									</div>
								</Td>
							</Tr>
						))}
					</tbody>
				</DataTable>
			</TableShell>

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
