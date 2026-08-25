import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
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
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Finances", to: "/finances/tableau-de-bord" },
					{ label: "Revenus par employé" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Revenus par employé
				</h1>
				<p className="text-muted-foreground">
					Montants encaissés/décaissés par chaque utilisateur — suivi détaillé
					des contributions par période et caisse
				</p>
			</section>

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
							<label className="block text-xs font-medium text-muted-foreground mb-1">
								Caisse
							</label>
							<select
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
						{formatMontantFCFA(totalMontant)}
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
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-6 py-3 font-semibold">
										EMPLOYÉ
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right font-semibold"
									>
										TOTAL
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right font-semibold"
									>
										NB PAIEMENTS
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right font-semibold"
									>
										MONTANT MOYEN
									</th>
								</tr>
							</thead>
							<tbody>
								{revenus
									.sort(
										(a, b) => Number(b.montant_total) - Number(a.montant_total),
									)
									.map((rev, idx) => {
										const montantMoyen =
											Number(rev.montant_total) / rev.nombre_paiements;
										return (
											<tr
												key={rev.id_utilisateur}
												className={cn(
													"border-t border-border transition-colors hover:bg-accent/40",
													idx === 0 && "bg-green-50/30 dark:bg-green-950/20",
												)}
											>
												<td className="px-6 py-3 font-medium text-foreground">
													{rev.login}
													{idx === 0 && (
														<span className="ml-2 inline-block text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
															Top
														</span>
													)}
												</td>
												<td className="px-6 py-3 text-right font-semibold text-foreground">
													{formatMontantFCFA(rev.montant_total)}
												</td>
												<td className="px-6 py-3 text-right text-muted-foreground">
													{rev.nombre_paiements}
												</td>
												<td className="px-6 py-3 text-right text-muted-foreground">
													{formatMontantFCFA(montantMoyen.toString())}
												</td>
											</tr>
										);
									})}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center py-12 text-muted-foreground">
						Aucun paiement trouvé pour ces critères.
					</div>
				)}
			</div>
		</div>
	);
}
