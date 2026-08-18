import { Link } from "@tanstack/react-router";
import { CheckCheck, Pencil, X } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { nomComplet } from "#/features/residence/models/clients";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import {
	useAnnulerReservation,
	useConfirmerReservation,
	useRealiserReservation,
	useReservation,
	useReservationPaiements,
} from "../hooks/use-reservations";
import {
	RESERVATION_STATUT_BADGE,
	RESERVATION_STATUT_LABELS,
} from "../models/reservations";
import { PaiementDialog } from "./paiement-dialog";
import { ReservationFormDialog } from "./reservation-form-dialog";

/** Ligne lecture seule de la fiche. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

interface ReservationFichePageProps {
	/** Id de la réservation (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche réservation — Salle de fête » (M6) : informations de la
 * réservation (client, date, tarif, acompte, solde), historique des paiements
 * (gated `FINANCES.VOIR`) et actions Confirmer / Réaliser / Annuler /
 * Modifier.
 */
export function ReservationFichePage({ id }: ReservationFichePageProps) {
	const canModifier = useCan("SALLE_FETE.MODIFIER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	const reservationQuery = useReservation(id);
	const clientsDetails = useClientsDetails(
		reservationQuery.data?.id_client ? [reservationQuery.data.id_client] : [],
	);
	const moyensQuery = useMoyensPaiement();
	const paiementsQuery = useReservationPaiements(
		id,
		canFinancesVoir && reservationQuery.data !== undefined,
	);
	const confirmerMutation = useConfirmerReservation();
	const realiserMutation = useRealiserReservation();
	const annulerMutation = useAnnulerReservation();

	const [formOuvert, setFormOuvert] = useState(false);
	const [aPayer, setAPayer] = useState<{
		mode: "confirmer" | "realiser";
		montant: string;
	} | null>(null);
	const [aAnnuler, setAAnnuler] = useState(false);

	if (reservationQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (reservationQuery.isError || !reservationQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Fiche réservation
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Réservation introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/salle-fete/reservations">
							Retour à la liste des réservations
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const reservation = reservationQuery.data;
	const client = reservation.id_client
		? clientsDetails.data?.get(reservation.id_client)
		: undefined;
	const paiements = paiementsQuery.data ?? [];
	const moyens = new Map(
		(moyensQuery.data ?? []).map((moyen) => [moyen.id, moyen.libelle]),
	);
	const totalEncaissement = paiements
		.filter((paiement) => paiement.type === "ENCAISSEMENT")
		.reduce((somme, paiement) => somme + Number(paiement.montant), 0);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{
						label: "Réservations — Salle de fête",
						to: "/salle-fete/reservations",
					},
					{ label: `Réservation du ${reservation.date_evenement}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche réservation
					</h1>
					<p className="text-muted-foreground">
						{reservation.type_manifestation} —{" "}
						{RESERVATION_STATUT_LABELS[reservation.statut].toLowerCase()}.
					</p>
				</section>

				<div className="flex items-center gap-2">
					{canModifier ? (
						<Button variant="outline" onClick={() => setFormOuvert(true)}>
							<Pencil className="size-4" aria-hidden />
							Modifier
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link to="/salle-fete/reservations">Retour aux réservations</Link>
					</Button>
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Client" valeur={client ? nomComplet(client) : "—"} />
					<Ligne
						label="Date de l'événement"
						valeur={`${reservation.date_evenement} à ${reservation.heure_debut?.slice(0, 5)}`}
					/>
					<Ligne label="Durée" valeur={`${reservation.duree} h`} />
					<Ligne
						label="Type de manifestation"
						valeur={reservation.type_manifestation}
					/>
					<Ligne label="Tarif" valeur={formatMontantFCFA(reservation.tarif)} />
					<Ligne
						label="Acompte"
						valeur={formatMontantFCFA(reservation.acompte)}
					/>
					<Ligne label="Solde" valeur={formatMontantFCFA(reservation.solde)} />
				</dl>
				<div className="mt-4 flex flex-wrap items-center gap-3">
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
							RESERVATION_STATUT_BADGE[reservation.statut],
						)}
					>
						{RESERVATION_STATUT_LABELS[reservation.statut]}
					</span>
					{canModifier &&
					reservation.statut !== "REALISEE" &&
					reservation.statut !== "ANNULEE" ? (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive"
							onClick={() => setAAnnuler(true)}
						>
							<X className="size-4" aria-hidden />
							Annuler la réservation
						</Button>
					) : null}
					{canModifier &&
					canFinancesVoir &&
					reservation.statut === "RESERVEE" ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setAPayer({ mode: "confirmer", montant: reservation.solde })
							}
						>
							<CheckCheck className="size-4 text-lagoon" aria-hidden />
							Confirmer (encaisser)
						</Button>
					) : null}
					{canModifier &&
					canFinancesVoir &&
					reservation.statut === "CONFIRMEE" ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setAPayer({ mode: "realiser", montant: reservation.solde })
							}
						>
							<CheckCheck className="size-4 text-lagoon" aria-hidden />
							Réaliser (encaisser le solde)
						</Button>
					) : null}
				</div>
				{reservation.observations ? (
					<p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
						{reservation.observations}
					</p>
				) : null}
			</section>

			{canFinancesVoir ? (
				<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<h2 className="text-lg font-semibold text-foreground">Paiements</h2>
						<p className="text-sm text-muted-foreground">
							Total encaissé :{" "}
							<span className="font-semibold text-[#27AE60]">
								{formatMontantFCFA(String(totalEncaissement))}
							</span>
						</p>
					</div>

					{paiementsQuery.isLoading ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : paiements.length === 0 ? (
						<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
							Aucun paiement enregistré pour cette réservation.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											DATE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											MOYEN
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											TYPE
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
											MONTANT
										</th>
									</tr>
								</thead>
								<tbody>
									{paiements.map((paiement) => (
										<tr
											key={paiement.id}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3 text-muted-foreground">
												{formatDateHeureISO(paiement.date)}
											</td>
											<td className="px-4 py-3 text-foreground">
												{paiement.id_moyen
													? (moyens.get(paiement.id_moyen) ?? "—")
													: "—"}
											</td>
											<td className="px-4 py-3">
												<span
													className={cn(
														"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
														paiement.type === "ENCAISSEMENT"
															? "bg-[#27AE60] text-white"
															: "bg-[#E74C3C] text-white",
													)}
												>
													{paiement.type === "ENCAISSEMENT"
														? "Encaissement"
														: "Décaissement"}
												</span>
											</td>
											<td className="px-4 py-3 text-right font-semibold text-foreground">
												{formatMontantFCFA(paiement.montant)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			) : null}

			{annulerMutation.isError ? (
				<div
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					Impossible d'annuler la réservation.
				</div>
			) : null}

			<ReservationFormDialog
				open={formOuvert}
				reservation={reservation}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			{aPayer ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
					<div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
						<h3 className="text-base font-semibold text-foreground">
							{aPayer.mode === "confirmer"
								? "Confirmer la réservation"
								: "Réaliser la réservation"}
						</h3>
						<div className="mt-4">
							<PaiementDialog
								titre={aPayer.mode === "confirmer" ? "Confirmer" : "Réaliser"}
								montantDefaut={aPayer.montant}
								moyens={moyensQuery.data ?? []}
								onOpenChange={() => setAPayer(null)}
								onValider={(montant, idMoyen) => {
									if (aPayer.mode === "confirmer") {
										confirmerMutation.mutate({ id, montant, idMoyen });
									} else {
										realiserMutation.mutate({ id, montant, idMoyen });
									}
								}}
							/>
						</div>
					</div>
				</div>
			) : null}

			<ConfirmDialog
				open={aAnnuler}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAAnnuler(false);
				}}
				title="Annuler la réservation"
				message={`Voulez-vous vraiment annuler la réservation du ${reservation.date_evenement} ?`}
				confirmLabel="Annuler la réservation"
				cancelLabel="Fermer"
				destructive
				busy={annulerMutation.isPending}
				onConfirm={() => {
					annulerMutation.mutate(id, {
						onSettled: () => setAAnnuler(false),
					});
				}}
			/>
		</div>
	);
}
