import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Power, PowerOff } from "lucide-react";
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
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Restaurant", to: "/restaurant/commandes" },
					{ label: "Plats — Restaurant" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Plats — Restaurant
					</h1>
					<p className="text-muted-foreground">
						Carte des plats et boissons du menu.
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link to="/restaurant/commandes">Commandes</Link>
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to="/restaurant/statistiques">Statistiques</Link>
					</Button>
					{canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter un plat
						</Button>
					) : null}
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select
					value={categorie}
					onValueChange={(v) => changerFiltre({ categorie: v })}
				>
					<SelectTrigger aria-label="Catégorie" className="w-44">
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
					<SelectTrigger aria-label="Disponibilité" className="w-44">
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
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									NOM
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									CATÉGORIE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									PRIX
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DISPONIBLE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DESCRIPTION
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((plat) => (
								<tr
									key={plat.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{plat.nom}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{categorieParId.get(plat.id_categorie_plat ?? "") ?? "—"}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(plat.prix)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												plat.disponible
													? "bg-[#27AE60] text-white"
													: "bg-[#95A5A6] text-white",
											)}
										>
											{plat.disponible ? "Oui" : "Non"}
										</span>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{plat.description ?? "—"}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<>
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
												</>
											) : null}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des plats"
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
