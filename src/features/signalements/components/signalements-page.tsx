import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Plus } from "lucide-react";
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

import { useSignalements } from "../hooks/use-signalements";
import {
	filtrerSignalements,
	nomDeclarant,
	paginerSignalements,
	rechercherSignalements,
	SIGNALEMENT_STATUT_BADGE,
	SIGNALEMENT_STATUT_LABELS,
	type SignalementStatut,
} from "../models/signalements";
import { SIGNALEMENTS_PAGE_SIZE } from "../permissions";
import { SignalementFormDialog } from "./signalement-form-dialog";

export interface SignalementsSearch {
	recherche?: string;
	statut?: string;
	page?: number;
}

interface SignalementsPageProps {
	initialSearch?: SignalementsSearch;
	onSearchChange?: (
		update: (prev: SignalementsSearch) => SignalementsSearch,
	) => void;
}

/**
 * Page « Signalements » : liste (recherche + statut filtrés côté client,
 * pagination client) et lien « Nouveau signalement ». Mêmes conventions que
 * les autres listes de l'app (tableau, badge de statut, pagination).
 */
export function SignalementsPage({
	initialSearch = {},
	onSearchChange,
}: SignalementsPageProps) {
	const navigate = useNavigate();
	const canCreer = useCan("SIGNALEMENT.CREER");

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);

	const signalementsQuery = useSignalements();
	const signalements = signalementsQuery.data ?? [];

	const changerFiltre = (patch: { statut?: string }) => {
		setStatut(patch.statut ?? statut);
		setPage(1);
		onSearchChange?.((prev) => ({ ...prev, ...patch, page: 1 }));
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
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Signalements" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Signalements
					</h1>
					<p className="text-muted-foreground">
						Problèmes et signalements remontés par les utilisateurs.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouveau signalement
					</Button>
				) : null}
			</div>

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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun signalement trouvé.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									TITRE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DÉCLARANT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((signalement) => (
								<tr
									key={signalement.id}
									className="relative border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3">
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
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{nomDeclarant(signalement)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(signalement.date_signalement)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												SIGNALEMENT_STATUT_BADGE[signalement.statut],
											)}
										>
											{SIGNALEMENT_STATUT_LABELS[signalement.statut]}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
