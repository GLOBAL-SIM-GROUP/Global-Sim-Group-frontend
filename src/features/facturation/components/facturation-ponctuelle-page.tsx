import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { Input } from "#/components/ui/input";
import { PageHeader } from "#/components/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";
import { useClientsDetails } from "#/features/residence/hooks/use-clients";
import { nomComplet } from "#/features/residence/models/clients";
import {
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useFactures } from "../hooks/use-factures";
import {
	FACTURE_SOURCE_LABELS,
	FACTURE_STATUT_LABELS,
	FACTURE_STATUT_VARIANT,
	type FactureStatut,
	filtrerFactures,
	paginerFactures,
	rechercherFactures,
} from "../models/factures";
import { FACTURES_PAGE_SIZE } from "../permissions";
import { FactureFormDialog } from "./facture-form-dialog";

/** Filtres/pagination reflétés dans l'URL. */
export interface FacturationSearch {
	recherche?: string;
	statut?: string;
	source?: string;
	page?: number;
}

interface FacturationPonctuellePageProps {
	initialSearch: FacturationSearch;
	onSearchChange: (maj: (prev: FacturationSearch) => FacturationSearch) => void;
}

/**
 * Page « Facturation ponctuelle » (module M7) : liste des factures (recherche
 * texte + filtres statut/source côté client — le lister ignore la recherche),
 * bouton « Nouvelle facture ponctuelle » et lignes cliquables vers la fiche.
 */
export function FacturationPonctuellePage({
	initialSearch,
	onSearchChange,
}: FacturationPonctuellePageProps) {
	const canCreer = useCan("FACTURATION.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const navigate = useNavigate();

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [source, setSource] = useState(initialSearch.source ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);

	const facturesQuery = useFactures();

	const factures = facturesQuery.data ?? [];
	const clientIds = useMemo(
		() =>
			factures
				.map((facture) => facture.id_client)
				.filter((id): id is string => Boolean(id)),
		[factures],
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

	const changerFiltre = (patch: { statut?: string; source?: string }) => {
		setStatut(patch.statut ?? statut);
		setSource(patch.source ?? source);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const changerRecherche = (terme: string) => {
		setRecherche(terme);
		setPage(1);
		onSearchChange((prev) => ({
			...prev,
			recherche: terme || undefined,
			page: 1,
		}));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const recherchees = rechercherFactures(factures, clients, recherche);
	const filtres = filtrerFactures(recherchees, { statut, source });
	const pagination = paginerFactures(filtres, page, FACTURES_PAGE_SIZE);

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Facturation ponctuelle" },
				]}
				title="Facturation ponctuelle"
				description="Factures émises (ponctuelles et issues des autres modules)."
				actions={
					canCreer && canFinancesVoir ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Nouvelle facture ponctuelle
						</Button>
					) : null
				}
			/>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Input
					value={recherche}
					onChange={(event) => changerRecherche(event.target.value)}
					placeholder="Rechercher par numéro ou client…"
					aria-label="Rechercher une facture"
					className="w-64"
				/>
				<Select
					value={statut}
					onValueChange={(valeur) => changerFiltre({ statut: valeur })}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						{(Object.keys(FACTURE_STATUT_LABELS) as FactureStatut[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{FACTURE_STATUT_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
				<Select
					value={source}
					onValueChange={(valeur) => changerFiltre({ source: valeur })}
				>
					<SelectTrigger aria-label="Source" className="w-52">
						<SelectValue placeholder="Source" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Toutes les sources</SelectItem>
						{Object.entries(FACTURE_SOURCE_LABELS).map(([valeur, libelle]) => (
							<SelectItem key={valeur} value={valeur}>
								{libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{facturesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : facturesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les factures.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void facturesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<EmptyState title="Aucune facture trouvée." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>NUMÉRO</Th>
								<Th>DATE</Th>
								<Th>CLIENT</Th>
								<Th>SOURCE</Th>
								<Th className="text-right">MONTANT</Th>
								<Th className="text-right">PAYÉ</Th>
								<Th className="text-right">RESTE</Th>
								<Th>STATUT</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((facture) => (
								<Tr key={facture.id}>
									<Td>
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/facturation/factures/$id"
											params={{ id: facture.id }}
											title={`Voir la facture ${facture.numero}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{facture.numero}
										</Link>
									</Td>
									<Td className="text-muted-foreground">
										{formatDateHeureUTC(facture.date)}
									</Td>
									<Td className="text-foreground">
										{facture.id_client
											? (clients.get(facture.id_client) ?? "…")
											: "—"}
									</Td>
									<Td className="text-muted-foreground">
										{facture.source_type
											? (FACTURE_SOURCE_LABELS[facture.source_type] ??
												facture.source_type)
											: "—"}
									</Td>
									<Td className="text-right text-foreground">
										{formatMontantFCFA(facture.montant_total)}
									</Td>
									<Td className="text-right text-success">
										{formatMontantFCFA(facture.montant_paye)}
									</Td>
									<Td className="text-right font-semibold text-destructive">
										{formatMontantFCFA(facture.reste)}
									</Td>
									<Td>
										<Badge variant={FACTURE_STATUT_VARIANT[facture.statut]}>
											{FACTURE_STATUT_LABELS[facture.statut]}
										</Badge>
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des factures"
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

			<FactureFormDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onCreated={(idFacture) => {
					setFormOuvert(false);
					void navigate({
						to: "/facturation/factures/$id",
						params: { id: idFacture },
					});
				}}
			/>
		</div>
	);
}
