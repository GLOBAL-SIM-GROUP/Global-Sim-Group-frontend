import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { Input } from "#/components/ui/input";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useStockAlerte } from "../hooks/use-mouvements";
import { useRapportVentes } from "../hooks/use-ventes";

/** Filtres de période reflétés dans l'URL. */
export interface StatistiquesSearch {
	du?: string;
	au?: string;
}

interface StatistiquesPageProps {
	initialSearch: StatistiquesSearch;
	onSearchChange: (
		maj: (prev: StatistiquesSearch) => StatistiquesSearch,
	) => void;
}

/** Tuile d'indicateur. */
function Indicateur({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<p className="mt-1 text-xl font-semibold text-foreground">{valeur}</p>
		</div>
	);
}

/**
 * Page « Statistiques — Market » (module Marchandise, M3) : chiffre d'affaires,
 * marge, ventes par statut, top produits et alerte stock — depuis
 * `GET /market/rapports/ventes` + `/market/stock/alerte`. Filtre de période.
 */
export function StatistiquesPage({
	initialSearch,
	onSearchChange,
}: StatistiquesPageProps) {
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const rapportQuery = useRapportVentes(du || undefined, au || undefined);
	const alerteQuery = useStockAlerte();

	const changerPeriode = (patch: { du?: string; au?: string }) => {
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		onSearchChange((prev) => ({ ...prev, ...patch }));
	};

	const rapport = rapportQuery.data;

	return (
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Produits — Market", to: "/marchandise/produits" },
					{ label: "Statistiques — Market" },
				]}
				title="Statistiques — Market"
				description="Indicateurs de performance du Market."
				actions={
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
						<Input
							type="date"
							value={du}
							onChange={(event) => changerPeriode({ du: event.target.value })}
							aria-label="Début de période"
							className="w-full sm:w-40"
						/>
						<Input
							type="date"
							value={au}
							onChange={(event) => changerPeriode({ au: event.target.value })}
							aria-label="Fin de période"
							className="w-full sm:w-40"
						/>
						<Button
							variant="outline"
							size="sm"
							asChild
							className="w-full justify-center sm:w-auto"
						>
							<Link to="/marchandise/ventes">Ventes</Link>
						</Button>
					</div>
				}
			/>

			{rapportQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : rapportQuery.isError || !rapport ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les statistiques.</p>
				</div>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-3">
						<Indicateur
							label="Chiffre d'affaires"
							valeur={formatMontantFCFA(rapport.ca_total)}
						/>
						<Indicateur
							label="Marge estimée"
							valeur={formatMontantFCFA(rapport.marge_totale)}
						/>
						<Indicateur label="Nombre de ventes" valeur={rapport.nb_ventes} />
					</div>

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-foreground">
							Ventes par statut
						</h2>
						<TableShell>
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>STATUT</Th>
										<Th>NB VENTES</Th>
										<Th>CA</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{rapport.par_type.map((entree) => (
										<Tr key={entree.statut}>
											<Td className="text-foreground">{entree.statut}</Td>
											<Td className="text-foreground">{entree.nb_ventes}</Td>
											<Td className="text-foreground">
												{formatMontantFCFA(entree.ca)}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</TableShell>
					</section>

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-foreground">
							Top produits les plus vendus
						</h2>
						<TableShell>
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>PRODUIT</Th>
										<Th>QUANTITÉ</Th>
										<Th>CA</Th>
										<Th>MARGE</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{rapport.top_produits.map((produit) => (
										<Tr key={produit.libelle}>
											<Td className="text-foreground">{produit.libelle}</Td>
											<Td className="text-foreground">{produit.quantite}</Td>
											<Td className="text-foreground">
												{formatMontantFCFA(produit.ca)}
											</Td>
											<Td className="text-foreground">
												{formatMontantFCFA(produit.marge)}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</TableShell>
					</section>

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-foreground">
							Produits en alerte (stock &lt; seuil)
						</h2>
						{alerteQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">Chargement…</p>
						) : (alerteQuery.data ?? []).length === 0 ? (
							<EmptyState title="Aucun produit en alerte." />
						) : (
							<ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
								{(alerteQuery.data ?? []).map((produit) => (
									<li
										key={produit.reference}
										className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
									>
										<span className="text-foreground">{produit.nom}</span>
										<Badge
											variant={
												Number(produit.quantite_stock) <= 0
													? "danger"
													: "warning"
											}
										>
											{produit.niveau}
										</Badge>
									</li>
								))}
							</ul>
						)}
					</section>
				</>
			)}
		</div>
	);
}
