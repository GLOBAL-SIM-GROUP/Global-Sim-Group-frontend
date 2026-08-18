import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

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
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Produits — Market", to: "/marchandise/produits" },
					{ label: "Statistiques — Market" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Statistiques — Market
					</h1>
					<p className="text-muted-foreground">
						Indicateurs de performance du Market.
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Input
						type="date"
						value={du}
						onChange={(event) => changerPeriode({ du: event.target.value })}
						aria-label="Début de période"
						className="w-40"
					/>
					<Input
						type="date"
						value={au}
						onChange={(event) => changerPeriode({ au: event.target.value })}
						aria-label="Fin de période"
						className="w-40"
					/>
					<Button variant="outline" size="sm" asChild>
						<Link to="/marchandise/ventes">Ventes</Link>
					</Button>
				</div>
			</div>

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
						<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											STATUT
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											NB VENTES
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											CA
										</th>
									</tr>
								</thead>
								<tbody>
									{rapport.par_type.map((entree) => (
										<tr key={entree.statut} className="border-t border-border">
											<td className="px-4 py-3 text-foreground">
												{entree.statut}
											</td>
											<td className="px-4 py-3 text-foreground">
												{entree.nb_ventes}
											</td>
											<td className="px-4 py-3 text-foreground">
												{formatMontantFCFA(entree.ca)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-foreground">
							Top produits les plus vendus
						</h2>
						<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											PRODUIT
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											QUANTITÉ
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											CA
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											MARGE
										</th>
									</tr>
								</thead>
								<tbody>
									{rapport.top_produits.map((produit) => (
										<tr
											key={produit.libelle}
											className="border-t border-border"
										>
											<td className="px-4 py-3 text-foreground">
												{produit.libelle}
											</td>
											<td className="px-4 py-3 text-foreground">
												{produit.quantite}
											</td>
											<td className="px-4 py-3 text-foreground">
												{formatMontantFCFA(produit.ca)}
											</td>
											<td className="px-4 py-3 text-foreground">
												{formatMontantFCFA(produit.marge)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-foreground">
							Produits en alerte (stock &lt; seuil)
						</h2>
						{alerteQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">Chargement…</p>
						) : (alerteQuery.data ?? []).length === 0 ? (
							<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
								Aucun produit en alerte.
							</p>
						) : (
							<ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
								{(alerteQuery.data ?? []).map((produit) => (
									<li
										key={produit.reference}
										className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
									>
										<span className="text-foreground">{produit.nom}</span>
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												Number(produit.quantite_stock) <= 0
													? "bg-[#E74C3C] text-white"
													: "bg-[#E67E22] text-white",
											)}
										>
											{produit.niveau}
										</span>
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
