import { Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import {
	FACTURE_STATUT_BADGE,
	FACTURE_STATUT_LABELS,
} from "#/features/facturation/models/factures";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { SEJOUR_TYPE_LABELS } from "#/features/residence/models/sejours";
import { cn } from "#/lib/utils";

import {
	useAnnulerSejourPortail,
	useSejourPortail,
	useSejourPortailFacture,
} from "../hooks/use-sejours";
import {
	estSejourAnnulable,
	SEJOUR_PORTAIL_ETAPES,
	SEJOUR_PORTAIL_STATUT_BADGE,
	SEJOUR_PORTAIL_STATUT_LABELS,
} from "../models/sejours";
import { AnnulerDemandeDialog } from "./annuler-demande-dialog";
import { StatutTimeline } from "./statut-timeline";

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

interface SejourPortailDetailPageProps {
	id: string;
	/**
	 * `client` = espace client (`/espace-client/residence`) ;
	 * `resident` = portail résident du shell staff (`/residence/portail/sejours`).
	 */
	variant: "client" | "resident";
}

/**
 * Détail d'une demande de séjour court (residence 087+088) — page partagée
 * par l'espace client et le portail résident : logement demandé, statut,
 * tarif une fois chiffré par le personnel, motif de refus éventuel, annulation
 * tant que `EN_ATTENTE` (`RESIDENCE.DEMANDER`). La facture n'existe qu'après
 * un encaissement — le `404` est un état vide, pas une erreur.
 */
export function SejourPortailDetailPage({
	id,
	variant,
}: SejourPortailDetailPageProps) {
	const estClient = variant === "client";
	const lienListe = estClient
		? "/espace-client/residence"
		: "/residence/portail/sejours";

	const sejourQuery = useSejourPortail(id);
	const factureQuery = useSejourPortailFacture(id);
	const canDemander = useCan("RESIDENCE.DEMANDER");
	const annuler = useAnnulerSejourPortail();
	const [confirmOuvert, setConfirmOuvert] = useState(false);

	const conteneur = estClient
		? "mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8"
		: "w-full space-y-6 p-6";

	if (sejourQuery.isLoading) {
		return (
			<div className={conteneur}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (sejourQuery.isError || !sejourQuery.data) {
		return (
			<div className={cn(conteneur, "space-y-3")}>
				<h1 className="text-2xl font-semibold text-foreground">
					Demande de séjour
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette demande de séjour.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void sejourQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const sejour = sejourQuery.data;
	const facture = factureQuery.data ?? null;
	const libelleLogement =
		sejour.logement?.numero ?? sejour.numero_logement ?? "—";

	return (
		<div className={conteneur}>
			<Breadcrumb
				items={
					estClient
						? [
								{ label: "Espace client", to: "/espace-client" },
								{ label: "Séjours courts", to: lienListe },
								{ label: `Séjour ${sejour.id}` },
							]
						: [
								{ label: "Accueil", to: "/" },
								{ label: "Mon espace résident", to: "/residence/portail" },
								{ label: "Séjours courts", to: lienListe },
								{ label: `Séjour ${sejour.id}` },
							]
				}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-2xl font-semibold text-foreground">
							{SEJOUR_TYPE_LABELS[sejour.type_prestation]} — {libelleLogement}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								SEJOUR_PORTAIL_STATUT_BADGE[sejour.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{SEJOUR_PORTAIL_STATUT_LABELS[sejour.statut] ?? sejour.statut}
						</span>
					</div>
					<p className="text-muted-foreground">
						Arrivée le {formatDateHeureISO(sejour.date_heure_arrivee)}
					</p>
				</section>
				<div className="flex flex-wrap items-center gap-2">
					{canDemander && estSejourAnnulable(sejour) ? (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:bg-destructive/10"
							onClick={() => setConfirmOuvert(true)}
						>
							Annuler la demande
						</Button>
					) : null}
					<Button variant="outline" size="sm" asChild>
						<Link to={lienListe}>Retour à mes séjours</Link>
					</Button>
				</div>
			</div>

			{sejour.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{sejour.motif_annulation}</p>
				</div>
			) : null}

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Logement" valeur={libelleLogement} />
					<Ligne
						label="Type"
						valeur={SEJOUR_TYPE_LABELS[sejour.type_prestation]}
					/>
					<Ligne
						label="Arrivée"
						valeur={formatDateHeureISO(sejour.date_heure_arrivee)}
					/>
					<Ligne
						label="Départ prévu"
						valeur={formatDateHeureISO(sejour.date_heure_depart_prevue)}
					/>
					{sejour.nombre_personnes != null ? (
						<Ligne label="Personnes" valeur={String(sejour.nombre_personnes)} />
					) : null}
					<Ligne
						label="Tarif"
						valeur={
							sejour.tarif
								? formatMontantFCFA(sejour.tarif)
								: "En attente de chiffrage"
						}
					/>
					{sejour.montant_total ? (
						<Ligne
							label="Montant total"
							valeur={formatMontantFCFA(sejour.montant_total)}
						/>
					) : null}
					{sejour.reste_a_payer != null && Number(sejour.reste_a_payer) > 0 ? (
						<Ligne
							label="Reste à payer"
							valeur={formatMontantFCFA(sejour.reste_a_payer)}
						/>
					) : null}
				</dl>
			</section>

			{sejour.observations ? (
				<section className="rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
					<p className="font-medium text-foreground">Votre message</p>
					<p className="mt-1 text-muted-foreground">{sejour.observations}</p>
				</section>
			) : null}

			{facture ? (
				<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
						<Receipt className="size-5" aria-hidden />
						Facture
					</h2>
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
						<Ligne label="Reste dû" valeur={formatMontantFCFA(facture.reste)} />
					</dl>
				</section>
			) : null}

			<StatutTimeline
				etapes={SEJOUR_PORTAIL_ETAPES}
				statut={sejour.statut}
				labels={SEJOUR_PORTAIL_STATUT_LABELS}
				titre="Suivi de la demande"
			/>

			<AnnulerDemandeDialog
				open={confirmOuvert}
				titre="Annuler la demande de séjour ?"
				description="L'annulation est définitive — possible uniquement tant que la demande n'a pas été traitée."
				isPending={annuler.isPending}
				erreur={
					annuler.error
						? annuler.error instanceof Error
							? annuler.error.message
							: "Impossible d'annuler la demande."
						: null
				}
				onConfirm={() =>
					annuler.mutate(
						{ id: sejour.id },
						{ onSuccess: () => setConfirmOuvert(false) },
					)
				}
				onOpenChange={setConfirmOuvert}
			/>
		</div>
	);
}
