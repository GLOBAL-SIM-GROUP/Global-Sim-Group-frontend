import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";

import {
	useCommande,
	useCommandes,
	usePretCommande,
	useTraitementCommande,
} from "../hooks/use-commandes";
import {
	type CommandePressing,
	type CommandeStatutFiltre,
	filtrerCommandes,
	paginerCommandes,
} from "../models/commandes";
import { COMMANDES_PAGE_SIZE } from "../permissions";
import { CommandeFilters } from "./commande-filters";
import { CommandeFormDialog } from "./commande-form-dialog";
import { CommandeTable } from "./commande-table";
import { RetirerCommandeDialog } from "./retirer-commande-dialog";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface CommandesSearch {
	recherche?: string;
	statut?: CommandeStatutFiltre;
	client?: string;
	du?: string;
	au?: string;
	page?: number;
}

interface CommandesPageProps {
	initialSearch: CommandesSearch;
	onSearchChange: (maj: (prev: CommandesSearch) => CommandesSearch) => void;
}

/**
 * Page « Commandes — Pressing » (module Pressing, M4) : liste des commandes
 * avec statut, filtres (recherche serveur + statut/période serveurs, client
 * côté client), « Nouvelle commande » (modale de dépôt) et actions Modifier /
 * Changer le statut / Retirer.
 */
export function CommandesPage({
	initialSearch,
	onSearchChange,
}: CommandesPageProps) {
	const canCreer = useCan("PRESSING.CREER");
	const canModifier = useCan("PRESSING.MODIFIER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	const moyensQuery = useMoyensPaiement();
	const traitementMutation = useTraitementCommande();
	const pretMutation = usePretCommande();

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [statut, setStatut] = useState<CommandeStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [client, setClient] = useState(initialSearch.client ?? "");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<CommandePressing | null>(null);
	const [aRetirer, setARetirer] = useState<CommandePressing | null>(null);

	// Lignes de la commande en cours d'édition (le lister ne les embarque pas).
	const commandeEditQuery = useCommande(aModifier?.id);

	const commandesQuery = useCommandes(
		statut,
		du || undefined,
		au || undefined,
		recherche || undefined,
	);

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	const changerFiltre = (patch: {
		recherche?: string;
		statut?: CommandeStatutFiltre;
		client?: string;
		du?: string;
		au?: string;
	}) => {
		setRecherche(patch.recherche ?? recherche);
		setStatut(patch.statut ?? statut);
		setClient(patch.client ?? client);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = useMemo(() => {
		const base = filtrerCommandes(commandesQuery.data ?? [], {
			statut,
			client,
			du,
			au,
		});
		return base;
	}, [commandesQuery.data, statut, client, du, au]);
	const pagination = paginerCommandes(filtres, page, COMMANDES_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Pressing" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Commandes — Pressing
					</h1>
					<p className="text-muted-foreground">
						Liste de toutes les commandes de pressing et leur statut.
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouvelle commande
					</Button>
				) : null}
			</div>

			<CommandeFilters
				recherche={recherche}
				statut={statut}
				client={client}
				du={du}
				au={au}
				onRechercheChange={(valeur) => changerFiltre({ recherche: valeur })}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onClientChange={(valeur) => changerFiltre({ client: valeur })}
				onDuChange={(valeur) => changerFiltre({ du: valeur })}
				onAuChange={(valeur) => changerFiltre({ au: valeur })}
			/>

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
					canModifier={canModifier}
					canCreer={canCreer}
					canFinancesVoir={canFinancesVoir}
					onEdit={(commande) => setAModifier(commande)}
					onTraitement={(commande) => traitementMutation.mutate(commande.id)}
					onPret={(commande) => pretMutation.mutate(commande.id)}
					onRetirer={(commande) => setARetirer(commande)}
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
				open={formOuvert || aModifier !== null}
				commande={aModifier}
				lignesInitiales={commandeEditQuery.data?.lignes ?? []}
				chargementLignes={aModifier !== null && commandeEditQuery.isLoading}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>

			<RetirerCommandeDialog
				open={aRetirer !== null}
				commande={aRetirer}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setARetirer(null);
				}}
				onSaved={() => setARetirer(null)}
			/>
		</div>
	);
}
