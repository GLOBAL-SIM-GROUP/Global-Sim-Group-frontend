import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Restaurant", to: "/restaurant/commandes" },
					{ label: "Statistiques — Restaurant" },
				]}
				title="Statistiques — Restaurant"
				description="Chiffre d'affaires et plats les plus vendus."
				actions={
					<div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-2">
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
							className="w-full sm:w-auto justify-center"
						>
							<Link to="/restaurant/commandes">Commandes</Link>
						</Button>
					</div>
				}
			/>

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
							<EmptyState title="Aucune vente sur la période." />
						) : (
							<TableShell>
								<DataTable>
									<DataTableHead>
										<tr>
											<Th>PLAT</Th>
											<Th>QUANTITÉ VENDUE</Th>
											<Th>CHIFFRE D'AFFAIRES</Th>
										</tr>
									</DataTableHead>
									<tbody>
										{rapport.map((ligne) => (
											<Tr key={ligne.plat}>
												<Td className="text-foreground">{ligne.plat}</Td>
												<Td className="text-foreground">
													{ligne.quantite_vendue}
												</Td>
												<Td className="text-foreground">
													{formatMontantFCFA(ligne.chiffre_affaire)}
												</Td>
											</Tr>
										))}
									</tbody>
								</DataTable>
							</TableShell>
						)}
					</section>
				</>
			)}
		</div>
	);
}
