import { Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { nomComplet } from "#/features/residence/models/clients";
import { cn } from "#/lib/utils";
import { ConfirmDialog } from "../../residence/components/confirm-dialog";
import { useProduits } from "../hooks/use-produits";
import { useAnnulerVente, useVentes } from "../hooks/use-ventes";
import {
	filtrerVentes,
	paginerVentes,
	type VenteJoin,
	type VenteStatutFiltre,
} from "../models/ventes";
import { VENTES_PAGE_SIZE } from "../permissions";
import { VenteFactureDialog } from "./vente-facture-dialog";
import { VenteFilters } from "./vente-filters";
import { VenteFormDialog } from "./vente-form-dialog";
import { VenteTable } from "./vente-table";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface VentesSearch {
	statut?: VenteStatutFiltre;
	du?: string;
	au?: string;
	client?: string;
	page?: number;
}

interface VentesPageProps {
	initialSearch: VentesSearch;
	onSearchChange: (maj: (prev: VentesSearch) => VentesSearch) => void;
}

/**
 * Page « Ventes — Market » (module Marchandise, M3) : historique des ventes
 * avec total, client (résolu via la base unique) et statut. Actions : Voir la
 * facture, Annuler (administrateur). « Export PDF/Excel » omis (aucun endpoint).
 */
export function VentesPage({ initialSearch, onSearchChange }: VentesPageProps) {
	const canCreer = useCan("MARCHANDISE.CREER");

	const ventesQuery = useVentes();
	const produitsQuery = useProduits();
	const moyensQuery = useMoyensPaiement();
	const annulerMutation = useAnnulerVente();

	const ventes = ventesQuery.data ?? [];
	const clientIds = useMemo(
		() =>
			ventes.map((v) => v.id_client).filter((id): id is string => Boolean(id)),
		[ventes],
	);
	const clientsDetails = useClientsDetails(clientIds);

	const [statut, setStatut] = useState<VenteStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [client, setClient] = useState(initialSearch.client ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aVoir, setAVoir] = useState<string | null>(null);
	const [aAnnuler, setAAnnuler] = useState<VenteJoin | null>(null);

	const joins: VenteJoin[] = useMemo(
		() =>
			ventes.map((vente) => {
				const clientObj = clientsDetails.data?.get(vente.id_client ?? "");
				return {
					...vente,
					clientNom: clientObj
						? nomComplet(clientObj)
						: clientsDetails.isLoading
							? "…"
							: "—",
				};
			}),
		[ventes, clientsDetails.data, clientsDetails.isLoading],
	);

	const changerFiltre = (patch: {
		statut?: VenteStatutFiltre;
		du?: string;
		au?: string;
		client?: string;
	}) => {
		setStatut(patch.statut ?? statut);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setClient(patch.client ?? client);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = useMemo(() => {
		const base = filtrerVentes(joins, { statut, du, au });
		if (!client) return base;
		const terme = client.toLowerCase();
		return base.filter((vente) =>
			vente.clientNom.toLowerCase().includes(terme),
		);
	}, [joins, statut, du, au, client]);
	const pagination = paginerVentes(filtres, page, VENTES_PAGE_SIZE);

	const feedback = annulerMutation.isError
		? { type: "error" as const, texte: "Une erreur est survenue." }
		: annulerMutation.isSuccess
			? { type: "success" as const, texte: "Vente annulée avec succès." }
			: null;

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Produits — Market", to: "/marchandise/produits" },
					{ label: "Ventes — Market" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Ventes — Market
					</h1>
					<p className="text-muted-foreground">
						Toutes les ventes enregistrées, avec le total et le client.
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouvelle vente
					</Button>
				) : null}
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

			<VenteFilters
				statut={statut}
				du={du}
				au={au}
				client={client}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onDuChange={(valeur) => changerFiltre({ du: valeur })}
				onAuChange={(valeur) => changerFiltre({ au: valeur })}
				onClientChange={(valeur) => changerFiltre({ client: valeur })}
			/>

			{ventesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : ventesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les ventes.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void ventesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<VenteTable
					ventes={pagination.items}
					onVoirFacture={(vente) => setAVoir(vente.id)}
					onAnnuler={(vente) => setAAnnuler(vente)}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des ventes"
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
					<Link to="/marchandise/produits">Retour aux produits</Link>
				</Button>
			</div>

			<VenteFormDialog
				open={formOuvert}
				produits={produitsQuery.data ?? []}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			<VenteFactureDialog
				open={aVoir !== null}
				venteId={aVoir}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAVoir(null);
				}}
			/>

			<ConfirmDialog
				open={aAnnuler !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAAnnuler(null);
				}}
				title="Annuler la vente"
				message={`Voulez-vous vraiment annuler la vente n° ${aAnnuler?.id ?? ""} ?`}
				confirmLabel="Annuler la vente"
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
