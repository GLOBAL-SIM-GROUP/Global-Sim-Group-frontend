import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	HandCoins,
	Pencil,
	Receipt,
	XCircle,
} from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { FactureDownloadButtons } from "#/features/facturation/components/facture-download-buttons";
import {
	FACTURE_STATUT_BADGE,
	FACTURE_STATUT_LABELS,
} from "#/features/facturation/models/factures";
import { cn } from "#/lib/utils";

import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import { useSejour, useSejourFacture } from "../hooks/use-sejours";
import { formatDateHeureISO, formatMontantFCFA } from "../models/format";
import {
	SEJOUR_ORIGINE_LABELS,
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type Sejour,
	type SejourStatut,
} from "../models/sejours";
import { PayerSejourFormDialog } from "./payer-sejour-form-dialog";
import { SejourFormDialog } from "./sejour-form-dialog";
import { RefuserSejourDialog } from "./sejour-refuser-dialog";
import { ValiderSejourDialog } from "./sejour-valider-dialog";

const SEJOUR_STATUT_BADGE: Record<SejourStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	EN_COURS: "bg-[#2980B9] text-white",
	TERMINE: "bg-[#27AE60] text-white",
	ANNULE: "bg-[#95A5A6] text-white",
};

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

interface SejourFichePageProps {
	/** Id du séjour (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche séjour — [ID] » (M2.3) : informations du client, détails du
 * séjour et paiement (total, payé, reste), section facture. Boutons Modifier
 * et Enregistrer un paiement.
 *
 * `RESIDENCE.ENCAISSER` (pas `RESIDENCE.CREER`) gate l'encaissement : le
 * réceptionniste crée des séjours sans pouvoir encaisser, le caissier
 * résidence encaisse sans pouvoir créer (vérifié en direct sur les rôles
 * réels 2026-09-13).
 */
export function SejourFichePage({ id }: SejourFichePageProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canEncaisser = useCan("RESIDENCE.ENCAISSER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const canFacturationVoir = useCan("FACTURATION.VOIR");
	const canValider = useCan("RESIDENCE.VALIDER");
	const canAnnuler = useCan("RESIDENCE.ANNULER");
	const moyensQuery = useMoyensPaiement();
	const [aModifier, setAModifier] = useState<Sejour | null>(null);
	const [aPayer, setAPayer] = useState<Sejour | null>(null);
	const [aValider, setAValider] = useState<Sejour | null>(null);
	const [aRefuser, setARefuser] = useState<Sejour | null>(null);

	const sejourQuery = useSejour(id);
	const factureQuery = useSejourFacture(id);

	if (sejourQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (sejourQuery.isError || !sejourQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Fiche séjour</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Séjour introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/sejours-courts">
							Retour à la liste des séjours
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const sejour = sejourQuery.data;
	const enAttente = sejour.statut === "EN_ATTENTE";
	const aUnReste = Number(sejour.reste_a_payer) > 0;
	const facture = factureQuery.data ?? null;

	return (
		<div className="w-full space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Séjours courts", to: "/residence/sejours-courts" },
					{ label: `Séjour ${sejour.id}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche séjour — {sejour.id}
					</h1>
					<p className="text-muted-foreground">
						{SEJOUR_TYPE_LABELS[sejour.type_prestation]} ·{" "}
						{sejour.numero_logement}
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link to="/residence/sejours-courts">Retour aux séjours</Link>
					</Button>
					{canValider && enAttente ? (
						<Button onClick={() => setAValider(sejour)}>
							<CheckCircle2 className="size-4" aria-hidden />
							Valider la demande
						</Button>
					) : null}
					{canAnnuler && enAttente ? (
						<Button
							variant="outline"
							className="text-destructive hover:bg-destructive/10"
							onClick={() => setARefuser(sejour)}
						>
							<XCircle className="size-4" aria-hidden />
							Refuser
						</Button>
					) : null}
					{canModifier && sejour.statut !== "TERMINE" ? (
						<Button onClick={() => setAModifier(sejour)}>
							<Pencil className="size-4" aria-hidden />
							Modifier
						</Button>
					) : null}
					{canEncaisser && canFinancesVoir && aUnReste ? (
						<Button onClick={() => setAPayer(sejour)}>
							<HandCoins className="size-4" aria-hidden />
							Enregistrer un paiement
						</Button>
					) : null}
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne
						label="Client"
						valeur={
							[sejour.client_nom, sejour.client_prenoms]
								.filter(Boolean)
								.join(" ") || "—"
						}
					/>
					<Ligne
						label="Type"
						valeur={SEJOUR_TYPE_LABELS[sejour.type_prestation]}
					/>
					<Ligne label="Logement" valeur={sejour.numero_logement} />
					<Ligne
						label="Origine"
						valeur={SEJOUR_ORIGINE_LABELS[sejour.origine] ?? sejour.origine}
					/>
					{sejour.nombre_personnes != null ? (
						<Ligne label="Personnes" valeur={String(sejour.nombre_personnes)} />
					) : null}
					<Ligne
						label="Arrivée"
						valeur={formatDateHeureISO(sejour.date_heure_arrivee)}
					/>
					<Ligne
						label="Départ prévu"
						valeur={formatDateHeureISO(sejour.date_heure_depart_prevue)}
					/>
					<Ligne label="Durée" valeur={sejour.duree ?? "—"} />
					<Ligne
						label="Tarif"
						valeur={
							sejour.tarif
								? formatMontantFCFA(sejour.tarif)
								: "En attente de chiffrage"
						}
					/>
					<Ligne
						label="Montant total"
						valeur={formatMontantFCFA(sejour.montant_total)}
					/>
					<Ligne
						label="Montant payé"
						valeur={formatMontantFCFA(sejour.montant_paye)}
					/>
					<Ligne
						label="Reste à payer"
						valeur={formatMontantFCFA(sejour.reste_a_payer)}
					/>
					<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
						<dt className="text-muted-foreground">Statut</dt>
						<dd>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
									SEJOUR_STATUT_BADGE[sejour.statut],
								)}
							>
								{SEJOUR_STATUT_LABELS[sejour.statut]}
							</span>
						</dd>
					</div>
				</dl>
			</section>

			{sejour.observations ? (
				<section className="rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
					<p className="font-medium text-foreground">Observations du client</p>
					<p className="mt-1 text-muted-foreground">{sejour.observations}</p>
				</section>
			) : null}

			{sejour.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{sejour.motif_annulation}</p>
				</div>
			) : null}

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-lg font-semibold text-foreground">Facture</h2>
					{facture && canFacturationVoir ? (
						<FactureDownloadButtons idFacture={facture.id} />
					) : null}
				</div>

				{factureQuery.isLoading ? (
					<p className="text-sm text-muted-foreground">Chargement…</p>
				) : factureQuery.isError ? (
					<div
						role="alert"
						className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
					>
						<AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
						<span>Impossible de charger la facture.</span>
					</div>
				) : !facture ? (
					// Pas d'erreur : un séjour sans encaissement n'a simplement pas
					// encore de facture (règle du module — voir `getSejourFacture`).
					<div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-6 text-center">
						<Receipt className="size-6 text-muted-foreground" aria-hidden />
						<p className="text-sm text-muted-foreground">
							Aucune facture — ce séjour n'a encore fait l'objet d'aucun
							encaissement.
						</p>
						{canEncaisser ? (
							<Button size="sm" onClick={() => setAPayer(sejour)}>
								<HandCoins className="size-4" aria-hidden />
								Encaisser un acompte
							</Button>
						) : null}
					</div>
				) : (
					<>
						<dl className="grid gap-3 sm:grid-cols-2">
							<Ligne label="Numéro" valeur={facture.numero} />
							<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
								<dt className="text-muted-foreground">Statut</dt>
								<dd>
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
											FACTURE_STATUT_BADGE[facture.statut],
										)}
									>
										{FACTURE_STATUT_LABELS[facture.statut]}
									</span>
								</dd>
							</div>
							<Ligne
								label="Montant payé"
								valeur={formatMontantFCFA(facture.montant_paye)}
							/>
							<Ligne
								label="Reste dû"
								valeur={formatMontantFCFA(facture.reste)}
							/>
						</dl>

						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											LIBELLÉ
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
											QTÉ
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
											PRIX UNITAIRE
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
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
					</>
				)}
			</section>

			<SejourFormDialog
				open={aModifier !== null}
				sejour={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAModifier(null);
				}}
				onSaved={() => setAModifier(null)}
			/>

			<PayerSejourFormDialog
				open={aPayer !== null}
				sejour={aPayer}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAPayer(null);
				}}
				onSaved={() => setAPayer(null)}
			/>

			<ValiderSejourDialog
				open={aValider !== null}
				sejour={aValider}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAValider(null);
				}}
				onSaved={() => setAValider(null)}
			/>

			<RefuserSejourDialog
				open={aRefuser !== null}
				sejour={aRefuser}
				onOpenChange={(ouvert) => {
					if (!ouvert) setARefuser(null);
				}}
				onSaved={() => setARefuser(null)}
			/>
		</div>
	);
}
