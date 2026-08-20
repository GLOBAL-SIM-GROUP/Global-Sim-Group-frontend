import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

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
import { formatDateHeureISO } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

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
	const couleur =
		type === "LOCATAIRE"
			? "bg-[#2E86C1] text-white"
			: type === "PASSAGE"
				? "bg-[#E67E22] text-white"
				: "bg-[#95A5A6] text-white";
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
				couleur,
			)}
		>
			{libelle}
		</span>
	);
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
	const clientsQuery = useClients();

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [type, setType] = useState(initialSearch.type ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);

	const changerFiltre = (patch: { recherche?: string; type?: string }) => {
		setRecherche(patch.recherche ?? recherche);
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
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Locataires et clients" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Locataires et clients
					</h1>
					<p className="text-muted-foreground">
						Fiches des locataires et clients de passage.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un client
					</Button>
				) : null}
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Input
					value={recherche}
					onChange={(event) => changerFiltre({ recherche: event.target.value })}
					placeholder="Rechercher par nom, prénom, téléphone…"
					aria-label="Rechercher"
					className="w-64"
				/>
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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun client trouvé.
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
									TÉLÉPHONE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									TYPE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									VILLE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ENREGISTRÉ
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((client) => (
								<tr
									key={client.id}
									className="relative border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3">
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/client/clients/$id"
											params={{ id: client.id }}
											title={`Voir la fiche de ${nomComplet(client)}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{nomComplet(client)}
										</Link>
									</td>
									<td className="px-4 py-3 text-foreground">
										{client.tel_principal}
									</td>
									<td className="px-4 py-3">
										<BadgeType type={client.type_client} />
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{client.ville ?? "—"}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(client.date_enregistrement)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
				open={formOuvert}
				client={null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>
		</div>
	);
}
