import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { AnnulerDemandeDialog } from "#/features/portail/components/annuler-demande-dialog";
import { StatutTimeline } from "#/features/portail/components/statut-timeline";
import {
	useAnnulerReservationSalleFete,
	useReservationSalleFete,
} from "#/features/portail/hooks/use-salle-fete";
import {
	estReservationAnnulable,
	RESERVATION_PORTAIL_ETAPES,
	RESERVATION_PORTAIL_STATUT_BADGE,
	RESERVATION_PORTAIL_STATUT_LABELS,
} from "#/features/portail/models/salle-fete";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

/**
 * Détail d'une demande de réservation de salle de fête (espace client) :
 * créneau, statut, tarif une fois validé par le personnel, motif
 * d'annulation éventuel et annulation tant qu'elle est `EN_ATTENTE`
 * (`SALLE_FETE.DEMANDER`).
 */
export function SalleFeteReservationDetailPage({ id }: { id: string }) {
	const reservationQuery = useReservationSalleFete(id);
	const canDemander = useCan("SALLE_FETE.DEMANDER");
	const annuler = useAnnulerReservationSalleFete();
	const [confirmOuvert, setConfirmOuvert] = useState(false);

	if (reservationQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (reservationQuery.isError || !reservationQuery.data) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-foreground">
					Réservation de salle de fête
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette réservation.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void reservationQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const reservation = reservationQuery.data;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Salle de fête", to: "/espace-client/salle-fete" },
					{ label: reservation.type_manifestation },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-2xl font-semibold text-foreground">
							{reservation.type_manifestation}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								RESERVATION_PORTAIL_STATUT_BADGE[reservation.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{RESERVATION_PORTAIL_STATUT_LABELS[reservation.statut] ??
								reservation.statut}
						</span>
					</div>
					<p className="text-muted-foreground">
						Le {formatDateISO(reservation.date_evenement)} à{" "}
						{reservation.heure_debut} — {reservation.duree} h
					</p>
				</section>
				<div className="flex flex-wrap items-center gap-2">
					{canDemander && estReservationAnnulable(reservation) ? (
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
						<Link to="/espace-client/mes-demandes">Retour à mes demandes</Link>
					</Button>
				</div>
			</div>

			{reservation.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{reservation.motif_annulation}</p>
				</div>
			) : null}

			{reservation.tarif != null || reservation.solde != null ? (
				<div className="grid gap-4 sm:grid-cols-2">
					{reservation.tarif != null ? (
						<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
							<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Tarif
							</p>
							<p className="mt-1 text-lg font-semibold text-foreground">
								{formatMontantFCFA(reservation.tarif)}
							</p>
						</div>
					) : null}
					{reservation.solde != null ? (
						<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
							<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Solde restant
							</p>
							<p className="mt-1 text-lg font-semibold text-foreground">
								{formatMontantFCFA(reservation.solde)}
							</p>
						</div>
					) : null}
				</div>
			) : null}

			{reservation.observations ? (
				<section className="rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
					<p className="font-medium text-foreground">Votre message</p>
					<p className="mt-1 text-muted-foreground">
						{reservation.observations}
					</p>
				</section>
			) : null}

			<StatutTimeline
				etapes={RESERVATION_PORTAIL_ETAPES}
				statut={reservation.statut}
				labels={RESERVATION_PORTAIL_STATUT_LABELS}
				titre="Suivi de la réservation"
			/>

			<AnnulerDemandeDialog
				open={confirmOuvert}
				titre="Annuler la demande de réservation ?"
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
					annuler.mutate(reservation.id, {
						onSuccess: () => setConfirmOuvert(false),
					})
				}
				onOpenChange={setConfirmOuvert}
			/>
		</div>
	);
}
