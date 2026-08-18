import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useRapportVentes } from "../hooks/use-commandes";

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

/**
 * Page « Statistiques — Restaurant » (module Restaurant, M5) : chiffre
 * d'affaires (calculé depuis le rapport), top des plats les plus vendus et
 * filtre de période. La répartition par type et les graphiques ne sont pas
 * exposés par le backend → omis.
 */
export function StatistiquesPage({
	initialSearch,
	onSearchChange,
}: StatistiquesPageProps) {
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const rapportQuery = useRapportVentes(du || undefined, au || undefined);

	const changerPeriode = (patch: { du?: string; au?: string }) => {
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		onSearchChange((prev) => ({ ...prev, ...patch }));
	};

	const rapport = rapportQuery.data ?? [];
	const caTotal = useMemo(
		() =>
			rapport.reduce(
				(somme, ligne) => somme + (Number(ligne.chiffre_affaire) || 0),
				0,
			),
		[rapport],
	);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Restaurant", to: "/restaurant/commandes" },
					{ label: "Statistiques — Restaurant" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Statistiques — Restaurant
					</h1>
					<p className="text-muted-foreground">
						Chiffre d'affaires et plats les plus vendus.
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
						<Link to="/restaurant/commandes">Commandes</Link>
					</Button>
				</div>
			</div>

			{rapportQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : rapportQuery.isError ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les statistiques.</p>
				</div>
			) : (
				<>
					<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
						<p className="text-xs font-medium text-muted-foreground">
							Chiffre d'affaires (période)
						</p>
						<p className="mt-1 text-xl font-semibold text-foreground">
							{formatMontantFCFA(String(caTotal))}
						</p>
					</div>

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-foreground">
							Top des plats les plus vendus
						</h2>
						{rapport.length === 0 ? (
							<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
								Aucune vente sur la période.
							</p>
						) : (
							<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
								<table className="w-full border-collapse text-sm">
									<thead className="bg-sea-ink text-left text-white">
										<tr>
											<th scope="col" className="px-4 py-3 font-medium">
												PLAT
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												QUANTITÉ VENDUE
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												CHIFFRE D'AFFAIRES
											</th>
										</tr>
									</thead>
									<tbody>
										{rapport.map((ligne) => (
											<tr key={ligne.plat} className="border-t border-border">
												<td className="px-4 py-3 text-foreground">
													{ligne.plat}
												</td>
												<td className="px-4 py-3 text-foreground">
													{ligne.quantite_vendue}
												</td>
												<td className="px-4 py-3 text-foreground">
													{formatMontantFCFA(ligne.chiffre_affaire)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</>
			)}
		</div>
	);
}
