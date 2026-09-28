import { Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import {
	formatDateInstantUTC,
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { usePortailCaution } from "../hooks/use-portail";
import { CAUTION_STATUT_LABELS, cautionStatutVariant } from "../models/portail";

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
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (cautionQuery.isError || !cautionQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Ma caution</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger votre caution.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Ma caution" },
				]}
				title="Ma caution"
				description="Suivi de votre caution de location."
				actions={
					<Button variant="outline" size="sm" className="rounded-full" asChild>
						<Link to="/residence/portail">Retour à mon espace</Link>
					</Button>
				}
			/>

			{caution ? (
				<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
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
						<Badge variant={cautionStatutVariant(caution.statut)}>
							{CAUTION_STATUT_LABELS[caution.statut] ?? caution.statut}
						</Badge>
					</div>
					{caution.motif_retenue ? (
						<p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
							Motif de la retenue :{" "}
							<span className="text-foreground">{caution.motif_retenue}</span>
						</p>
					) : null}
				</section>
			) : (
				<EmptyState title="Aucune caution enregistrée." />
			)}

			<section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">
					Historique de la caution
				</h2>
				{historique.length === 0 ? (
					<EmptyState title="Aucun événement enregistré." />
				) : (
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>ÉVÉNEMENT</Th>
								<Th>DATE</Th>
								<Th className="text-right">MONTANT</Th>
								<Th>MOTIF</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{historique.map((evenement) => (
								<Tr
									key={`${evenement.evenement}-${evenement.date}-${evenement.montant ?? ""}`}
								>
									<Td className="font-medium text-foreground">
										{evenement.evenement}
									</Td>
									<Td className="text-muted-foreground">
										{formatDateInstantUTC(evenement.date)}
									</Td>
									<Td className="text-right text-foreground">
										{evenement.montant
											? formatMontantFCFA(evenement.montant)
											: "—"}
									</Td>
									<Td className="text-muted-foreground">
										{evenement.motif ?? "—"}
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				)}
			</section>
		</div>
	);
}
