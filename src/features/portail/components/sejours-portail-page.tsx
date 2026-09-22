import { useNavigate } from "@tanstack/react-router";
import { BedDouble, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import {
	SEJOUR_TYPE_LABELS,
	type SejourType,
} from "#/features/residence/models/sejours";
import { cn } from "#/lib/utils";

import {
	useCreerSejourPortail,
	useLogementsPortail,
	useMesSejoursPortail,
} from "../hooks/use-sejours";
import type { LogementPortail } from "../models/sejours";
import {
	SEJOUR_PORTAIL_STATUT_BADGE,
	SEJOUR_PORTAIL_STATUT_LABELS,
} from "../models/sejours";

function dateAujourdhui(): string {
	const maintenant = new Date();
	const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
	const jour = String(maintenant.getDate()).padStart(2, "0");
	return `${maintenant.getFullYear()}-${mois}-${jour}`;
}

/** Date-heure locale courante au format backend `YYYY-MM-DD HH:MM:SS`. */
function dateHeureMaintenant(): string {
	const maintenant = new Date();
	const pad = (valeur: number) => String(valeur).padStart(2, "0");
	return `${dateAujourdhui()} ${pad(maintenant.getHours())}:${pad(maintenant.getMinutes())}:${pad(maintenant.getSeconds())}`;
}

/** `YYYY-MM-DD` + `HH:MM` → format backend `YYYY-MM-DD HH:MM:SS`. */
function versDateHeure(date: string, heure: string): string {
	return `${date} ${heure || "00:00"}:00`;
}

interface SejoursPortailPageProps {
	/**
	 * `client` = espace client (`/espace-client/residence`) ;
	 * `resident` = portail résident du shell staff (`/residence/portail/sejours`).
	 * Détermine le conteneur, le fil d'Ariane et les liens de détail.
	 */
	variant: "client" | "resident";
}

/**
 * Demandes de séjour court (residence 087+088) — page partagée par l'espace
 * client et le portail résident (mêmes permissions `PORTAIL.VOIR` +
 * `RESIDENCE.DEMANDER`). Flux : dates + type de prestation → catalogue des
 * logements libres sur la période (`GET .../portail/sejours/logements`) →
 * choix d'un logement → `POST .../portail/sejours` (`EN_ATTENTE`, pas de
 * tarif — chiffrage à la validation staff).
 *
 * Le `409` de disponibilité est un cas normal : le logement a pu être pris
 * entre l'affichage du catalogue et l'envoi — on rafraîchit le catalogue et
 * on invite à choisir un autre logement.
 */
export function SejoursPortailPage({ variant }: SejoursPortailPageProps) {
	const navigate = useNavigate();
	const canDemander = useCan("RESIDENCE.DEMANDER");
	const estClient = variant === "client";

	const lienDetail = (id: string) =>
		estClient
			? `/espace-client/residence/${id}`
			: `/residence/portail/sejours/${id}`;

	const sejoursQuery = useMesSejoursPortail();
	const creer = useCreerSejourPortail();

	// Étape 1 : période + type de prestation → catalogue filtré.
	const [dateArrivee, setDateArrivee] = useState("");
	const [heureArrivee, setHeureArrivee] = useState("14:00");
	const [dateDepart, setDateDepart] = useState("");
	const [heureDepart, setHeureDepart] = useState("11:00");
	const [typePrestation, setTypePrestation] = useState<SejourType>("NUITEE");

	// Étape 2 : logement choisi dans le catalogue + compléments de la demande.
	const [logementChoisi, setLogementChoisi] = useState<LogementPortail | null>(
		null,
	);
	const [nombrePersonnes, setNombrePersonnes] = useState("");
	const [observations, setObservations] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);
	const [indisponible, setIndisponible] = useState(false);

	const periodeValide =
		Boolean(dateArrivee) && Boolean(dateDepart) && dateDepart >= dateArrivee;
	const logementsQuery = useLogementsPortail(
		periodeValide ? { dateArrivee, dateDepart } : undefined,
		periodeValide,
	);

	// Un logement sélectionné qui disparaît du catalogue rafraîchi n'est plus
	// proposable — on le désélectionne (le 409 arrive aussi à l'envoi).
	const logements = logementsQuery.data ?? [];
	const selectionValide = useMemo(
		() =>
			logementChoisi &&
			logements.some((l) => l.id_logement === logementChoisi.id_logement),
		[logementChoisi, logements],
	);

	function soumettre(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErreur(null);
		setIndisponible(false);

		if (!periodeValide) {
			return setErreur("Choisissez une période valide (arrivée puis départ).");
		}
		if (!logementChoisi || !selectionValide) {
			return setErreur("Choisissez un logement disponible dans la liste.");
		}
		const arrivee = versDateHeure(dateArrivee, heureArrivee);
		if (arrivee <= dateHeureMaintenant()) {
			// Garde-fou UX : le backend refuse une arrivée passée (400).
			return setErreur("La date d'arrivée doit être dans le futur.");
		}
		const depart = versDateHeure(dateDepart, heureDepart);
		if (depart <= arrivee) {
			return setErreur(
				"Le départ doit être postérieur à l'arrivée (jour et heure).",
			);
		}
		const personnes = nombrePersonnes.trim() ? Number(nombrePersonnes) : null;
		if (
			personnes !== null &&
			(!Number.isInteger(personnes) || personnes <= 0)
		) {
			return setErreur("Le nombre de personnes doit être un entier positif.");
		}

		creer.mutate(
			{
				idLogement: logementChoisi.id_logement,
				typePrestation,
				dateHeureArrivee: arrivee,
				dateHeureDepartPrevue: depart,
				nombrePersonnes: personnes,
				observations: observations.trim() || undefined,
			},
			{
				onSuccess: (sejour) => {
					setLogementChoisi(null);
					setObservations("");
					setNombrePersonnes("");
					void navigate({ to: lienDetail(sejour.id) });
				},
				onError: (error) => {
					const apiError = toApiError(error);
					if (apiError.status === 409) {
						// Le logement a été pris entre l'affichage et l'envoi :
						// cas normal — catalogue rafraîchi, autre choix proposé.
						setIndisponible(true);
						setLogementChoisi(null);
						void logementsQuery.refetch();
						return;
					}
					setErreur(apiError.message || "Impossible d'envoyer la demande.");
				},
			},
		);
	}

	const sejours = sejoursQuery.data ?? [];
	const conteneur = estClient
		? "mx-auto w-full max-w-6xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8"
		: "w-full space-y-6 p-6";

	return (
		<div className={conteneur}>
			<Breadcrumb
				items={
					estClient
						? [
								{ label: "Espace client", to: "/espace-client" },
								{ label: "Résidence — séjours courts" },
							]
						: [
								{ label: "Accueil", to: "/" },
								{ label: "Mon espace résident", to: "/residence/portail" },
								{ label: "Séjours courts" },
							]
				}
			/>

			<div className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Résidence — séjours courts
				</h1>
				<p className="text-sm text-muted-foreground">
					Choisissez vos dates pour voir les logements disponibles, puis envoyez
					votre demande. Le personnel confirme la disponibilité et le tarif — le
					règlement se fait sur place.
				</p>
			</div>

			{sejours.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-lg font-semibold text-foreground">
						Mes demandes de séjour
					</h2>
					<div className="space-y-3">
						{sejours.map((sejour) => (
							<div
								key={sejour.id}
								className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
							>
								<div className="min-w-0 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-foreground">
											{SEJOUR_TYPE_LABELS[sejour.type_prestation]} —{" "}
											{sejour.logement?.numero ??
												sejour.numero_logement ??
												"Logement"}
										</p>
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												SEJOUR_PORTAIL_STATUT_BADGE[sejour.statut] ??
													"bg-[#95A5A6] text-white",
											)}
										>
											{SEJOUR_PORTAIL_STATUT_LABELS[sejour.statut] ??
												sejour.statut}
										</span>
									</div>
									<p className="text-sm text-muted-foreground">
										Arrivée le {formatDateHeureISO(sejour.date_heure_arrivee)}
										{sejour.tarif
											? ` · ${formatMontantFCFA(sejour.tarif)}`
											: " · En attente de chiffrage"}
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => void navigate({ to: lienDetail(sejour.id) })}
								>
									Détails
									<ChevronRight className="size-4" aria-hidden />
								</Button>
							</div>
						))}
					</div>
				</section>
			) : null}

			<form
				onSubmit={soumettre}
				className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm"
			>
				<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
					<BedDouble className="size-5" aria-hidden />
					Nouvelle demande de séjour
				</h2>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<Label htmlFor="sejour-type">Type de prestation *</Label>
						<Select
							value={typePrestation}
							onValueChange={(v) => setTypePrestation(v as SejourType)}
						>
							<SelectTrigger
								id="sejour-type"
								aria-label="Type de prestation"
								className="mt-2 w-full"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{(
									Object.entries(SEJOUR_TYPE_LABELS) as [SejourType, string][]
								).map(([type, label]) => (
									<SelectItem key={type} value={type}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="sejour-arrivee">Date d'arrivée *</Label>
						<Input
							id="sejour-arrivee"
							type="date"
							required
							min={dateAujourdhui()}
							value={dateArrivee}
							onChange={(event) => setDateArrivee(event.target.value)}
							className="mt-2"
						/>
					</div>
					<div>
						<Label htmlFor="sejour-heure-arrivee">Heure d'arrivée</Label>
						<Input
							id="sejour-heure-arrivee"
							type="time"
							value={heureArrivee}
							onChange={(event) => setHeureArrivee(event.target.value)}
							className="mt-2"
						/>
					</div>
					<div>
						<Label htmlFor="sejour-depart">Date de départ *</Label>
						<Input
							id="sejour-depart"
							type="date"
							required
							min={dateArrivee || dateAujourdhui()}
							value={dateDepart}
							onChange={(event) => setDateDepart(event.target.value)}
							className="mt-2"
						/>
					</div>
					<div>
						<Label htmlFor="sejour-heure-depart">Heure de départ</Label>
						<Input
							id="sejour-heure-depart"
							type="time"
							value={heureDepart}
							onChange={(event) => setHeureDepart(event.target.value)}
							className="mt-2"
						/>
					</div>
				</div>

				{periodeValide ? (
					<section className="space-y-3">
						<h3 className="text-sm font-semibold text-foreground">
							Logements disponibles sur cette période
						</h3>
						{logementsQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">
								Chargement des logements…
							</p>
						) : logementsQuery.isError ? (
							<div
								role="alert"
								className="space-y-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
							>
								<p>Impossible de charger les logements disponibles.</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => void logementsQuery.refetch()}
								>
									Réessayer
								</Button>
							</div>
						) : logements.length === 0 ? (
							<p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
								Aucun logement n'est disponible sur cette période — essayez
								d'autres dates.
							</p>
						) : (
							<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{logements.map((logement) => {
									const choisi =
										logementChoisi?.id_logement === logement.id_logement;
									return (
										<li key={logement.id_logement}>
											<button
												type="button"
												disabled={!canDemander}
												onClick={() => setLogementChoisi(logement)}
												aria-pressed={choisi}
												className={cn(
													"w-full rounded-lg border p-4 text-left transition-colors",
													choisi
														? "border-lagoon bg-lagoon/10 ring-1 ring-lagoon"
														: "border-border bg-card hover:border-lagoon/50 hover:bg-accent/40",
												)}
											>
												<p className="font-semibold text-foreground">
													{logement.numero}
													{logement.nom ? ` — ${logement.nom}` : ""}
												</p>
												<p className="mt-1 text-sm text-muted-foreground">
													{logement.type}
													{logement.batiment_nom
														? ` · ${logement.batiment_nom}`
														: logement.batiment_code
															? ` · Bât. ${logement.batiment_code}`
															: ""}
												</p>
											</button>
										</li>
									);
								})}
							</ul>
						)}
						<p className="text-xs text-muted-foreground">
							Une demande en attente ne bloque pas le logement — la
							disponibilité est confirmée par le personnel à la validation.
						</p>
					</section>
				) : (
					<p className="text-sm text-muted-foreground">
						Saisissez une date d'arrivée et une date de départ pour afficher les
						logements disponibles.
					</p>
				)}

				{logementChoisi && selectionValide ? (
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<Label htmlFor="sejour-personnes">
								Nombre de personnes (optionnel)
							</Label>
							<Input
								id="sejour-personnes"
								type="number"
								min={1}
								step={1}
								placeholder="Ex. 2"
								value={nombrePersonnes}
								onChange={(event) => setNombrePersonnes(event.target.value)}
								className="mt-2"
							/>
						</div>
						<div className="sm:col-span-2">
							<Label htmlFor="sejour-observations">
								Message / observations (optionnel)
							</Label>
							<Textarea
								id="sejour-observations"
								rows={3}
								maxLength={500}
								placeholder="Précisez vos besoins (étage, heure d'arrivée…)"
								value={observations}
								onChange={(event) => setObservations(event.target.value)}
								className="mt-2"
							/>
						</div>
					</div>
				) : null}

				{indisponible ? (
					<p
						role="alert"
						className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
					>
						Ce logement vient d'être pris — la liste des disponibilités a été
						rafraîchie, choisissez un autre logement.
					</p>
				) : null}
				{erreur ? (
					<p role="alert" className="text-sm text-destructive">
						{erreur}
					</p>
				) : null}

				{canDemander ? (
					<Button
						type="submit"
						className="bg-lagoon text-white hover:bg-lagoon/90"
						disabled={creer.isPending || !periodeValide || !selectionValide}
					>
						{creer.isPending ? "Envoi en cours…" : "Envoyer ma demande"}
					</Button>
				) : null}
			</form>
		</div>
	);
}
