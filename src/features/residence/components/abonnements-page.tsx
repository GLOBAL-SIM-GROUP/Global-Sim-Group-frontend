import { Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useAbonnements,
	useResilierAbonnement,
} from "../hooks/use-abonnements";
import {
	type Abonnement,
	type AbonnementStatutFiltre,
	filtrerAbonnements,
	paginerAbonnements,
} from "../models/abonnements";
import { ABONNEMENTS_PAGE_SIZE } from "../permissions";
import { AbonnementFilters } from "./abonnement-filters";
import { AbonnementFormDialog } from "./abonnement-form-dialog";
import { AbonnementTable } from "./abonnement-table";
import { ConfirmDialog } from "./confirm-dialog";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface AbonnementsSearch {
	statut?: AbonnementStatutFiltre;
	locataire?: string;
	service?: string;
	page?: number;
}

interface AbonnementsPageProps {
	initialSearch: AbonnementsSearch;
	onSearchChange: (maj: (prev: AbonnementsSearch) => AbonnementsSearch) => void;
}

/**
 * Page « Abonnements » (module Résidence, M2.4) : liste des abonnements
 * souscrits par les résidents, filtres, « Nouvel abonnement », Modifier et
 * Résilier (endpoint réel `POST /abonnements/{id}/resilier`).
 */
export function AbonnementsPage({
	initialSearch,
	onSearchChange,
}: AbonnementsPageProps) {
	const canCreer = useCan("RESIDENCE.CREER");

	const abonnementsQuery = useAbonnements();
	const resilierMutation = useResilierAbonnement();

	const [statut, setStatut] = useState<AbonnementStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [locataire, setLocataire] = useState(initialSearch.locataire ?? "");
	const [service, setService] = useState(initialSearch.service ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	// Modale de création/édition : `formOuvert` = création, `aModifier` = édition.
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Abonnement | null>(null);
	const [aResilier, setAResilier] = useState<Abonnement | null>(null);

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	const changerFiltre = (patch: {
		statut?: AbonnementStatutFiltre;
		locataire?: string;
		service?: string;
	}) => {
		setStatut(patch.statut ?? statut);
		setLocataire(patch.locataire ?? locataire);
		setService(patch.service ?? service);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerAbonnements(abonnementsQuery.data ?? [], {
		statut,
		locataire,
		service,
	});
	const pagination = paginerAbonnements(filtres, page, ABONNEMENTS_PAGE_SIZE);

	const feedback = resilierMutation.isError
		? { type: "error" as const, texte: "Une erreur est survenue." }
		: resilierMutation.isSuccess
			? { type: "success" as const, texte: "Abonnement résilié avec succès." }
			: null;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Charges facturées", to: "/residence/charges" },
					{ label: "Abonnements" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Abonnements
					</h1>
					<p className="text-muted-foreground">
						Abonnements souscrits par les résidents (restaurant, pressing, eau,
						etc.).
					</p>
				</section>

				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
					<Button
						variant="outline"
						size="sm"
						asChild
						className="w-full sm:w-auto"
					>
						<Link to="/residence/categories-abonnements">
							Catégories d'abonnement
						</Link>
					</Button>
					{canCreer ? (
						<Button
							onClick={() => setFormOuvert(true)}
							className="w-full sm:w-auto"
						>
							<Plus className="size-4" aria-hidden />
							Nouvel abonnement
						</Button>
					) : null}
				</div>
			</div>

			{feedback ? (
				<div
					role={feedback.type === "error" ? "alert" : "status"}
					className={cn(
						"flex items-center justify-between gap-3 rounded-md border px-4 py-2 text-sm",
						feedback.type === "error"
							? "border-destructive/40 bg-destructive/10 text-destructive"
							: "border-[#27AE60]/40 bg-[#27AE60]/10 text-[#27AE60]",
					)}
				>
					<span>{feedback.texte}</span>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Fermer"
						onClick={() => resilierMutation.reset()}
					>
						<X className="size-4" aria-hidden />
					</Button>
				</div>
			) : null}

			<AbonnementFilters
				statut={statut}
				locataire={locataire}
				service={service}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onLocataireChange={(valeur) => changerFiltre({ locataire: valeur })}
				onServiceChange={(valeur) => changerFiltre({ service: valeur })}
			/>

			{abonnementsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : abonnementsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les abonnements.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void abonnementsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<AbonnementTable
					abonnements={pagination.items}
					onEdit={(abonnement) => setAModifier(abonnement)}
					onResilier={(abonnement) => setAResilier(abonnement)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des abonnements"
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

			<div className="flex justify-end">
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/charges">Retour aux charges facturées</Link>
				</Button>
			</div>

			<AbonnementFormDialog
				open={formOuvert || aModifier !== null}
				abonnement={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>

			<ConfirmDialog
				open={aResilier !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAResilier(null);
				}}
				title="Résilier l'abonnement"
				message={`Voulez-vous vraiment résilier l'abonnement « ${aResilier?.service ?? ""} » ?`}
				confirmLabel="Résilier"
				cancelLabel="Annuler"
				destructive
				busy={resilierMutation.isPending}
				onConfirm={() => {
					if (aResilier) {
						resilierMutation.mutate(aResilier.id, {
							onSettled: () => setAResilier(null),
						});
					}
				}}
			/>
		</div>
	);
}
