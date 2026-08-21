import { Link } from "@tanstack/react-router";
import { Image as ImageIcon, Pencil, Plus, Power, PowerOff } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import {
	useCategoriesPlats,
	useModifierPlat,
	usePlats,
} from "../hooks/use-plats";
import { filtrerPlats, type Plat, paginerPlats } from "../models/plats";
import { PLATS_PAGE_SIZE } from "../permissions";
import { PlatFormDialog } from "./plat-form-dialog";

/** Filtres reflétés dans l'URL. */
export interface PlatsSearch {
	categorie?: string;
	dispo?: string;
	page?: number;
}

interface PlatsPageProps {
	initialSearch: PlatsSearch;
	onSearchChange: (maj: (prev: PlatsSearch) => PlatsSearch) => void;
}

/**
 * Page « Plats — Restaurant » (module Restaurant, M5) : carte des plats et
 * boissons, filtres Catégorie/Disponibilité, « Ajouter un plat », Modifier et
 * Activer/Désactiver.
 */
export function PlatsPage({ initialSearch, onSearchChange }: PlatsPageProps) {
	const canCreer = useCan("RESTAURANT.CREER");
	const canModifier = useCan("RESTAURANT.MODIFIER");

	const platsQuery = usePlats();
	const categoriesQuery = useCategoriesPlats();
	const toggleMutation = useModifierPlat();

	const [categorie, setCategorie] = useState(initialSearch.categorie ?? "tous");
	const [dispo, setDispo] = useState(initialSearch.dispo ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Plat | null>(null);

	const changerFiltre = (patch: { categorie?: string; dispo?: string }) => {
		setCategorie(patch.categorie ?? categorie);
		setDispo(patch.dispo ?? dispo);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerPlats(platsQuery.data ?? [], { categorie, dispo });
	const pagination = paginerPlats(filtres, page, PLATS_PAGE_SIZE);
	const categorieParId = new Map(
		(categoriesQuery.data ?? []).map((c) => [c.id, c.libelle]),
	);
	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Restaurant", to: "/restaurant/commandes" },
					{ label: "Plats — Restaurant" },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
						Plats — Restaurant
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Carte des plats et boissons du menu.
					</p>
				</section>

				<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
					<Button variant="outline" size="sm" asChild className="w-full sm:w-auto justify-center">
						<Link to="/restaurant/commandes">Commandes</Link>
					</Button>
					<Button variant="outline" size="sm" asChild className="w-full sm:w-auto justify-center">
						<Link to="/restaurant/statistiques">Statistiques</Link>
					</Button>
					{canCreer ? (
						<Button onClick={() => setFormOuvert(true)} className="w-full sm:w-auto justify-center">
							<Plus className="size-4" aria-hidden />
							Ajouter un plat
						</Button>
					) : null}
				</div>
			</div>

			<div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
				<Select
					value={categorie}
					onValueChange={(v) => changerFiltre({ categorie: v })}
				>
					<SelectTrigger aria-label="Catégorie" className="w-full sm:w-44">
						<SelectValue placeholder="Catégorie" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Toutes les catégories</SelectItem>
						{(categoriesQuery.data ?? []).map((c) => (
							<SelectItem key={c.id} value={c.id}>
								{c.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={dispo}
					onValueChange={(v) => changerFiltre({ dispo: v })}
				>
					<SelectTrigger aria-label="Disponibilité" className="w-full sm:w-44">
						<SelectValue placeholder="Disponibilité" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous</SelectItem>
						<SelectItem value="disponibles">Disponibles uniquement</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{platsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : platsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les plats.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void platsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.items.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun plat trouvé.
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{pagination.items.map((plat) => (
						<div
							key={plat.id}
							className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
						>
							<PlatImageDisplay
								imageKey={plat.image_url}
								nomPlat={plat.nom}
								indisponible={!plat.disponible}
							/>

							<div className="space-y-3 p-4">
								<div>
									<h3 className="font-semibold text-foreground">
										{plat.nom}
									</h3>
									<p className="text-xs text-muted-foreground">
										{categorieParId.get(plat.id_categorie_plat ?? "") ?? "—"}
									</p>
								</div>

								<div className="space-y-1">
									<p className="text-lg font-bold text-primary">
										{formatMontantFCFA(plat.prix)}
									</p>
									{plat.description && (
										<p className="line-clamp-2 text-xs text-muted-foreground">
											{plat.description}
										</p>
									)}
								</div>

								{canModifier && (
									<div className="flex items-center justify-end gap-1 border-t border-border pt-3">
										<Button
											variant="ghost"
											size="icon-sm"
											title="Modifier"
											onClick={() => setAModifier(plat)}
										>
											<Pencil className="size-4" aria-hidden />
											<span className="sr-only">Modifier</span>
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											title={plat.disponible ? "Désactiver" : "Activer"}
											onClick={() =>
												toggleMutation.mutate({
													id: plat.id,
													nom: plat.nom,
													prix: plat.prix,
													disponible: !plat.disponible,
												})
											}
										>
											{plat.disponible ? (
												<PowerOff className="size-4" aria-hidden />
											) : (
												<Power className="size-4" aria-hidden />
											)}
											<span className="sr-only">
												{plat.disponible ? "Désactiver" : "Activer"}
											</span>
										</Button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des plats"
					className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
				>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Affichage de {pagination.start} à {pagination.end} sur{" "}
						{pagination.total} résultats
					</p>
					<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page <= 1}
							onClick={() => allerPage(pagination.page - 1)}
							className="w-full sm:w-auto"
						>
							Précédent
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => allerPage(pagination.page + 1)}
							className="w-full sm:w-auto"
						>
							Suivant
						</Button>
					</div>
				</nav>
			) : null}

			<PlatFormDialog
				open={formOuvert || aModifier !== null}
				plat={aModifier}
				categories={categoriesQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>
		</div>
	);
}

/** Composant pour afficher une image de plat avec authentification */
function PlatImageDisplay({
	imageKey,
	nomPlat,
	indisponible,
}: {
	imageKey: string | null | undefined;
	nomPlat: string;
	indisponible: boolean;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(imageKey);

	return (
		<div className="relative h-48 w-full overflow-hidden bg-muted">
			{isLoading ? (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sea-ink/10 to-lagoon/10">
					<div className="text-xs text-muted-foreground">Chargement…</div>
				</div>
			) : blobUrl ? (
				<img
					src={blobUrl}
					alt={nomPlat}
					className="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sea-ink/10 to-lagoon/10">
					<ImageIcon className="size-12 text-muted-foreground/50" aria-hidden />
				</div>
			)}
			{indisponible && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
					<span className="text-sm font-semibold text-white">
						Indisponible
					</span>
				</div>
			)}
		</div>
	);
}
