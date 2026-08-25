import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { obtenirDashboardCaisse } from "../api/caisses";
import { cn } from "#/lib/utils";

export function CaissierDashboardPage() {
	const { id } = useParams({ from: "/_authenticated/finances/caissier/$id/dashboard" });

	const { data: dashboard, isLoading, error } = useQuery({
		queryKey: ["caisse-dashboard", id],
		queryFn: () => obtenirDashboardCaisse(id),
		enabled: !!id,
	});

	if (!dashboard) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				{isLoading ? "Chargement du dashboard…" : "Impossible de charger le dashboard"}
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Ma caisse" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					{dashboard.libelle}
				</h1>
				<p className="text-muted-foreground">
					{dashboard.activite_libelle || `Activité ${dashboard.id_activite}`}
				</p>
			</section>

			{/* Indicateurs */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Revenus du jour
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(dashboard.revenus_jour.toString())}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total paiements
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(dashboard.total_paiements.toString())}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total dépenses
					</div>
					<div className="text-2xl font-bold text-destructive">
						{formatMontantFCFA(dashboard.total_depenses.toString())}
					</div>
				</div>
			</div>

			{/* Actions rapides */}
			<div className="flex flex-wrap gap-2">
				<Button asChild>
					<a href={`/finances/caissier/${id}/tirages`}>
						Faire un tirage
					</a>
				</Button>
			</div>

			{/* Détail des paiements */}
			{dashboard.paiements_details && dashboard.paiements_details.length > 0 ? (
				<div className="rounded-lg border border-border bg-card shadow-sm">
					<div className="border-b border-border px-6 py-4">
						<h2 className="text-base font-semibold text-foreground">
							Paiements du jour
						</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-6 py-3 font-medium">
										DATE
									</th>
									<th scope="col" className="px-6 py-3 font-medium">
										TYPE
									</th>
									<th scope="col" className="px-6 py-3 font-medium">
										MOTIF
									</th>
									<th scope="col" className="px-6 py-3 text-right font-medium">
										MONTANT
									</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.paiements_details.map((p) => (
									<tr
										key={p.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-6 py-3 text-muted-foreground">
											{new Date(p.date).toLocaleDateString("fr-FR")}
										</td>
										<td className="px-6 py-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
													p.type === "ENCAISSEMENT"
														? "bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
														: "bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
												)}
											>
												{p.type}
											</span>
										</td>
										<td className="px-6 py-3 text-muted-foreground">
											{p.motif || "—"}
										</td>
										<td className="px-6 py-3 text-right font-semibold">
											{formatMontantFCFA(p.montant.toString())}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun paiement enregistré aujourd'hui
				</div>
			)}
		</div>
	);
}
