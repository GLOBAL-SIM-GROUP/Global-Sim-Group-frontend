import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Breadcrumb } from "#/components/ui/breadcrumb";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { listerCaisses, obtenirRevenusParUtilisateur } from "../api/caisses";
import { useCurrentCaisse } from "../hooks/use-current-caisse";

/**
 * Page "Revenus par utilisateur" — agrégation des montants encaissés par chaque
 * employé, filtrée optionnellement par caisse et période.
 */
export function RevenusUtilisateurPage() {
	const userCaisse = useCurrentCaisse();
	const [du, setDu] = useState("");
	const [au, setAu] = useState("");
	const [idCaisse, setIdCaisse] = useState(userCaisse ?? "");

	const { data: caisses = [] } = useQuery({
		queryKey: ["caisses"],
		queryFn: () => listerCaisses(),
	});

	const { data: revenus = [], isLoading } = useQuery({
		queryKey: ["revenus-utilisateur", idCaisse || userCaisse, du, au],
		queryFn: () =>
			obtenirRevenusParUtilisateur(idCaisse || userCaisse, du, au),
		enabled: !!(idCaisse || userCaisse),
	});

	const totalMontant = revenus.reduce(
		(sum, rev) => sum + Number(rev.montant_total),
		0,
	);
	const totalPaiements = revenus.reduce(
		(sum, rev) => sum + rev.nombre_paiements,
		0,
	);

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
					Montant total encaissé par chaque utilisateur
				</p>
			</section>

			{/* Filtres */}
			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				{!userCaisse && (
					<select
						value={idCaisse}
						onChange={(e) => setIdCaisse(e.target.value)}
						className="h-9 rounded-md border border-input bg-background px-3 text-sm"
					>
						<option value="">Toutes les caisses</option>
						{caisses.map((c) => (
							<option key={c.id_caisse} value={c.id_caisse}>
								{c.libelle}
							</option>
						))}
					</select>
				)}

				<input
					type="date"
					value={du}
					onChange={(e) => setDu(e.target.value)}
					aria-label="Début de période"
					className="h-9 rounded-md border border-input bg-background px-3 text-sm w-40"
				/>
				<input
					type="date"
					value={au}
					onChange={(e) => setAu(e.target.value)}
					aria-label="Fin de période"
					className="h-9 rounded-md border border-input bg-background px-3 text-sm w-40"
				/>
			</div>

			{/* Résumé */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Montant total
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(totalMontant)}
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						{revenus.length} employé(s)
					</p>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total paiements
					</div>
					<div className="text-2xl font-bold text-foreground">
						{totalPaiements}
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						paiements effectués
					</p>
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
					<div className="text-center py-8 text-muted-foreground">
						Chargement…
					</div>
				) : revenus.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-6 py-3 font-medium">
										EMPLOYÉ
									</th>
									<th scope="col" className="px-6 py-3 text-right font-medium">
										MONTANT TOTAL
									</th>
									<th scope="col" className="px-6 py-3 text-right font-medium">
										NB PAIEMENTS
									</th>
									<th scope="col" className="px-6 py-3 text-right font-medium">
										MONTANT MOYEN
									</th>
								</tr>
							</thead>
							<tbody>
								{revenus
									.sort(
										(a, b) =>
											Number(b.montant_total) -
											Number(a.montant_total),
									)
									.map((rev) => (
										<tr
											key={rev.id_utilisateur}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-6 py-3 font-medium text-foreground">
												{rev.login}
											</td>
											<td className="px-6 py-3 text-right font-semibold text-foreground">
												{formatMontantFCFA(rev.montant_total)}
											</td>
											<td className="px-6 py-3 text-right text-muted-foreground">
												{rev.nombre_paiements}
											</td>
											<td className="px-6 py-3 text-right text-muted-foreground">
												{formatMontantFCFA(
													Number(rev.montant_total) /
														rev.nombre_paiements,
												)}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						Aucun paiement trouvé pour ces critères.
					</div>
				)}
			</div>
		</div>
	);
}
