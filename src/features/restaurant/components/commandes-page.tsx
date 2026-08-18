import { Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
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
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { nomComplet } from "#/features/residence/models/clients";
import { cn } from "#/lib/utils";

import {
	useAnnulerCommande,
	useCommandes,
	useMajStatutCommande,
} from "../hooks/use-commandes";
import { usePlats } from "../hooks/use-plats";
import {
	COMMANDE_STATUT_LABELS,
	type CommandeRestaurant,
	type CommandeRestaurantStatut,
	type CommandeStatutFiltre,
	filtrerCommandes,
	paginerCommandes,
	TYPE_COMMANDE_LABELS,
	type TypeCommande,
	type TypeCommandeFiltre,
} from "../models/commandes";
import { COMMANDES_RESTAURANT_PAGE_SIZE } from "../permissions";
import { CommandeFactureDialog } from "./commande-facture-dialog";
import { CommandeFormDialog } from "./commande-form-dialog";
import { CommandeTable } from "./commande-table";

/** Filtres/pagination reflétés dans l'URL. */
export interface CommandesSearch {
	statut?: CommandeStatutFiltre;
	type?: TypeCommandeFiltre;
	du?: string;
	au?: string;
	page?: number;
}

interface CommandesPageProps {
	initialSearch: CommandesSearch;
	onSearchChange: (maj: (prev: CommandesSearch) => CommandesSearch) => void;
}

/**
 * Page « Commandes — Restaurant » (module Restaurant, M5) : historique des
 * commandes avec statut, filtres (statut/période serveurs, type client), bouton
 * « Nouvelle commande » et actions Voir la facture / Modifier le statut /
 * Annuler.
 */
export function CommandesPage({
	initialSearch,
	onSearchChange,
}: CommandesPageProps) {
	const canCreer = useCan("RESTAURANT.CREER");
	const canModifier = useCan("RESTAURANT.MODIFIER");
	const canSupprimer = useCan("RESTAURANT.SUPPRIMER");

	const commandesQuery = useCommandes(
		initialSearch.statut ?? "tous",
		initialSearch.du,
		initialSearch.au,
	);
	const platsQuery = usePlats();
	const moyensQuery = useMoyensPaiement();
	const statutMutation = useMajStatutCommande();
	const annulerMutation = useAnnulerCommande();

	const commandes = commandesQuery.data ?? [];
	const clientIds = useMemo(
		() =>
			commandes
				.map((c) => c.id_client)
				.filter((id): id is string => Boolean(id)),
		[commandes],
	);
	const clientsDetails = useClientsDetails(clientIds);
	const clients = useMemo(
		() =>
			new Map(
				(clientsDetails.data
					? [...clientsDetails.data.entries()].map(([id, client]) => [
							id,
							nomComplet(client),
						])
					: []) as [string, string][],
			),
		[clientsDetails.data],
	);

	const [statut, setStatut] = useState<CommandeStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [type, setType] = useState<TypeCommandeFiltre>(
		initialSearch.type ?? "tous",
	);
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aVoir, setAVoir] = useState<string | null>(null);
	const [aAnnuler, setAAnnuler] = useState<CommandeRestaurant | null>(null);

	const changerFiltre = (patch: {
		statut?: CommandeStatutFiltre;
		type?: TypeCommandeFiltre;
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

	const filtres = filtrerCommandes(commandes, { statut, type, du, au });
	const pagination = paginerCommandes(
		filtres,
		page,
		COMMANDES_RESTAURANT_PAGE_SIZE,
	);

	const feedback = annulerMutation.isError
		? { type: "error" as const, texte: "Une erreur est survenue." }
		: annulerMutation.isSuccess
			? { type: "success" as const, texte: "Commande annulée avec succès." }
			: null;

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Restaurant" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Commandes — Restaurant
					</h1>
					<p className="text-muted-foreground">
						Historique des commandes restaurant et leur statut.
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/restaurant/plats">Carte des plats</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to="/restaurant/statistiques">Statistiques</Link>
					</Button>
					{canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Nouvelle commande
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
						onClick={() => annulerMutation.reset()}
					>
						<X className="size-4" aria-hidden />
					</Button>
				</div>
			) : null}

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select
					value={statut}
					onValueChange={(valeur) =>
						changerFiltre({ statut: valeur as CommandeStatutFiltre })
					}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						{(
							Object.keys(COMMANDE_STATUT_LABELS) as CommandeRestaurantStatut[]
						).map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{COMMANDE_STATUT_LABELS[valeur]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={type}
					onValueChange={(valeur) =>
						changerFiltre({ type: valeur as TypeCommandeFiltre })
					}
				>
					<SelectTrigger aria-label="Type" className="w-44">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les types</SelectItem>
						{(Object.keys(TYPE_COMMANDE_LABELS) as TypeCommande[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{TYPE_COMMANDE_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>

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

			{commandesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : commandesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les commandes.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void commandesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<CommandeTable
					commandes={pagination.items}
					clients={clients}
					canModifier={canModifier}
					canSupprimer={canSupprimer}
					onVoirFacture={(commande) => setAVoir(commande.id)}
					onStatut={(commande, suivant) =>
						statutMutation.mutate({ id: commande.id, statut: suivant })
					}
					onAnnuler={(commande) => setAAnnuler(commande)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des commandes"
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

			<CommandeFormDialog
				open={formOuvert}
				plats={platsQuery.data ?? []}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			<CommandeFactureDialog
				open={aVoir !== null}
				commandeId={aVoir}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAVoir(null);
				}}
			/>

			<ConfirmDialog
				open={aAnnuler !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAAnnuler(null);
				}}
				title="Annuler la commande"
				message={`Voulez-vous vraiment annuler la commande n° ${aAnnuler?.id ?? ""} ?`}
				confirmLabel="Annuler la commande"
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
