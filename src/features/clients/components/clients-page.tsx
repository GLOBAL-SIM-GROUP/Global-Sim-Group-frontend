import { Link } from "@tanstack/react-router";
import { Home, UserPlus } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { InputField } from "#/components/ui/input-field";
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
import { formatDateHeureUTC } from "#/features/residence/models/format";

import { useClients } from "../hooks/use-clients";
import {
	filtrerClients,
	nomComplet,
	paginerClients,
	TYPE_CLIENT_LABELS,
	type TypeClient,
} from "../models/clients";
import { CLIENTS_PAGE_SIZE } from "../permissions";
import { ClientFormDialog } from "./client-form-dialog";
import { ClientSimpleFormDialog } from "./client-simple-form-dialog";

/** Filtres/pagination reflétés dans l'URL. */
export interface ClientsSearch {
	recherche?: string;
	type?: string;
	page?: number;
}

interface ClientsPageProps {
	initialSearch: ClientsSearch;
	onSearchChange: (maj: (prev: ClientsSearch) => ClientsSearch) => void;
}

function BadgeType({ type }: { type: string }) {
	const libelle = TYPE_CLIENT_LABELS[type as TypeClient] ?? type;
	const variant =
		type === "LOCATAIRE" ? "info" : type === "PASSAGE" ? "warning" : "neutral";
	return <Badge variant={variant}>{libelle}</Badge>;
}

/**
 * Page « Locataires et clients » (3.1) : fiches des locataires et clients de
 * passage, recherche, filtre par type et accès à la fiche détaillée.
 */
export function ClientsPage({
	initialSearch,
	onSearchChange,
}: ClientsPageProps) {
	const canCreer = useCan("CLIENT.CREER");

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [type, setType] = useState(initialSearch.type ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	// "locataire" = formulaire complet ; "client" = formulaire minimal (PASSAGE).
	const [formulaireOuvert, setFormulaireOuvert] = useState<
		"locataire" | "client" | null
	>(null);

	const clientsQuery = useClients({ search: recherche });

	const changerFiltre = (patch: { recherche?: string; type?: string }) => {
		if (patch.recherche !== undefined) setRecherche(patch.recherche);
		setType(patch.type ?? type);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const clients = clientsQuery.data ?? [];
	const filtres = filtrerClients(clients, { type, recherche });
	const pagination = paginerClients(filtres, page, CLIENTS_PAGE_SIZE);

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Locataires et clients" },
				]}
				title="Locataires et clients"
				description="Fiches des locataires et clients de passage."
				actions={
					canCreer ? (
						<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
							<Button
								variant="outline"
								onClick={() => setFormulaireOuvert("locataire")}
								className="w-full sm:w-auto"
							>
								<Home className="size-4" aria-hidden />
								Ajouter un locataire
							</Button>
							<Button
								onClick={() => setFormulaireOuvert("client")}
								className="w-full sm:w-auto"
							>
								<UserPlus className="size-4" aria-hidden />
								Ajouter un client
							</Button>
						</div>
					) : undefined
				}
			/>

			<div className="flex gap-2">
				<div className="flex-1">
					<InputField
						placeholder="Rechercher par nom, prénom, téléphone…"
						value={recherche}
						onChange={(e) => changerFiltre({ recherche: e.target.value })}
					/>
				</div>
				<Select
					value={type}
					onValueChange={(valeur) => changerFiltre({ type: valeur })}
				>
					<SelectTrigger aria-label="Type de client" className="w-44">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les types</SelectItem>
						{(Object.keys(TYPE_CLIENT_LABELS) as TypeClient[]).map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{TYPE_CLIENT_LABELS[valeur]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{clientsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : clientsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les clients.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void clientsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<EmptyState title="Aucun client trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>CODE</Th>
								<Th>CLIENT</Th>
								<Th>TÉLÉPHONE</Th>
								<Th>TYPE</Th>
								<Th>VILLE</Th>
								<Th>ENREGISTRÉ</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((client) => (
								<Tr key={client.id}>
									<Td className="font-mono text-xs text-muted-foreground">
										{client.code}
									</Td>
									<Td>
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/client/clients/$id"
											params={{ id: client.id }}
											title={`Voir la fiche de ${nomComplet(client)}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{nomComplet(client)}
										</Link>
									</Td>
									<Td className="text-foreground">{client.tel_principal}</Td>
									<Td>
										<BadgeType type={client.type_client} />
									</Td>
									<Td className="text-muted-foreground">
										{client.ville ?? "—"}
									</Td>
									<Td className="text-muted-foreground">
										{formatDateHeureUTC(client.date_enregistrement)}
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des clients"
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

			<ClientFormDialog
				open={formulaireOuvert === "locataire"}
				client={null}
				typeClientCree="LOCATAIRE"
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormulaireOuvert(null);
				}}
				onSaved={() => setFormulaireOuvert(null)}
			/>

			<ClientSimpleFormDialog
				open={formulaireOuvert === "client"}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormulaireOuvert(null);
				}}
				onSaved={() => setFormulaireOuvert(null)}
			/>
		</div>
	);
}
