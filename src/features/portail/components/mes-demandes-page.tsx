import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	formatDateHeureISO,
	formatDateInstantUTC,
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { SEJOUR_TYPE_LABELS } from "#/features/residence/models/sejours";
import {
	SIGNALEMENT_STATUT_LABELS,
	SIGNALEMENT_STATUT_VARIANT,
} from "#/features/signalements/models/signalements";

import { useMesVentesPortail } from "../hooks/use-market";
import { usePressingCommandes } from "../hooks/use-pressing";
import { useMesCommandesRestaurant } from "../hooks/use-restaurant";
import { useMesReservationsSalleFete } from "../hooks/use-salle-fete";
import { useMesSejoursPortail } from "../hooks/use-sejours";
import { useMesSignalements } from "../hooks/use-signalements";
import {
	VENTE_PORTAIL_STATUT_LABELS,
	VENTE_PORTAIL_STATUT_VARIANT,
} from "../models/market";
import {
	libelleDateDepot,
	libelleMontantPressing,
	PRESSING_STATUT_LABELS,
	PRESSING_STATUT_VARIANT,
} from "../models/pressing";
import {
	COMMANDE_PORTAIL_STATUT_LABELS,
	COMMANDE_PORTAIL_STATUT_VARIANT,
	TYPE_COMMANDE_PORTAIL_LABELS,
} from "../models/restaurant";
import {
	RESERVATION_PORTAIL_STATUT_LABELS,
	RESERVATION_PORTAIL_STATUT_VARIANT,
} from "../models/salle-fete";
import {
	SEJOUR_PORTAIL_STATUT_LABELS,
	SEJOUR_PORTAIL_STATUT_VARIANT,
} from "../models/sejours";
import { libelleCiblePortail } from "../models/signalements";

/**
 * Liens « liste par service » propres à l'espace courant : chaque entrée de
 * la vue pointe vers `<lien>/<id>`. `/espace-client/…` côté client,
 * `/residence/portail/…` côté résident.
 */
export interface MesDemandesLiens {
	restaurant: string;
	pressing: string;
	salleFete: string;
	boutique: string;
	residence: string;
	signalement: string;
}

/**
 * « Mes demandes » — vue agrégée des demandes portail : commandes
 * restaurant, dépôts pressing, réservations de salle de fête, demandes
 * boutique, demandes de séjour court et signalements, issues des vrais
 * endpoints portail (`/restaurant/portail`, `/pressing/portail`,
 * `/salle-fete/portail`, `/market/portail`, `/residence/portail`,
 * `/signalements/portail`) avec statuts en direct. Partagée entre l'espace
 * client (`/espace-client/mes-demandes`) et le portail résident
 * (`/residence/portail/demandes`) via `breadcrumb` + `liens`.
 */
export function MesDemandesPage({
	breadcrumb,
	liens,
	variant,
}: {
	breadcrumb: { label: string; to?: string }[];
	liens: MesDemandesLiens;
	/**
	 * `resident` = `<main>` du shell `_authenticated` sans padding — la page
	 * porte son `p-6` ; `client` = le shell client fournit marges et largeur
	 * (`pb-16` dégage la tab bar mobile).
	 */
	variant: "client" | "resident";
}) {
	const commandesRestoQuery = useMesCommandesRestaurant();
	const commandesPressingQuery = usePressingCommandes();
	const reservationsQuery = useMesReservationsSalleFete();
	const ventesQuery = useMesVentesPortail();
	const sejoursQuery = useMesSejoursPortail();
	const signalementsQuery = useMesSignalements();

	const commandesResto = commandesRestoQuery.data ?? [];
	const commandesPressing = commandesPressingQuery.data ?? [];
	const reservations = reservationsQuery.data ?? [];
	const ventes = ventesQuery.data ?? [];
	const sejours = sejoursQuery.data ?? [];
	const signalements = signalementsQuery.data ?? [];

	return (
		<div
			className={
				variant === "resident"
					? "w-full space-y-6 p-6"
					: "w-full space-y-8 pt-6 pb-16"
			}
		>
			<PageHeader
				breadcrumb={breadcrumb}
				title="Mes demandes"
				description="Commandes restaurant, dépôts pressing, réservations de salle de fête, demandes boutique, séjours courts et signalements — avec leur statut en temps réel."
			/>

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
						to={`${liens.restaurant}/$id` as never}
						params={{ id: commande.id } as never}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{TYPE_COMMANDE_PORTAIL_LABELS[commande.type] ?? commande.type}
								</span>
								<Badge
									variant={COMMANDE_PORTAIL_STATUT_VARIANT[commande.statut]}
								>
									{COMMANDE_PORTAIL_STATUT_LABELS[commande.statut] ??
										commande.statut}
								</Badge>
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
						to={`${liens.pressing}/$id` as never}
						params={{ id: commande.id } as never}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{commande.numero_commande}
								</span>
								<Badge variant={PRESSING_STATUT_VARIANT[commande.statut]}>
									{PRESSING_STATUT_LABELS[commande.statut] ?? commande.statut}
								</Badge>
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
						to={`${liens.salleFete}/$id` as never}
						params={{ id: reservation.id } as never}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{reservation.type_manifestation}
								</span>
								<Badge
									variant={
										RESERVATION_PORTAIL_STATUT_VARIANT[reservation.statut]
									}
								>
									{RESERVATION_PORTAIL_STATUT_LABELS[reservation.statut] ??
										reservation.statut}
								</Badge>
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
						to={`${liens.boutique}/$id` as never}
						params={{ id: vente.id } as never}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									Demande n° {vente.id}
								</span>
								<Badge variant={VENTE_PORTAIL_STATUT_VARIANT[vente.statut]}>
									{VENTE_PORTAIL_STATUT_LABELS[vente.statut] ?? vente.statut}
								</Badge>
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
						to={`${liens.residence}/$id` as never}
						params={{ id: sejour.id } as never}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{SEJOUR_TYPE_LABELS[sejour.type_prestation]} —{" "}
									{sejour.logement?.numero ??
										sejour.numero_logement ??
										"Logement"}
								</span>
								<Badge variant={SEJOUR_PORTAIL_STATUT_VARIANT[sejour.statut]}>
									{SEJOUR_PORTAIL_STATUT_LABELS[sejour.statut] ?? sejour.statut}
								</Badge>
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

			<SectionDemande
				titre="Signalements"
				isLoading={signalementsQuery.isLoading}
				isError={signalementsQuery.isError}
				onRetry={() => void signalementsQuery.refetch()}
				vide="Aucun signalement pour le moment. Décrivez un problème depuis la page Signalement."
			>
				{signalements.map((signalement) => (
					<Link
						key={signalement.id}
						to={`${liens.signalement}/$id` as never}
						params={{ id: signalement.id } as never}
						className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="truncate font-semibold text-foreground">
									{signalement.titre}
								</span>
								<Badge variant={SIGNALEMENT_STATUT_VARIANT[signalement.statut]}>
									{SIGNALEMENT_STATUT_LABELS[signalement.statut] ??
										signalement.statut}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{libelleCiblePortail(signalement)} · signalé le{" "}
								{formatDateInstantUTC(signalement.date_signalement)}
							</p>
						</div>
						<ChevronRight
							className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</Link>
				))}
			</SectionDemande>
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
			<h2 className="text-base font-semibold text-foreground">{titre}</h2>
			{isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette section.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={onRetry}
					>
						Réessayer
					</Button>
				</div>
			) : estVide ? (
				<EmptyState title={vide} />
			) : (
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{children}
				</div>
			)}
		</section>
	);
}
