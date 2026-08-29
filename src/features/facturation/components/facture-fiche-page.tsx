import { Link } from "@tanstack/react-router";
import { HandCoins } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { nomComplet } from "#/features/residence/models/clients";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { PaiementDialog } from "#/features/salle-fete/components/paiement-dialog";
import { cn } from "#/lib/utils";

import { useCreerPaiementFacture, useFacture } from "../hooks/use-factures";
import {
	FACTURE_SOURCE_LABELS,
	FACTURE_STATUT_BADGE,
	FACTURE_STATUT_LABELS,
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
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (factureQuery.isError || !factureQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
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
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Facturation ponctuelle", to: "/facturation/factures" },
					{ label: facture.numero },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche facture — {facture.numero}
					</h1>
					<p className="text-muted-foreground">
						{facture.source_type
							? (FACTURE_SOURCE_LABELS[facture.source_type] ??
								facture.source_type)
							: "Facture ponctuelle"}{" "}
						· {FACTURE_STATUT_LABELS[facture.statut].toLowerCase()}.
					</p>
				</section>

				<div className="flex flex-wrap items-center gap-2">
					<FactureDownloadButtons idFacture={id} />
					<Button variant="outline" asChild>
						<Link to="/facturation/factures">Retour à la facturation</Link>
					</Button>
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<dl className="grid flex-1 gap-4 sm:grid-cols-2">
						<Ligne label="Numéro" valeur={facture.numero} />
						<Ligne label="Date" valeur={formatDateHeureISO(facture.date)} />
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
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								FACTURE_STATUT_BADGE[facture.statut],
							)}
						>
							{FACTURE_STATUT_LABELS[facture.statut]}
						</span>
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
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucune ligne sur cette facture.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										LIBELLÉ
									</th>
									<th scope="col" className="px-4 py-3 text-right font-medium">
										QTÉ
									</th>
									<th scope="col" className="px-4 py-3 text-right font-medium">
										PRIX UNITAIRE
									</th>
									<th scope="col" className="px-4 py-3 text-right font-medium">
										TOTAL
									</th>
								</tr>
							</thead>
							<tbody>
								{facture.lignes.map((ligne) => (
									<tr
										key={ligne.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{ligne.libelle}
										</td>
										<td className="px-4 py-3 text-right text-muted-foreground">
											{ligne.quantite}
										</td>
										<td className="px-4 py-3 text-right text-foreground">
											{formatMontantFCFA(ligne.prix_unitaire)}
										</td>
										<td className="px-4 py-3 text-right font-semibold text-foreground">
											{formatMontantFCFA(ligne.total)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{payerMutation.isError ? (
				<div
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					Impossible d'enregistrer le paiement.
				</div>
			) : null}

			{paiementOuvert ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
					<div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
						<h3 className="text-base font-semibold text-foreground">
							Enregistrer un paiement
						</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Facture {facture.numero} — reste{" "}
							{formatMontantFCFA(facture.reste)}.
						</p>
						<div className="mt-4">
							<PaiementDialog
								titre="Encaisser"
								montantDefaut={facture.reste}
								moyens={(moyensQuery.data ?? []).filter((moyen) => moyen.actif)}
								onOpenChange={() => setPaiementOuvert(false)}
								onValider={(montant, idMoyen) => {
									payerMutation.mutate(
										{ id, montant, idMoyen },
										{ onSettled: () => setPaiementOuvert(false) },
									);
								}}
							/>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
