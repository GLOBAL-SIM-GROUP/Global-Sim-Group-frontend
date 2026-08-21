import { Link } from "@tanstack/react-router";
import { CheckCheck, Pencil, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import {
	useAnnulerReservation,
	useConfirmerReservation,
	useRealiserReservation,
	useReservations,
} from "../hooks/use-reservations";
import {
	filtrerReservations,
	paginerReservations,
	RESERVATION_STATUT_BADGE,
	RESERVATION_STATUT_LABELS,
	type ReservationFete,
	type ReservationStatut,
	type ReservationStatutFiltre,
} from "../models/reservations";
import { RESERVATIONS_PAGE_SIZE } from "../permissions";
import { PaiementDialog } from "./paiement-dialog";
import { ReservationFormDialog } from "./reservation-form-dialog";

/** Filtres reflétés dans l'URL. */
export interface ReservationsSearch {
	statut?: ReservationStatutFiltre;
	type?: string;
	du?: string;
	au?: string;
	page?: number;
}

interface ReservationsPageProps {
	initialSearch: ReservationsSearch;
	onSearchChange: (
		maj: (prev: ReservationsSearch) => ReservationsSearch,
	) => void;
}

/**
 * Page « Réservations — Salle de fête » (module M6) : liste des réservations,
 * filtres Statut/Période (serveur) + Type, « Nouvelle réservation », actions
 * Modifier / Confirmer / Réaliser / Annuler. Chaque ligne ouvre la fiche
 * détaillée ; la vue calendrier mensuelle vit sur `/salle-fete/calendrier`.
 */
export function ReservationsPage({
	initialSearch,
	onSearchChange,
}: ReservationsPageProps) {
	const canCreer = useCan("SALLE_FETE.CREER");
	const canModifier = useCan("SALLE_FETE.MODIFIER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	const reservationsQuery = useReservations(
		initialSearch.statut ?? "tous",
		initialSearch.du,
		initialSearch.au,
	);
	const moyensQuery = useMoyensPaiement();
	const confirmerMutation = useConfirmerReservation();
	const realiserMutation = useRealiserReservation();
	const annulerMutation = useAnnulerReservation();

	const reservations = reservationsQuery.data ?? [];

	const [statut, setStatut] = useState<ReservationStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [type, setType] = useState(initialSearch.type ?? "");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<ReservationFete | null>(null);
	const [aPayer, setAPayer] = useState<{
		id: string;
		mode: "confirmer" | "realiser";
		montant: string;
	} | null>(null);
	const [aAnnuler, setAAnnuler] = useState<ReservationFete | null>(null);

	const changerFiltre = (patch: {
		statut?: ReservationStatutFiltre;
		type?: string;
		du?: string;
		au?: string;
	}) => {
		setStatut(patch.statut ?? statut);
		setType(patch.type ?? type);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerReservations(reservations, { statut, type, du, au });
	const pagination = paginerReservations(filtres, page, RESERVATIONS_PAGE_SIZE);
	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Réservations — Salle de fête" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Réservations — Salle de fête
					</h1>
					<p className="text-muted-foreground">
						Liste des réservations de la salle et leur statut.
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouvelle réservation
					</Button>
				) : null}
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select
					value={statut}
					onValueChange={(valeur) =>
						changerFiltre({ statut: valeur as ReservationStatutFiltre })
					}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						{(
							Object.keys(RESERVATION_STATUT_LABELS) as ReservationStatut[]
						).map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{RESERVATION_STATUT_LABELS[valeur]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					value={type}
					onChange={(event) => changerFiltre({ type: event.target.value })}
					placeholder="Manifestation…"
					aria-label="Filtrer par manifestation"
					className="w-44"
				/>
				<Input
					type="date"
					value={du}
					onChange={(event) => changerFiltre({ du: event.target.value })}
					aria-label="Début de période"
					className="w-40"
				/>
				<Input
					type="date"
					value={au}
					onChange={(event) => changerFiltre({ au: event.target.value })}
					aria-label="Fin de période"
					className="w-40"
				/>
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
			) : pagination.items.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune réservation trouvée.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									CLIENT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									MANIFESTATION
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									TARIF
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ACOMPTE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									SOLDE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((reservation) => (
								<tr
									key={reservation.id}
									className="relative border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3">
										{/* Toute la ligne ouvre la fiche (stretched link) ; la cellule
										    ACTIONS repasse au-dessus via `relative z-10`. */}
										<Link
											to="/salle-fete/reservations/$id"
											params={{ id: reservation.id }}
											title={`Voir la fiche de la réservation du ${reservation.date_evenement}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{reservation.nom_client ?? "—"}
										</Link>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{reservation.date_evenement}{" "}
										{reservation.heure_debut?.slice(0, 5)}
									</td>
									<td className="px-4 py-3 text-foreground">
										{reservation.type_manifestation}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(reservation.tarif)}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(reservation.acompte)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatMontantFCFA(reservation.solde)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												RESERVATION_STATUT_BADGE[reservation.statut],
											)}
										>
											{RESERVATION_STATUT_LABELS[reservation.statut]}
										</span>
									</td>
									<td className="relative z-10 px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Modifier"
													onClick={() => setAModifier(reservation)}
												>
													<Pencil className="size-4" aria-hidden />
													<span className="sr-only">Modifier</span>
												</Button>
											) : null}
											{canModifier &&
											canFinancesVoir &&
											reservation.statut === "RESERVEE" ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Confirmer (encaisser l'acompte)"
													onClick={() =>
														setAPayer({
															id: reservation.id,
															mode: "confirmer",
															montant: reservation.solde,
														})
													}
												>
													<CheckCheck
														className="size-4 text-lagoon"
														aria-hidden
													/>
													<span className="sr-only">Confirmer</span>
												</Button>
											) : null}
											{canModifier &&
											canFinancesVoir &&
											reservation.statut === "CONFIRMEE" ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Marquer comme réalisée (encaisser le solde)"
													onClick={() =>
														setAPayer({
															id: reservation.id,
															mode: "realiser",
															montant: reservation.solde,
														})
													}
												>
													<CheckCheck
														className="size-4 text-lagoon"
														aria-hidden
													/>
													<span className="sr-only">Réaliser</span>
												</Button>
											) : null}
											{canModifier &&
											reservation.statut !== "REALISEE" &&
											reservation.statut !== "ANNULEE" ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Annuler"
													onClick={() => setAAnnuler(reservation)}
												>
													<X className="size-4 text-destructive" aria-hidden />
													<span className="sr-only">Annuler</span>
												</Button>
											) : null}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des réservations"
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<p className="text-sm text-muted-foreground">
						Affichage de {pagination.start} à {pagination.end} sur{" "}
						{pagination.total} résultats
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page <= 1}
							onClick={() => allerPage(pagination.page - 1)}
						>
							Précédent
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => allerPage(pagination.page + 1)}
						>
							Suivant
						</Button>
					</div>
				</nav>
			) : null}

			<ReservationFormDialog
				open={formOuvert || aModifier !== null}
				reservation={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
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
										confirmerMutation.mutate({
											id: aPayer.id,
											montant,
											idMoyen,
										});
									} else {
										realiserMutation.mutate({
											id: aPayer.id,
											montant,
											idMoyen,
										});
									}
								}}
							/>
						</div>
					</div>
				</div>
			) : null}

			<ConfirmDialog
				open={aAnnuler !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAAnnuler(null);
				}}
				title="Annuler la réservation"
				message={`Voulez-vous vraiment annuler la réservation du ${aAnnuler?.date_evenement ?? ""} ?`}
				confirmLabel="Annuler"
				cancelLabel="Fermer"
				destructive
				busy={annulerMutation.isPending}
				onConfirm={() => {
					if (aAnnuler) {
						annulerMutation.mutate(aAnnuler.id, {
							onSettled: () => setAAnnuler(null),
						});
					}
				}}
			/>
		</div>
	);
}
