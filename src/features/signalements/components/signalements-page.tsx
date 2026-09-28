import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";

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
import type { ModuleCible } from "#/core/api/signalements";
import { useCan } from "#/core/auth";
import { formatDateHeureUTC } from "#/features/residence/models/format";

import { useSignalements } from "../hooks/use-signalements";
import {
	filtrerSignalements,
	libelleCible,
	MODULE_CIBLE_LABELS,
	MODULES_CIBLE,
	nomDeclarant,
	paginerSignalements,
	rechercherSignalements,
	SIGNALEMENT_STATUT_LABELS,
	SIGNALEMENT_STATUT_VARIANT,
	type SignalementStatut,
} from "../models/signalements";
import { SIGNALEMENTS_PAGE_SIZE } from "../permissions";
import { SignalementFormDialog } from "./signalement-form-dialog";

export interface SignalementsSearch {
	recherche?: string;
	statut?: string;
	module_cible?: string;
	page?: number;
}

interface SignalementsPageProps {
	initialSearch?: SignalementsSearch;
	onSearchChange?: (
		update: (prev: SignalementsSearch) => SignalementsSearch,
	) => void;
}

/**
 * Page « Signalements » : liste (recherche et statut filtrés côté client,
 * pagination client ; `module_cible` envoyé au serveur) et lien
 * « Nouveau signalement ». Mêmes conventions que les autres listes de l'app
 * (tableau, badge de statut, pagination).
 */
export function SignalementsPage({
	initialSearch = {},
	onSearchChange,
}: SignalementsPageProps) {
	const navigate = useNavigate();
	const canCreer = useCan("SIGNALEMENT.CREER");

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [moduleCible, setModuleCible] = useState(
		initialSearch.module_cible ?? "tous",
	);
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);

	const signalementsQuery = useSignalements({
		moduleCible:
			moduleCible !== "tous" ? (moduleCible as ModuleCible) : undefined,
	});
	const signalements = signalementsQuery.data ?? [];

	const changerFiltre = (patch: { statut?: string; module_cible?: string }) => {
		if (patch.statut !== undefined) setStatut(patch.statut);
		if (patch.module_cible !== undefined) setModuleCible(patch.module_cible);
		setPage(1);
		onSearchChange?.((prev) => ({
			...prev,
			...patch,
			page: 1,
		}));
	};

	const changerRecherche = (terme: string) => {
		setRecherche(terme);
		setPage(1);
		onSearchChange?.((prev) => ({
			...prev,
			recherche: terme || undefined,
			page: 1,
		}));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange?.((prev) => ({ ...prev, page: pageSuivante }));
	};

	const recherchees = rechercherSignalements(signalements, recherche);
	const filtres = filtrerSignalements(recherchees, statut);
	const pagination = paginerSignalements(filtres, page, SIGNALEMENTS_PAGE_SIZE);

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Signalements" }]}
				title="Signalements"
				description="Problèmes et signalements remontés par les utilisateurs."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Nouveau signalement
						</Button>
					) : undefined
				}
			/>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Input
					value={recherche}
					onChange={(event) => changerRecherche(event.target.value)}
					placeholder="Rechercher par titre, description ou déclarant…"
					aria-label="Rechercher un signalement"
					className="w-72"
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
						{(
							Object.keys(SIGNALEMENT_STATUT_LABELS) as SignalementStatut[]
						).map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{SIGNALEMENT_STATUT_LABELS[valeur]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={moduleCible}
					onValueChange={(valeur) => changerFiltre({ module_cible: valeur })}
				>
					<SelectTrigger aria-label="Module concerné" className="w-52">
						<SelectValue placeholder="Module concerné" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les modules</SelectItem>
						{MODULES_CIBLE.map((module) => (
							<SelectItem key={module} value={module}>
								{MODULE_CIBLE_LABELS[module]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{signalementsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : signalementsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<AlertCircle className="size-5" aria-hidden />
					<p>Impossible de charger les signalements.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void signalementsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<EmptyState title="Aucun signalement trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>TITRE</Th>
								<Th>CIBLE</Th>
								<Th>DÉCLARANT</Th>
								<Th>DATE</Th>
								<Th>STATUT</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((signalement) => (
								<Tr key={signalement.id} className="relative">
									<Td>
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/signalements/$id"
											params={{ id: signalement.id }}
											title={`Voir le signalement ${signalement.titre}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{signalement.titre}
										</Link>
										<p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
											{signalement.description}
										</p>
									</Td>
									<Td>
										<Badge variant="neutral">{libelleCible(signalement)}</Badge>
									</Td>
									<Td className="text-muted-foreground">
										{nomDeclarant(signalement)}
									</Td>
									<Td className="text-muted-foreground">
										{formatDateHeureUTC(signalement.date_signalement)}
									</Td>
									<Td>
										<Badge
											variant={SIGNALEMENT_STATUT_VARIANT[signalement.statut]}
										>
											{SIGNALEMENT_STATUT_LABELS[signalement.statut]}
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
					aria-label="Pagination des signalements"
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

			<SignalementFormDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onCreated={(id) => {
					setFormOuvert(false);
					void navigate({ to: "/signalements/$id", params: { id } });
				}}
			/>
		</div>
	);
}
