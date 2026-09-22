import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useCan } from "#/core/auth";
import {
	useCreerReservationSalleFete,
	useDisponibilitesSalleFete,
	useMesReservationsSalleFete,
} from "#/features/portail/hooks/use-salle-fete";
import type { CreneauOccupe } from "#/features/portail/models/salle-fete";
import {
	RESERVATION_PORTAIL_STATUT_BADGE,
	RESERVATION_PORTAIL_STATUT_LABELS,
} from "#/features/portail/models/salle-fete";
import { formatDateISO } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

function dateAujourdhui(): string {
	const maintenant = new Date();
	const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
	const jour = String(maintenant.getDate()).padStart(2, "0");
	return `${maintenant.getFullYear()}-${mois}-${jour}`;
}

function heureEnMinutes(heure: string): number {
	const [h, m] = heure.split(":").map(Number);
	return h * 60 + m;
}

function minutesEnHeure(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function finReservation(creneau: CreneauOccupe): number {
	return heureEnMinutes(creneau.heure_debut) + Number(creneau.duree) * 60;
}

const SUGGESTIONS_MANIFESTATION = [
	"Mariage",
	"Anniversaire",
	"Baptême",
	"Réunion",
	"Conférence",
	"Autre événement",
];

/**
 * Réservation de salle de fête (espace client) : consultation des créneaux
 * fermes du jour (`GET /salle-fete/portail/disponibilites`) puis demande en
 * texte libre (`hors_catalogue`) via `POST /salle-fete/portail/reservations`.
 * Le tarif est fixé par le personnel à la validation — aucun paiement en
 * ligne. Nécessite `SALLE_FETE.DEMANDER` pour créer.
 */
export function SalleFetePage() {
	const navigate = useNavigate();
	const canDemander = useCan("SALLE_FETE.DEMANDER");

	const reservationsQuery = useMesReservationsSalleFete();
	const demander = useCreerReservationSalleFete();

	const [dateEvenement, setDateEvenement] = useState(dateAujourdhui);
	const [heureDebut, setHeureDebut] = useState("");
	const [duree, setDuree] = useState("");
	const [typeManifestation, setTypeManifestation] = useState("");
	const [observations, setObservations] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);

	const dateChoisie = dateEvenement || dateAujourdhui();
	const disponibilitesQuery = useDisponibilitesSalleFete(dateChoisie);
	const creneauxOccupes = useMemo(
		() =>
			[...(disponibilitesQuery.data ?? [])].sort(
				(a, b) => heureEnMinutes(a.heure_debut) - heureEnMinutes(b.heure_debut),
			),
		[disponibilitesQuery.data],
	);

	const chevauchement = useMemo(() => {
		if (!heureDebut || !duree || Number(duree) <= 0) return false;
		const debut = heureEnMinutes(heureDebut);
		const fin = debut + Number(duree) * 60;
		return creneauxOccupes.some(
			(creneau) =>
				debut < finReservation(creneau) &&
				heureEnMinutes(creneau.heure_debut) < fin,
		);
	}, [heureDebut, duree, creneauxOccupes]);

	function soumettre(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErreur(null);

		if (!dateEvenement) return setErreur("Choisissez une date.");
		if (dateEvenement < dateAujourdhui())
			return setErreur("La date ne peut pas être dans le passé.");
		if (!heureDebut) return setErreur("Indiquez l'heure de début.");
		const dureeHeures = Number(duree);
		if (!Number.isInteger(dureeHeures) || dureeHeures <= 0)
			return setErreur("Indiquez une durée en heures (ex. 4).");
		const type = typeManifestation.trim();
		if (!type) return setErreur("Indiquez le type de manifestation.");
		if (type.length > 100)
			return setErreur(
				"Le type de manifestation ne peut pas dépasser 100 caractères.",
			);

		demander.mutate(
			{
				dateEvenement,
				heureDebut,
				duree: String(dureeHeures),
				typeManifestation: type,
				observations: observations.trim() || undefined,
			},
			{
				onSuccess: (reservation) => {
					void navigate({
						to: "/espace-client/salle-fete/$id",
						params: { id: reservation.id },
					});
				},
				onError: (error) =>
					setErreur(
						error instanceof Error
							? error.message
							: "Impossible d'envoyer la demande.",
					),
			},
		);
	}

	const reservations = reservationsQuery.data ?? [];

	return (
		<div className="w-full space-y-6 pt-6 pb-16">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Salle de fête" },
				]}
			/>

			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Salle de fête
				</h1>
				<p className="text-sm text-muted-foreground">
					Consultez les créneaux déjà réservés puis demandez une date pour votre
					événement. Le personnel confirme la disponibilité et le tarif — le
					règlement se fait sur place.
				</p>
			</div>

			{reservations.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">
						Mes demandes de réservation
					</h2>
					<div className="space-y-3">
						{reservations.map((reservation) => (
							<div
								key={reservation.id}
								className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
							>
								<div className="min-w-0 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-foreground">
											{reservation.type_manifestation}
										</p>
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
									<p className="text-sm text-muted-foreground">
										Le {formatDateISO(reservation.date_evenement)} à{" "}
										{reservation.heure_debut} — {reservation.duree} h
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										void navigate({
											to: "/espace-client/salle-fete/$id",
											params: { id: reservation.id },
										})
									}
								>
									Détails
									<ChevronRight className="size-4" aria-hidden />
								</Button>
							</div>
						))}
					</div>
				</section>
			) : null}

			<section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
					<CalendarDays className="size-5" aria-hidden />
					Occupation du jour
				</h2>
				<div className="max-w-xs">
					<Label htmlFor="sf-date-dispo">Date à consulter</Label>
					<Input
						id="sf-date-dispo"
						type="date"
						min={dateAujourdhui()}
						value={dateChoisie}
						onChange={(event) => setDateEvenement(event.target.value)}
						className="mt-2"
					/>
				</div>
				{disponibilitesQuery.isLoading ? (
					<p className="text-sm text-muted-foreground">
						Chargement des créneaux…
					</p>
				) : disponibilitesQuery.isError ? (
					<p className="text-sm text-destructive">
						Impossible de charger les disponibilités.
					</p>
				) : creneauxOccupes.length === 0 ? (
					<p className="rounded-md bg-[#27AE60]/10 px-3 py-2 text-sm text-[#1E8449]">
						Aucune réservation confirmée ce jour-là — la salle est libre.
					</p>
				) : (
					<ul className="space-y-2">
						{creneauxOccupes.map((creneau) => (
							<li
								key={`${creneau.date_evenement}-${creneau.heure_debut}-${creneau.duree}`}
								className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2 text-sm"
							>
								<span className="font-medium text-foreground">
									{creneau.heure_debut} →{" "}
									{minutesEnHeure(finReservation(creneau))}
								</span>
								<span className="text-destructive">Occupée</span>
							</li>
						))}
					</ul>
				)}
				<p className="text-xs text-muted-foreground">
					Seules les réservations confirmées occupent un créneau — une demande
					en attente ne bloque pas la salle.
				</p>
			</section>

			{canDemander ? (
				<form
					onSubmit={soumettre}
					className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm"
				>
					<h2 className="text-lg font-semibold text-foreground">
						Demander une réservation
					</h2>
					<div className="grid gap-4 sm:grid-cols-3">
						<div>
							<Label htmlFor="sf-date">Date de l'événement *</Label>
							<Input
								id="sf-date"
								type="date"
								required
								min={dateAujourdhui()}
								value={dateEvenement}
								onChange={(event) => setDateEvenement(event.target.value)}
								className="mt-2"
							/>
						</div>
						<div>
							<Label htmlFor="sf-heure">Heure de début *</Label>
							<Input
								id="sf-heure"
								type="time"
								required
								value={heureDebut}
								onChange={(event) => setHeureDebut(event.target.value)}
								className="mt-2"
							/>
						</div>
						<div>
							<Label htmlFor="sf-duree">Durée (heures) *</Label>
							<Input
								id="sf-duree"
								type="number"
								required
								min={1}
								step={1}
								placeholder="Ex. 4"
								value={duree}
								onChange={(event) => setDuree(event.target.value)}
								className="mt-2"
							/>
						</div>
					</div>
					{chevauchement ? (
						<p
							role="alert"
							className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
						>
							Ce créneau chevauche une réservation confirmée — choisissez un
							autre horaire.
						</p>
					) : null}
					<div>
						<Label htmlFor="sf-type">Type de manifestation *</Label>
						<Input
							id="sf-type"
							list="sf-types"
							required
							maxLength={100}
							placeholder="Ex. Mariage, anniversaire…"
							value={typeManifestation}
							onChange={(event) => setTypeManifestation(event.target.value)}
							className="mt-2"
						/>
						<datalist id="sf-types">
							{SUGGESTIONS_MANIFESTATION.map((suggestion) => (
								<option key={suggestion} value={suggestion} />
							))}
						</datalist>
					</div>
					<div>
						<Label htmlFor="sf-observations">
							Precisions pour le personnel (optionnel)
						</Label>
						<Textarea
							id="sf-observations"
							rows={3}
							maxLength={500}
							placeholder="Nombre d'invités, équipements souhaités…"
							value={observations}
							onChange={(event) => setObservations(event.target.value)}
							className="mt-2"
						/>
					</div>
					{erreur ? (
						<p role="alert" className="text-sm text-destructive">
							{erreur}
						</p>
					) : null}
					<Button
						type="submit"
						className="bg-lagoon text-white hover:bg-lagoon/90"
						disabled={demander.isPending || chevauchement}
					>
						{demander.isPending ? "Envoi en cours…" : "Envoyer la demande"}
					</Button>
				</form>
			) : null}
		</div>
	);
}
