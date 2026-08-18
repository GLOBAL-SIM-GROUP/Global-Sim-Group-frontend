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
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { useEmployes, useModifierEmploye } from "../hooks/use-employes";
import { useServices } from "../hooks/use-services";
import {
	EMPLOYE_STATUT_BADGE,
	EMPLOYE_STATUT_LABELS,
	type Employe,
	type EmployeStatut,
	filtrerEmployes,
	nomCompletEmploye,
	paginerEmployes,
} from "../models/employes";
import { EMPLOYES_PAGE_SIZE } from "../permissions";
import { EmployeFormDialog } from "./employe-form-dialog";

/** Filtres/pagination reflétés dans l'URL. */
export interface EmployesSearch {
	service?: string;
	statut?: string;
	page?: number;
}

interface EmployesPageProps {
	initialSearch: EmployesSearch;
	onSearchChange: (maj: (prev: EmployesSearch) => EmployesSearch) => void;
}

/**
 * Page « Employés — RH » (M9.1) : liste des employés, filtres Service/Statut,
 * « Ajouter un employé », lignes cliquables vers la fiche et actions Modifier /
 * Activer-Désactiver.
 */
export function EmployesPage({
	initialSearch,
	onSearchChange,
}: EmployesPageProps) {
	const canCreer = useCan("RH.CREER");
	const canModifier = useCan("RH.MODIFIER");

	const employesQuery = useEmployes();
	const servicesQuery = useServices();
	const modifierMutation = useModifierEmploye();

	const [service, setService] = useState(initialSearch.service ?? "tous");
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Employe | null>(null);

	const changerFiltre = (patch: { service?: string; statut?: string }) => {
		setService(patch.service ?? service);
		setStatut(patch.statut ?? statut);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const fermerFormulaire = () => {
		setFormOuvert(false);
		setAModifier(null);
	};

	const employes = employesQuery.data ?? [];
	const filtres = filtrerEmployes(employes, { service, statut });
	const pagination = paginerEmployes(filtres, page, EMPLOYES_PAGE_SIZE);
	const services = servicesQuery.data ?? [];

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Employés — RH" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Employés — RH
					</h1>
					<p className="text-muted-foreground">
						Liste des employés et leur statut.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter un employé
					</Button>
				) : null}
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select
					value={service}
					onValueChange={(valeur) => changerFiltre({ service: valeur })}
				>
					<SelectTrigger aria-label="Service" className="w-52">
						<SelectValue placeholder="Service" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les services</SelectItem>
						{services.map((s) => (
							<SelectItem key={s.id} value={s.id}>
								{s.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={statut}
					onValueChange={(valeur) => changerFiltre({ statut: valeur })}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						{(Object.keys(EMPLOYE_STATUT_LABELS) as EmployeStatut[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{EMPLOYE_STATUT_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
			</div>

			{employesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : employesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les employés.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void employesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun employé trouvé.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									EMPLOYÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									FONCTION
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									SERVICE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									EMBAUCHE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									SALAIRE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((employe) => (
								<tr
									key={employe.id}
									className="relative border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3">
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/rh/employes/$id"
											params={{ id: employe.id }}
											title={`Voir la fiche de ${nomCompletEmploye(employe)}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{nomCompletEmploye(employe)}
										</Link>
									</td>
									<td className="px-4 py-3 text-foreground">
										{employe.fonction}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{employe.service_libelle ?? "—"}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateISO(employe.date_embauche)}
									</td>
									<td className="px-4 py-3 text-right text-foreground">
										{formatMontantFCFA(employe.salaire_base)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												EMPLOYE_STATUT_BADGE[employe.statut],
											)}
										>
											{EMPLOYE_STATUT_LABELS[employe.statut]}
										</span>
									</td>
									<td className="relative z-10 px-4 py-3">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<>
													<Button
														variant="ghost"
														size="icon-sm"
														title="Modifier"
														onClick={() => setAModifier(employe)}
													>
														<Pencil className="size-4" aria-hidden />
														<span className="sr-only">Modifier</span>
													</Button>
													<Button
														variant="ghost"
														size="icon-sm"
														title={
															employe.statut === "ACTIF"
																? "Désactiver"
																: "Activer"
														}
														onClick={() =>
															modifierMutation.mutate({
																id: employe.id,
																statut:
																	employe.statut === "ACTIF"
																		? "INACTIF"
																		: "ACTIF",
															})
														}
													>
														{employe.statut === "ACTIF" ? (
															<PowerOff
																className="size-4 text-destructive"
																aria-hidden
															/>
														) : (
															<Power
																className="size-4 text-lagoon"
																aria-hidden
															/>
														)}
														<span className="sr-only">
															{employe.statut === "ACTIF"
																? "Désactiver"
																: "Activer"}
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
					aria-label="Pagination des employés"
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

			<EmployeFormDialog
				open={formOuvert || aModifier !== null}
				employe={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) fermerFormulaire();
				}}
				onSaved={fermerFormulaire}
			/>
		</div>
	);
}
