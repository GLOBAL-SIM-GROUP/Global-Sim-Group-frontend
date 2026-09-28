import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { obtenirRevenusParUtilisateur } from "../api/caisses";
import { useMesCaisses } from "../hooks/use-mes-caisses";

/**
 * Page "Revenus par utilisateur" — agrégation des montants encaissés par chaque
 * employé, filtrée optionnellement par caisse et période.
 * Utilise GET /api/v1/finances/paiements-par-utilisateur (backend-scopé).
 */
export function RevenusUtilisateurPage() {
	const canVoir = useCan("FINANCES.VOIR");
	const { data: caisses = [] } = useMesCaisses();
	const [du, setDu] = useState("");
	const [au, setAu] = useState("");
	const [idCaisse, setIdCaisse] = useState("");

	// Résolution de caisse : caissier scopé à une seule, admin choisit
	const caisseScopee = caisses.length === 1 ? caisses[0].id_caisse : null;
	const idCaisseEffectif = caisseScopee || idCaisse;

	const { data: revenus = [], isLoading } = useQuery({
		queryKey: ["finances", "revenus-utilisateur", idCaisseEffectif, du, au],
		queryFn: () =>
			obtenirRevenusParUtilisateur(idCaisseEffectif || undefined, du, au),
		enabled: canVoir && !!idCaisseEffectif,
	});

	const totalMontant = revenus.reduce(
		(sum, rev) => sum + Number(rev.montant_total),
		0,
	);
	const totalPaiements = revenus.reduce(
		(sum, rev) => sum + rev.nombre_paiements,
		0,
	);

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux revenus par employé.
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Finances", to: "/finances/tableau-de-bord" },
					{ label: "Revenus par employé" },
				]}
				title="Revenus par employé"
				description="Montants encaissés/décaissés par chaque utilisateur — suivi détaillé des contributions par période et caisse"
			/>

			{caisseScopee && (
				<div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100">
					Données filtrées par votre caisse assignée
				</div>
			)}

			{/* Filtres */}
			<div className="space-y-3 rounded-lg border border-border bg-card p-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{!caisseScopee && (
						<div>
							<label
								htmlFor="revenus-filtre-caisse"
								className="block text-xs font-medium text-muted-foreground mb-1"
							>
								Caisse
							</label>
							<select
								id="revenus-filtre-caisse"
								value={idCaisse}
								onChange={(e) => setIdCaisse(e.target.value)}
								className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
							>
								<option value="">Toutes les caisses</option>
								{caisses.map((c) => (
									<option key={c.id_caisse} value={c.id_caisse}>
										{c.libelle}
									</option>
								))}
							</select>
						</div>
					)}

					<div>
						<label
							htmlFor="du"
							className="block text-xs font-medium text-muted-foreground mb-1"
						>
							Début
						</label>
						<input
							id="du"
							type="date"
							value={du}
							onChange={(e) => setDu(e.target.value)}
							className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
						/>
					</div>
					<div>
						<label
							htmlFor="au"
							className="block text-xs font-medium text-muted-foreground mb-1"
						>
							Fin
						</label>
						<input
							id="au"
							type="date"
							value={au}
							onChange={(e) => setAu(e.target.value)}
							className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
						/>
					</div>
				</div>
			</div>

			{/* Indicateurs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
						Montant total
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(String(totalMontant))}
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						agrégé par utilisateur
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
						Nombre de paiements
					</div>
					<div className="text-2xl font-bold text-foreground">
						{totalPaiements}
					</div>
					<p className="text-xs text-muted-foreground mt-2">transactions</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
						Nombre d'employés
					</div>
					<div className="text-2xl font-bold text-foreground">
						{revenus.length}
					</div>
					<p className="text-xs text-muted-foreground mt-2">ayant encaissé</p>
				</div>
			</div>

			{/* Tableau */}
			<div className="rounded-lg border border-border bg-card shadow-sm">
				<div className="border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						Détail par employé
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Montant total et nombre de paiements par utilisateur
					</p>
				</div>

				{isLoading ? (
					<div className="text-center py-12 text-muted-foreground">
						Chargement des données…
					</div>
				) : revenus.length > 0 ? (
					<TableShell>
						<DataTable>
							<DataTableHead>
								<tr>
									<Th>EMPLOYÉ</Th>
									<Th className="text-right">TOTAL</Th>
									<Th className="text-right">NB PAIEMENTS</Th>
									<Th className="text-right">MONTANT MOYEN</Th>
								</tr>
							</DataTableHead>
							<tbody>
								{revenus
									.sort(
										(a, b) => Number(b.montant_total) - Number(a.montant_total),
									)
									.map((rev, idx) => {
										const montantMoyen =
											Number(rev.montant_total) / rev.nombre_paiements;
										return (
											<Tr
												key={rev.id_utilisateur}
												className={cn(
													idx === 0 && "bg-green-50/30 dark:bg-green-950/20",
												)}
											>
												<Td className="font-medium text-foreground">
													{rev.login}
													{idx === 0 && (
														<Badge variant="success" className="ml-2">
															Top
														</Badge>
													)}
												</Td>
												<Td className="text-right font-semibold text-foreground">
													{formatMontantFCFA(String(rev.montant_total))}
												</Td>
												<Td className="text-right text-muted-foreground">
													{rev.nombre_paiements}
												</Td>
												<Td className="text-right text-muted-foreground">
													{formatMontantFCFA(montantMoyen.toString())}
												</Td>
											</Tr>
										);
									})}
							</tbody>
						</DataTable>
					</TableShell>
				) : (
					<div className="py-12">
						<EmptyState title="Aucun paiement trouvé pour ces critères." />
					</div>
				)}
			</div>
		</div>
	);
}
