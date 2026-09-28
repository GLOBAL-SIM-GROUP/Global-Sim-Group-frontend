import { Link } from "@tanstack/react-router";
import { AlertTriangle, HandCoins } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import { isCaisseFermeeError, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { nomComplet } from "#/features/residence/models/clients";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { PaiementDialog } from "#/features/salle-fete/components/paiement-dialog";

import { useCreerPaiementFacture, useFacture } from "../hooks/use-factures";
import {
	FACTURE_SOURCE_LABELS,
	FACTURE_STATUT_LABELS,
	FACTURE_STATUT_VARIANT,
} from "../models/factures";
import { FactureDownloadButtons } from "./facture-download-buttons";

/** Ligne lecture seule de la fiche. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

interface FactureFichePageProps {
	/** Id de la facture (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche facture » (M7) : informations de la facture, lignes et
 * « Enregistrer un paiement » (solde d'une facture partielle ou impayée).
 */
export function FactureFichePage({ id }: FactureFichePageProps) {
	const canCreer = useCan("FACTURATION.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	const factureQuery = useFacture(id);
	const clientsDetails = useClientsDetails(
		factureQuery.data?.id_client ? [factureQuery.data.id_client] : [],
	);
	const moyensQuery = useMoyensPaiement();
	const payerMutation = useCreerPaiementFacture();
	const [paiementOuvert, setPaiementOuvert] = useState(false);

	if (factureQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (factureQuery.isError || !factureQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Fiche facture
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Facture introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/facturation/factures">Retour à la facturation</Link>
					</Button>
				</div>
			</div>
		);
	}

	const facture = factureQuery.data;
	const client = facture.id_client
		? clientsDetails.data?.get(facture.id_client)
		: undefined;
	const peutEncaisser =
		canCreer &&
		canFinancesVoir &&
		(facture.statut === "PARTIELLE" || facture.statut === "IMPAYEE");

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Facturation ponctuelle", to: "/facturation/factures" },
					{ label: facture.numero },
				]}
				title={`Fiche facture — ${facture.numero}`}
				description={
					<>
						{facture.source_type
							? (FACTURE_SOURCE_LABELS[facture.source_type] ??
								facture.source_type)
							: "Facture ponctuelle"}{" "}
						· {FACTURE_STATUT_LABELS[facture.statut].toLowerCase()}.
					</>
				}
				actions={
					<>
						<FactureDownloadButtons idFacture={id} />
						<Button variant="outline" asChild>
							<Link to="/facturation/factures">Retour à la facturation</Link>
						</Button>
					</>
				}
			/>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<dl className="grid flex-1 gap-4 sm:grid-cols-2">
						<Ligne label="Numéro" valeur={facture.numero} />
						<Ligne label="Date" valeur={formatDateHeureUTC(facture.date)} />
						<Ligne label="Client" valeur={client ? nomComplet(client) : "—"} />
						<Ligne
							label="Remise"
							valeur={facture.remise ? formatMontantFCFA(facture.remise) : "—"}
						/>
						<Ligne
							label="Montant total"
							valeur={formatMontantFCFA(facture.montant_total)}
						/>
						<Ligne
							label="Montant payé"
							valeur={formatMontantFCFA(facture.montant_paye)}
						/>
						<Ligne label="Reste dû" valeur={formatMontantFCFA(facture.reste)} />
					</dl>
					<div className="flex flex-col items-end gap-3">
						<Badge variant={FACTURE_STATUT_VARIANT[facture.statut]}>
							{FACTURE_STATUT_LABELS[facture.statut]}
						</Badge>
						{peutEncaisser ? (
							<Button onClick={() => setPaiementOuvert(true)}>
								<HandCoins className="size-4" aria-hidden />
								Enregistrer un paiement
							</Button>
						) : null}
					</div>
				</div>
			</section>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">Lignes</h2>
				{facture.lignes.length === 0 ? (
					<EmptyState title="Aucune ligne sur cette facture." />
				) : (
					// Pas de `TableShell` ici : la table est déjà nichée dans la
					// `<section>` bordée/ombrée ci-dessus — un second cadre ferait
					// une bordure dans la bordure.
					<div className="overflow-x-auto">
						<DataTable>
							<DataTableHead>
								<tr>
									<Th>LIBELLÉ</Th>
									<Th className="text-right">QTÉ</Th>
									<Th className="text-right">PRIX UNITAIRE</Th>
									<Th className="text-right">TOTAL</Th>
								</tr>
							</DataTableHead>
							<tbody>
								{facture.lignes.map((ligne) => (
									<Tr key={ligne.id}>
										<Td className="font-medium text-foreground">
											{ligne.libelle}
										</Td>
										<Td className="text-right text-muted-foreground">
											{ligne.quantite}
										</Td>
										<Td className="text-right text-foreground">
											{formatMontantFCFA(ligne.prix_unitaire)}
										</Td>
										<Td className="text-right font-semibold text-foreground">
											{formatMontantFCFA(ligne.total)}
										</Td>
									</Tr>
								))}
							</tbody>
						</DataTable>
					</div>
				)}
			</section>

			{payerMutation.isError ? (
				isCaisseFermeeError(payerMutation.error) ? (
					<div
						role="alert"
						className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
					>
						<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
						<span>{toApiError(payerMutation.error).message}</span>
					</div>
				) : (
					<div
						role="alert"
						className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
					>
						Impossible d'enregistrer le paiement.
					</div>
				)
			) : null}

			<Dialog open={paiementOuvert} onOpenChange={setPaiementOuvert}>
				<DialogContent>
					<DialogTitle>Enregistrer un paiement</DialogTitle>
					<DialogDescription>
						Facture {facture.numero} — reste {formatMontantFCFA(facture.reste)}.
					</DialogDescription>
					<div className="mt-4">
						<PaiementDialog
							titre="Encaisser"
							montantDefaut={facture.reste}
							moyens={(moyensQuery.data ?? []).filter((moyen) => moyen.actif)}
							onOpenChange={setPaiementOuvert}
							onValider={(montant, idMoyen) => {
								payerMutation.mutate(
									{ id, montant, idMoyen },
									{ onSettled: () => setPaiementOuvert(false) },
								);
							}}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
