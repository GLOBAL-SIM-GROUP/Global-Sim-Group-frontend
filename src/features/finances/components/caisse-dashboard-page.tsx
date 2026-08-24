import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	obtenirDashboardCaisse,
	calculerRevenusParUtilisateur,
} from "../api/caisses";

interface CaisseDashboardPageProps {
	id: string;
}

/**
 * Tableau de bord d'une caisse spécifique.
 * Affiche: revenus du jour, total, paiements bruts, revenus par utilisateur.
 */
export function CaisseDashboardPage({ id }: CaisseDashboardPageProps) {
	const { data: dashboard, isLoading } = useQuery({
		queryKey: ["caisse-dashboard", id],
		queryFn: () => obtenirDashboardCaisse(id),
	});

	const revenusParUser = dashboard
		? calculerRevenusParUtilisateur(dashboard)
		: [];

	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				Chargement…
			</div>
		);
	}

	if (!dashboard) {
		return (
			<div className="p-6 text-center text-destructive">
				Caisse non trouvée
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					asChild
					variant="ghost"
					size="sm"
				>
					<Link to="/finances/caisses">
						<ArrowLeft className="size-4 mr-2" />
						Retour aux caisses
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold text-foreground">
						{dashboard.libelle}
					</h1>
					<p className="text-sm text-muted-foreground">
						Activité: {dashboard.id_activite}
					</p>
				</div>
			</div>

			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Revenus aujourd'hui
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(dashboard.revenus_jour)}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total paiements
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(dashboard.total_paiements)}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total dépenses
					</div>
					<div className="text-2xl font-bold text-destructive">
						{formatMontantFCFA(dashboard.total_depenses)}
					</div>
				</div>
			</div>

			{/* Revenus par utilisateur */}
			<div className="rounded-lg border border-border bg-card shadow-sm">
				<div className="border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground flex items-center gap-2">
						<Users className="size-5" />
						Revenus par employé
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Montant total encaissé par chaque utilisateur
					</p>
				</div>
				<div className="px-6 py-4">
					{revenusParUser.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											EMPLOYÉ
										</th>
										<th scope="col" className="px-4 py-3 text-right font-medium">
											MONTANT TOTAL
										</th>
										<th scope="col" className="px-4 py-3 text-right font-medium">
											NB PAIEMENTS
										</th>
									</tr>
								</thead>
								<tbody>
									{revenusParUser.map((rev) => (
										<tr
											key={rev.id_utilisateur}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3 font-medium text-foreground">
												{rev.login}
											</td>
											<td className="px-4 py-3 text-right font-semibold text-foreground">
												{formatMontantFCFA(rev.montant_total)}
											</td>
											<td className="px-4 py-3 text-right text-muted-foreground">
												{rev.nombre_paiements}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement pour cette caisse
						</div>
					)}
				</div>
			</div>

			{/* Paiements bruts */}
			<div className="rounded-lg border border-border bg-card shadow-sm">
				<div className="border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						Tous les paiements
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Liste détaillée de tous les paiements de cette caisse
					</p>
				</div>
				<div className="px-6 py-4">
					{dashboard.paiements_details && dashboard.paiements_details.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											DATE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											RÉFÉRENCE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											MONTANT
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											TYPE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											MOTIF
										</th>
									</tr>
								</thead>
								<tbody>
									{dashboard.paiements_details.map((paiement) => (
										<tr
											key={paiement.id}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3 text-muted-foreground">
												{formatDateHeureISO(paiement.date)}
											</td>
											<td className="px-4 py-3 font-medium">
												{paiement.reference ?? "—"}
											</td>
											<td className="px-4 py-3 font-semibold text-foreground">
												{formatMontantFCFA(paiement.montant)}
											</td>
											<td className="px-4 py-3">
												<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
													{paiement.type}
												</span>
											</td>
											<td className="px-4 py-3 text-muted-foreground">
												{paiement.motif ?? "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement trouvé
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
