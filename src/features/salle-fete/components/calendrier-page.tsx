import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useReservations } from "../hooks/use-reservations";
import {
	construireGrilleMois,
	dernierJourMois,
	RESERVATION_STATUT_BADGE,
	RESERVATION_STATUT_LABELS,
	reservationsPourJour,
} from "../models/reservations";

const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Mois affiché dans l'URL (`mois` au format `YYYY-MM`). */
export interface CalendrierSearch {
	mois?: string;
}

interface CalendrierPageProps {
	initialSearch: CalendrierSearch;
	onSearchChange: (maj: (prev: CalendrierSearch) => CalendrierSearch) => void;
}

function moisCourant(): string {
	const maintenant = new Date();
	return `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
}

function aujourdhuiISO(): string {
	const maintenant = new Date();
	return `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}-${String(maintenant.getDate()).padStart(2, "0")}`;
}

/**
 * Page « Calendrier — Salle de fête » (M6) : vue mensuelle des réservations
 * posées sur une grille 6×7 (semaine débutant un lundi). Le mois vit dans
 * l'URL ; chaque réservation est un lien vers sa fiche.
 */
export function CalendrierPage({
	initialSearch,
	onSearchChange,
}: CalendrierPageProps) {
	const canVoir = useCan("SALLE_FETE.VOIR");
	const moisISO = initialSearch.mois ?? moisCourant();
	const annee = Number(moisISO.slice(0, 4));
	const mois = Number(moisISO.slice(5, 7));
	const du = `${moisISO}-01`;
	const au = `${moisISO}-${dernierJourMois(annee, mois)}`;
	const reservationsQuery = useReservations("tous", du, au);
	const [dateDuJour] = useState(aujourdhuiISO());

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au calendrier de la salle de fête.
			</div>
		);
	}

	const naviguer = (decalage: number) => {
		const cible = new Date(annee, mois - 1 + decalage, 1);
		onSearchChange(() => ({
			mois: `${cible.getFullYear()}-${String(cible.getMonth() + 1).padStart(2, "0")}`,
		}));
	};

	const titreMois = new Date(annee, mois - 1, 1).toLocaleDateString("fr-FR", {
		month: "long",
		year: "numeric",
	});

	const reservations = reservationsQuery.data ?? [];
	const grille = construireGrilleMois(annee, mois);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Calendrier — Salle de fête" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Calendrier — Salle de fête
					</h1>
					<p className="text-muted-foreground">
						Occupations de la salle par mois. Cliquez sur une réservation pour
						ouvrir sa fiche.
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => naviguer(-1)}>
						<ChevronLeft className="size-4" aria-hidden />
						Mois précédent
					</Button>
					<Button variant="outline" size="sm" onClick={() => naviguer(1)}>
						Mois suivant
						<ChevronRight className="size-4" aria-hidden />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onSearchChange(() => ({ mois: moisCourant() }))}
					>
						Aujourd'hui
					</Button>
				</div>
			</div>

			{reservationsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : reservationsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les réservations.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void reservationsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="mb-3 text-sm font-medium text-foreground">
						{titreMois}
					</p>
					<div className="grid grid-cols-7 gap-1.5">
						{JOURS_SEMAINE.map((jour) => (
							<div
								key={jour}
								className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
							>
								{jour}
							</div>
						))}
						{grille.map((jourGrille) => {
							const reservationsJour = reservationsPourJour(
								reservations,
								jourGrille.date,
							);
							const estAujourdhui = jourGrille.date === dateDuJour;
							return (
								<div
									key={jourGrille.date}
									className={cn(
										"min-h-24 rounded-md border p-1.5",
										jourGrille.horsMois
											? "border-border bg-sea-ink/5"
											: "border-border bg-background",
										estAujourdhui && "ring-2 ring-lagoon",
									)}
								>
									<span
										className={cn(
											"text-xs font-medium",
											jourGrille.horsMois
												? "text-muted-foreground/50"
												: "text-foreground",
										)}
									>
										{jourGrille.jour}
									</span>
									<div className="mt-1 space-y-1">
										{reservationsJour.map((reservation) => (
											<Link
												key={reservation.id}
												to="/salle-fete/reservations/$id"
												params={{ id: reservation.id }}
												title={`${reservation.type_manifestation} — ${reservation.heure_debut?.slice(0, 5) ?? ""}`}
												className={cn(
													"block truncate rounded px-1.5 py-0.5 text-[11px] font-medium text-white transition-opacity hover:opacity-80",
													RESERVATION_STATUT_BADGE[reservation.statut],
													reservation.statut === "ANNULEE" && "opacity-50",
												)}
											>
												{reservation.heure_debut?.slice(0, 5) ?? ""}{" "}
												{reservation.type_manifestation}
											</Link>
										))}
									</div>
								</div>
							);
						})}
					</div>
					<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
						<span>Légende :</span>
						{(
							Object.keys(RESERVATION_STATUT_BADGE) as Array<
								keyof typeof RESERVATION_STATUT_BADGE
							>
						).map((statut) => (
							<span key={statut} className="inline-flex items-center gap-1.5">
								<span
									className={cn(
										"size-2.5 rounded-full",
										RESERVATION_STATUT_BADGE[statut].split(" ")[0],
									)}
									aria-hidden
								/>
								{RESERVATION_STATUT_LABELS[statut]}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
