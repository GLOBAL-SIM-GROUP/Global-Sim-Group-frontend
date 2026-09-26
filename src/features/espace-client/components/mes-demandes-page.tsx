import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useMesVentesPortail } from "#/features/portail/hooks/use-market";
import { usePressingCommandes } from "#/features/portail/hooks/use-pressing";
import { useMesCommandesRestaurant } from "#/features/portail/hooks/use-restaurant";
import { useMesReservationsSalleFete } from "#/features/portail/hooks/use-salle-fete";
import { useMesSejoursPortail } from "#/features/portail/hooks/use-sejours";
import {
	VENTE_PORTAIL_STATUT_BADGE,
	VENTE_PORTAIL_STATUT_LABELS,
} from "#/features/portail/models/market";
import {
	libelleDateDepot,
	libelleMontantPressing,
	PRESSING_STATUT_BADGE,
	PRESSING_STATUT_LABELS,
} from "#/features/portail/models/pressing";
import {
	COMMANDE_PORTAIL_STATUT_BADGE,
	COMMANDE_PORTAIL_STATUT_LABELS,
	TYPE_COMMANDE_PORTAIL_LABELS,
} from "#/features/portail/models/restaurant";
import {
	RESERVATION_PORTAIL_STATUT_BADGE,
	RESERVATION_PORTAIL_STATUT_LABELS,
} from "#/features/portail/models/salle-fete";
import {
	SEJOUR_PORTAIL_STATUT_BADGE,
	SEJOUR_PORTAIL_STATUT_LABELS,
} from "#/features/portail/models/sejours";
import {
	formatDateHeureISO,
	formatDateInstantUTC,
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { SEJOUR_TYPE_LABELS } from "#/features/residence/models/sejours";
import { cn } from "#/lib/utils";

import {
	DEMANDE_SERVICE_LABELS,
	type DemandeLocale,
	listerDemandes,
} from "../models/demandes";

/**
 * « Mes demandes » de l'espace client : commandes restaurant, dépôts
 * pressing, réservations de salle de fête, demandes boutique et demandes de
 * séjour court viennent des vrais endpoints portail (`/restaurant/portail`,
 * `/pressing/portail`, `/salle-fete/portail`, `/market/portail`,
 * `/residence/portail`) avec statuts en direct. Ne subsistent en localStorage
 * que les demandes sans endpoint résident (signalement) — cf.
 * `models/demandes.ts`.
 */
export function MesDemandesPage() {
	const commandesRestoQuery = useMesCommandesRestaurant();
	const commandesPressingQuery = usePressingCommandes();
	const reservationsQuery = useMesReservationsSalleFete();
	const ventesQuery = useMesVentesPortail();
	const sejoursQuery = useMesSejoursPortail();
	const [demandes] = useState(() =>
		listerDemandes().filter(
			(demande) =>
				demande.service !== "commande-restaurant" &&
				demande.service !== "salle-fete" &&
				demande.service !== "commande-boutique" &&
				demande.service !== "residence",
		),
	);

	const commandesResto = commandesRestoQuery.data ?? [];
	const commandesPressing = commandesPressingQuery.data ?? [];
	const reservations = reservationsQuery.data ?? [];
	const ventes = ventesQuery.data ?? [];
	const sejours = sejoursQuery.data ?? [];

	return (
		<div className="w-full space-y-8 pt-6 pb-16">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Mes demandes" },
				]}
			/>

			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Mes demandes</h1>
				<p className="text-sm text-muted-foreground">
					Commandes restaurant, dépôts pressing, réservations de salle de fête,
					demandes boutique et séjours courts — avec leur statut en temps réel.
				</p>
			</div>

			<SectionDemande
				titre="Commandes restaurant"
				isLoading={commandesRestoQuery.isLoading}
				isError={commandesRestoQuery.isError}
				onRetry={() => void commandesRestoQuery.refetch()}
				vide="Aucune commande pour le moment. Composez votre repas depuis la page Restaurant."
			>
				{commandesResto.map((commande) => (
					<Link
						key={commande.id}
						to="/espace-client/restaurant/$id"
						params={{ id: commande.id }}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{TYPE_COMMANDE_PORTAIL_LABELS[commande.type] ?? commande.type}
								</span>
								<span
									className={cn(
										"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
										COMMANDE_PORTAIL_STATUT_BADGE[commande.statut] ??
											"bg-[#95A5A6] text-white",
									)}
								>
									{COMMANDE_PORTAIL_STATUT_LABELS[commande.statut] ??
										commande.statut}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Passée le {formatDateInstantUTC(commande.date)} ·{" "}
								{formatMontantFCFA(commande.total)}
							</p>
						</div>
						<ChevronRight
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				))}
			</SectionDemande>

			<SectionDemande
				titre="Dépôts pressing"
				isLoading={commandesPressingQuery.isLoading}
				isError={commandesPressingQuery.isError}
				onRetry={() => void commandesPressingQuery.refetch()}
				vide="Aucune demande de dépôt pour le moment."
			>
				{commandesPressing.map((commande) => (
					<Link
						key={commande.id}
						to="/espace-client/pressing/$id"
						params={{ id: commande.id }}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{commande.numero_commande}
								</span>
								<span
									className={cn(
										"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
										PRESSING_STATUT_BADGE[commande.statut] ??
											"bg-[#95A5A6] text-white",
									)}
								>
									{PRESSING_STATUT_LABELS[commande.statut] ?? commande.statut}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								{libelleDateDepot(commande)} ·{" "}
								{libelleMontantPressing(commande.montant_total)}
							</p>
						</div>
						<ChevronRight
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				))}
			</SectionDemande>

			<SectionDemande
				titre="Réservations de salle de fête"
				isLoading={reservationsQuery.isLoading}
				isError={reservationsQuery.isError}
				onRetry={() => void reservationsQuery.refetch()}
				vide="Aucune réservation pour le moment."
			>
				{reservations.map((reservation) => (
					<Link
						key={reservation.id}
						to="/espace-client/salle-fete/$id"
						params={{ id: reservation.id }}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{reservation.type_manifestation}
								</span>
								<span
									className={cn(
										"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
										RESERVATION_PORTAIL_STATUT_BADGE[reservation.statut] ??
											"bg-[#95A5A6] text-white",
									)}
								>
									{RESERVATION_PORTAIL_STATUT_LABELS[reservation.statut] ??
										reservation.statut}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Le {formatDateISO(reservation.date_evenement)} à{" "}
								{reservation.heure_debut} — {reservation.duree} h
							</p>
						</div>
						<ChevronRight
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				))}
			</SectionDemande>

			<SectionDemande
				titre="Demandes boutique"
				isLoading={ventesQuery.isLoading}
				isError={ventesQuery.isError}
				onRetry={() => void ventesQuery.refetch()}
				vide="Aucune demande pour le moment. Composez votre panier depuis la Boutique."
			>
				{ventes.map((vente) => (
					<Link
						key={vente.id}
						to="/espace-client/boutique/$id"
						params={{ id: vente.id }}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									Demande n° {vente.id}
								</span>
								<span
									className={cn(
										"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
										VENTE_PORTAIL_STATUT_BADGE[vente.statut] ??
											"bg-[#95A5A6] text-white",
									)}
								>
									{VENTE_PORTAIL_STATUT_LABELS[vente.statut] ?? vente.statut}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Envoyée le {formatDateInstantUTC(vente.date)} ·{" "}
								{formatMontantFCFA(vente.total)}
							</p>
						</div>
						<ChevronRight
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				))}
			</SectionDemande>

			<SectionDemande
				titre="Demandes de séjour"
				isLoading={sejoursQuery.isLoading}
				isError={sejoursQuery.isError}
				onRetry={() => void sejoursQuery.refetch()}
				vide="Aucune demande de séjour pour le moment. Consultez les logements disponibles depuis la page Résidence."
			>
				{sejours.map((sejour) => (
					<Link
						key={sejour.id}
						to="/espace-client/residence/$id"
						params={{ id: sejour.id }}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{SEJOUR_TYPE_LABELS[sejour.type_prestation]} —{" "}
									{sejour.logement?.numero ??
										sejour.numero_logement ??
										"Logement"}
								</span>
								<span
									className={cn(
										"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
										SEJOUR_PORTAIL_STATUT_BADGE[sejour.statut] ??
											"bg-[#95A5A6] text-white",
									)}
								>
									{SEJOUR_PORTAIL_STATUT_LABELS[sejour.statut] ?? sejour.statut}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Arrivée le {formatDateHeureISO(sejour.date_heure_arrivee)}
								{sejour.tarif
									? ` · ${formatMontantFCFA(sejour.tarif)}`
									: " · En attente de chiffrage"}
							</p>
						</div>
						<ChevronRight
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				))}
			</SectionDemande>

			{demandes.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">
						Autres demandes envoyées
					</h2>
					<div className="space-y-3">
						{demandes.map((demande) => (
							<DemandeLocaleCard key={demande.id} demande={demande} />
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}

function SectionDemande({
	titre,
	isLoading,
	isError,
	onRetry,
	vide,
	children,
}: {
	titre: string;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	vide: string;
	children: React.ReactNode;
}) {
	const items = Array.isArray(children) ? children : [children];
	const estVide = items.filter(Boolean).length === 0;

	return (
		<section className="space-y-3">
			<h2 className="text-lg font-semibold text-foreground">{titre}</h2>
			{isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette section.</p>
					<Button variant="outline" size="sm" onClick={onRetry}>
						Réessayer
					</Button>
				</div>
			) : estVide ? (
				<div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
					{vide}
				</div>
			) : (
				<div className="space-y-3">{children}</div>
			)}
		</section>
	);
}

function DemandeLocaleCard({ demande }: { demande: DemandeLocale }) {
	return (
		<div className="space-y-1 rounded-lg border border-border bg-card p-4 shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-semibold text-foreground">
						{DEMANDE_SERVICE_LABELS[demande.service]}
					</span>
					<span className="inline-flex items-center rounded-full bg-[#E67E22] px-2.5 py-1 text-xs font-medium text-white">
						Envoyée — en attente de réponse
					</span>
				</div>
				<span className="text-xs text-muted-foreground">
					Envoyée le {formatDateInstantUTC(demande.dateEnvoi)}
				</span>
			</div>
			<p className="text-sm text-muted-foreground">{demande.resume}</p>
			{demande.observations ? (
				<p className="text-sm text-muted-foreground italic">
					« {demande.observations} »
				</p>
			) : null}
		</div>
	);
}
